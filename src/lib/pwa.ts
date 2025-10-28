// PWA utility functions for ReelRate

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Only initialize if running in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if app is already installed
    this.checkInstallStatus();

    // Listen for beforeinstallprompt event with error handling
    window.addEventListener('beforeinstallprompt', (e) => {
      try {
        e.preventDefault();
        this.deferredPrompt = e as BeforeInstallPromptEvent;
        this.showInstallButton();
      } catch (error) {
        console.error('Error handling beforeinstallprompt event:', error);
      }
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      try {
        console.log('PWA was installed');
        this.isInstalled = true;
        this.hideInstallButton();
        this.deferredPrompt = null;
      } catch (error) {
        console.error('Error handling appinstalled event:', error);
      }
    });

    // Register service worker
    this.registerServiceWorker();

    // Request notification permission
    this.requestNotificationPermission();
  }

  private checkInstallStatus() {
    // Only check if running in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check for iOS Safari standalone mode
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) {
      this.isInstalled = true;
    }
  }

  private async registerServiceWorker() {
    // Only proceed if running in browser environment
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              this.showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    // Only proceed if running in browser environment
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  private showInstallButton() {
    // Only dispatch if running in browser environment
    if (typeof window === 'undefined') return;
    // Dispatch custom event to show install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallButton() {
    // Only dispatch if running in browser environment
    if (typeof window === 'undefined') return;
    // Dispatch custom event to hide install button in UI
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  private showUpdateNotification() {
    // Only dispatch if running in browser environment
    if (typeof window === 'undefined') return;
    // Dispatch custom event to show update notification
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  async subscribeToNotifications(): Promise<PushSubscription | null> {
    try {
      // Only proceed if running in browser environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return null;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as BufferSource
      });

      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Use Buffer in Node.js environment, window.atob in browser
    const rawData = typeof window !== 'undefined' 
      ? window.atob(base64)
      : Buffer.from(base64, 'base64').toString('binary');
    
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async unsubscribeFromNotifications(): Promise<boolean> {
    try {
      // Only proceed if running in browser environment
      if (typeof navigator === 'undefined') {
        return false;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const successful = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications:', successful);
        return successful;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  // Offline data management
  async saveOfflineData(key: string, data: unknown): Promise<void> {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  getOfflineData(key: string): unknown | null {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  clearOfflineData(key?: string): void {
    try {
      if (key) {
        localStorage.removeItem(`offline_${key}`);
      } else {
        // Clear all offline data
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith('offline_')) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  // Network status
  isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    // Return no-op cleanup function if not in browser environment
    if (typeof window === 'undefined') {
      return () => {};
    }
    
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Export utility functions
export const {
  requestNotificationPermission,
  showInstallPrompt,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  isAppInstalled,
  canInstall,
  saveOfflineData,
  getOfflineData,
  clearOfflineData,
  isOnline,
  onNetworkChange
} = pwaManager;