'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { createLikeNotification } from '@/lib/notifications';
import { getMovieUUIDByExternalId } from '@/lib/user-stats';
import { toast } from 'react-hot-toast';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentList } from '@/components/comments/CommentList';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  dislikes_count: number;
  comments_count?: number;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
  user_like?: {
    is_like: boolean;
  }[];
}

interface ReviewListProps {
  movieId: string;
  movieType?: 'movie' | 'anime';
  refreshTrigger?: number;
}

export function ReviewList({ movieId, movieType = 'movie', refreshTrigger }: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [commentRefreshTriggers, setCommentRefreshTriggers] = useState<Record<string, number>>({});

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Convert external ID to internal movie UUID
      const internalMovieId = await getMovieUUIDByExternalId(movieId, movieType);
      
      if (!internalMovieId) {
        // If movie/anime is not indexed, show empty reviews
        setReviews([]);
        return;
      }
      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          updated_at,
          likes_count,
          dislikes_count,
          comments:comments(count),
          profiles:user_id (
            full_name,
            avatar_url
          ),
          user_like:review_likes!left (
            is_like
          )
        `)
        .eq('movie_id', internalMovieId);

      // Add user-specific like data if logged in
      if (user) {
        query = query.eq('user_like.user_id', user.id);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews((data as unknown as Review[]) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรีวิว');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId, sortBy, refreshTrigger]);

  const handleLike = async (reviewId: string, isLike: boolean) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      // Check if user already liked/disliked this review
      const { data: existingLike } = await supabase
        .from('review_likes')
        .select('id, is_like')
        .eq('user_id', user.id)
        .eq('review_id', reviewId)
        .single();

      if (existingLike) {
        if (existingLike.is_like === isLike) {
          // Remove like/dislike
          await supabase
            .from('review_likes')
            .delete()
            .eq('id', existingLike.id);
        } else {
          // Update like/dislike
          await supabase
            .from('review_likes')
            .update({ is_like: isLike })
            .eq('id', existingLike.id);
        }
      } else {
        // Create new like/dislike
        await supabase
          .from('review_likes')
          .insert({
            user_id: user.id,
            review_id: reviewId,
            is_like: isLike
          });

        // Create notification if it's a like (not dislike)
        if (isLike) {
          // Get the review owner's user_id from the database
          const { data: reviewData } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', reviewId)
            .single();
          
          if (reviewData && reviewData.user_id !== user.id) {
            await createLikeNotification(reviewId, user.id, reviewData.user_id);
          }
        }
      }

      // Refresh reviews to update counts
      fetchReviews();
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 dark:text-green-400';
    if (rating >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const toggleComments = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleCommentAdded = (reviewId: string) => {
    setCommentRefreshTriggers(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          รีวิวจากผู้ใช้ ({reviews.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="newest">ใหม่ล่าสุด</option>
          <option value="oldest">เก่าสุด</option>
          <option value="highest">คะแนนสูงสุด</option>
          <option value="lowest">คะแนนต่ำสุด</option>
        </select>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ยังไม่มีรีวิว</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">เป็นคนแรกที่เขียนรีวิวเรื่องนี้</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  {review.profiles.avatar_url ? (
                    <img
                      src={review.profiles.avatar_url}
                      alt={review.profiles.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {review.profiles.full_name || 'ผู้ใช้งาน'}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(review.created_at)}</span>
                    {review.updated_at !== review.created_at && (
                      <span className="text-xs">(แก้ไขแล้ว)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className={`w-5 h-5 fill-current ${getRatingColor(review.rating)}`} />
                  <span className={`font-semibold ${getRatingColor(review.rating)}`}>
                    {review.rating}/10
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {review.comment}
              </p>

              {/* Like/Dislike Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(review.id, true)}
                  disabled={!user}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    review.user_like?.[0]?.is_like === true
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.likes_count}</span>
                </button>
                <button
                  onClick={() => handleLike(review.id, false)}
                  disabled={!user}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    review.user_like?.[0]?.is_like === false
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{review.dislikes_count}</span>
                </button>
                <button
                  onClick={() => toggleComments(review.id)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ความคิดเห็น</span>
                  {review.comments_count && review.comments_count > 0 && (
                    <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                      {review.comments_count}
                    </span>
                  )}
                </button>
              </div>

              {/* Comments Section */}
              {expandedReviews.has(review.id) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                  <CommentList 
                    reviewId={review.id}
                    refreshTrigger={commentRefreshTriggers[review.id]}
                  />
                  <CommentForm 
                    reviewId={review.id}
                    onCommentAdded={() => handleCommentAdded(review.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}