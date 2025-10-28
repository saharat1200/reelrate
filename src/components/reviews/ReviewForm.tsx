'use client';

import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { createReviewNotification } from '@/lib/notifications';
import { getMovieUUIDByExternalId, ensureMovieIndexedByExternal } from '@/lib/user-stats';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
  movieId: string;
  movieType?: 'movie' | 'anime';
  movieTitle: string;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ movieId, movieType = 'movie', movieTitle, onClose, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว');
      return;
    }

    if (rating === 0) {
      toast.error('กรุณาให้คะแนน');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert external ID to internal movie UUID
      let internalMovieId = await getMovieUUIDByExternalId(movieId, movieType);
      
      // If movie/anime is not indexed, index it first
      if (!internalMovieId) {
        internalMovieId = await ensureMovieIndexedByExternal(movieId, movieType);
      }
      
      if (!internalMovieId) {
        throw new Error('ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง');
      }

      // Check if user already reviewed this movie
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', internalMovieId)
        .single();

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        toast.success('อัปเดตรีวิวเรียบร้อยแล้ว');
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            movie_id: internalMovieId,
            rating,
            comment: comment.trim()
          });

        if (error) throw error;
        
        // Create notification for users who favorited this movie
        await createReviewNotification(internalMovieId, user.id, movieTitle || 'ภาพยนตร์');
        
        toast.success('เขียนรีวิวเรียบร้อยแล้ว');
      }

      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('เกิดข้อผิดพลาดในการเขียนรีวิว');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            เขียนรีวิว
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {movieTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              คะแนน
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {rating}/10 คะแนน
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ความคิดเห็น
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="แบ่งปันความคิดเห็นของคุณเกี่ยวกับเรื่องนี้..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {comment.length} ตัวอักษร (ขั้นต่ำ 1 ตัวอักษร)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 1}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังส่ง...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  ส่งรีวิว
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}