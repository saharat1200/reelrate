// Push notification utilities for PWA
import { supabase } from './supabase';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface CreateNotificationData {
  user_id: string;
  type: 'new_review' | 'review_like' | 'review_comment';
  title: string;
  message: string;
  related_id?: string;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        ...data,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

export async function createReviewNotification(movieId: string, reviewerId: string, movieTitle: string) {
  // Get users who have favorited this movie (excluding the reviewer)
  const { data: favorites } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('movie_id', movieId)
    .neq('user_id', reviewerId);

  if (favorites && favorites.length > 0) {
    const notifications = favorites.map(fav => ({
      user_id: fav.user_id,
      type: 'new_review' as const,
      title: 'รีวิวใหม่',
      message: `มีรีวิวใหม่สำหรับหนัง "${movieTitle}"`,
      related_id: movieId,
      is_read: false,
      created_at: new Date().toISOString()
    }));

    await supabase.from('notifications').insert(notifications);
  }
}

export async function createLikeNotification(reviewId: string, likerId: string, reviewOwnerId: string) {
  if (likerId === reviewOwnerId) return; // Don't notify if user likes their own review

  await createNotification({
    user_id: reviewOwnerId,
    type: 'review_like',
    title: 'รีวิวได้รับไลค์',
    message: 'รีวิวของคุณได้รับไลค์',
    related_id: reviewId
  });
}

export async function createCommentNotification(reviewId: string, commenterId: string, reviewOwnerId: string) {
  if (commenterId === reviewOwnerId) return; // Don't notify if user comments on their own review

  await createNotification({
    user_id: reviewOwnerId,
    type: 'review_comment',
    title: 'ความคิดเห็นใหม่',
    message: 'มีคนแสดงความคิดเห็นในรีวิวของคุณ',
    related_id: reviewId
  });
}

export class NotificationManager {
  private static instance: NotificationManager;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission has been denied');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Show local notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      ...(payload.image && { image: payload.image }),
      data: payload.data,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
    };

    // Use service worker if available, otherwise use regular notification
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(payload.title, options);
    } else {
      new Notification(payload.title, options);
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          ) as BufferSource,
        });
      }

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  newReview: (movieTitle: string, rating: number): NotificationPayload => ({
    title: 'รีวิวใหม่!',
    body: `มีรีวิวใหม่สำหรับ "${movieTitle}" คะแนน ${rating}/10`,
    icon: '/icons/icon-192x192.png',
    tag: 'new-review',
    data: { type: 'new-review', movieTitle, rating },
    actions: [
      {
        action: 'view',
        title: 'ดูรีวิว',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'ปิด',
        icon: '/icons/close-icon.png',
      },
    ],
  }),

  favoriteUpdate: (title: string, type: 'movie' | 'anime'): NotificationPayload => ({
    title: 'อัปเดตรายการโปรด',
    body: `${title} ที่คุณติดตามมีข้อมูลใหม่`,
    icon: '/icons/icon-192x192.png',
    tag: 'favorite-update',
    data: { type: 'favorite-update', title, contentType: type },
    actions: [
      {
        action: 'view',
        title: 'ดูรายละเอียด',
        icon: '/icons/view-icon.png',
      },
    ],
  }),

  weeklyRecommendation: (recommendations: string[]): NotificationPayload => ({
    title: 'แนะนำประจำสัปดาห์',
    body: `เรามีหนังและอนิเมะใหม่ ${recommendations.length} เรื่องที่คุณอาจชอบ`,
    icon: '/icons/icon-192x192.png',
    tag: 'weekly-recommendation',
    data: { type: 'weekly-recommendation', recommendations },
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'ดูแนะนำ',
        icon: '/icons/view-icon.png',
      },
    ],
  }),

  reminderToReview: (title: string): NotificationPayload => ({
    title: 'อย่าลืมรีวิว!',
    body: `คุณดู "${title}" ไปแล้ว มาแบ่งปันความคิดเห็นกันเถอะ`,
    icon: '/icons/icon-192x192.png',
    tag: 'review-reminder',
    data: { type: 'review-reminder', title },
    actions: [
      {
        action: 'review',
        title: 'เขียนรีวิว',
        icon: '/icons/edit-icon.png',
      },
      {
        action: 'later',
        title: 'ภายหลัง',
        icon: '/icons/clock-icon.png',
      },
    ],
  }),
};

// Singleton instance
export const notificationManager = NotificationManager.getInstance();

// Helper functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await notificationManager.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

export const showNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    await notificationManager.showNotification(payload);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

export const isNotificationSupported = (): boolean => {
  return notificationManager.isSupported();
};

export const getNotificationPermission = (): NotificationPermission => {
  return notificationManager.getPermission();
};