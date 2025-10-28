'use client';

import { useState, useEffect } from 'react';
import { Star, Heart, MessageCircle, Calendar, Film } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  type: 'review' | 'favorite' | 'comment';
  title: string;
  description: string;
  movie_title?: string;
  movie_id?: string;
  rating?: number;
  created_at: string;
}

export function ActivityHistory() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const activities: Activity[] = [];

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          movie_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviews) {
        reviews.forEach(review => {
          activities.push({
            id: `review-${review.id}`,
            type: 'review',
            title: 'เขียนรีวิว',
            description: review.comment.substring(0, 100) + (review.comment.length > 100 ? '...' : ''),
            movie_id: review.movie_id,
            rating: review.rating,
            created_at: review.created_at
          });
        });
      }

      // Fetch favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          movie_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (favorites) {
        favorites.forEach(favorite => {
          activities.push({
            id: `favorite-${favorite.id}`,
            type: 'favorite',
            title: 'เพิ่มในรายการโปรด',
            description: 'เพิ่มภาพยนตร์ในรายการโปรด',
            movie_id: favorite.movie_id,
            created_at: favorite.created_at
          });
        });
      }

      // Fetch comments
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          review_id,
          reviews!inner(movie_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (comments) {
        comments.forEach(comment => {
          activities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            title: 'แสดงความคิดเห็น',
            description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
            movie_id: comment.reviews?.[0]?.movie_id || null,
            created_at: comment.created_at
          });
        });
      }

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setActivities(activities.slice(0, 20)); // Show latest 20 activities
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'favorite':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Film className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'เมื่อสักครู่';
    } else if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          ยังไม่มีกิจกรรม
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          เริ่มต้นด้วยการเขียนรีวิวหรือเพิ่มภาพยนตร์ในรายการโปรด
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ประวัติกิจกรรม
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(activity.created_at)}
                </p>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {activity.description}
              </p>
              
              {activity.rating && (
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.rating}/10
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}