'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { createReviewNotification } from '@/lib/notifications';
import { getMovieUUIDByExternalId, ensureMovieIndexedByExternal } from '@/lib/user-stats';
import { toast } from 'react-hot-toast';

interface InlineReviewFormProps {
  movieId: string;
  movieType?: 'movie' | 'anime';
  movieTitle: string;
  onReviewSubmitted: () => void;
}

export function InlineReviewForm({ movieId, movieType = 'movie', movieTitle, onReviewSubmitted }: InlineReviewFormProps) {
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

    if (comment.trim().length < 1) {
      toast.error('กรุณาเขียนรีวิวอย่างน้อย 1 ตัวอักษร');
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

      // Reset form
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('เกิดข้อผิดพลาดในการเขียนรีวิว');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
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
      <div>
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
      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 1}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              กำลังส่ง...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Send className="w-4 h-4 mr-2" />
              ส่งรีวิว
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}