'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { createCommentNotification } from '@/lib/notifications';
import { toast } from 'react-hot-toast';

interface CommentFormProps {
  reviewId: string;
  onCommentAdded: () => void;
}

export function CommentForm({ reviewId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (!comment.trim()) {
      toast.error('กรุณาเขียนคอมเมนต์');
      return;
    }

    if (comment.length < 10) {
      toast.error('คอมเมนต์ต้องมีอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          content: comment.trim()
        });

      if (error) throw error;

      // Get review owner to create notification
      const { data: review } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', reviewId)
        .single();

      if (review) {
        await createCommentNotification(reviewId, user.id, review.user_id);
      }

      setComment('');
      toast.success('เพิ่มคอมเมนต์เรียบร้อยแล้ว');
      onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มคอมเมนต์');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          เข้าสู่ระบบเพื่อแสดงความคิดเห็น
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          แสดงความคิดเห็น
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="เขียนความคิดเห็นของคุณ..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ขั้นต่ำ 1 ตัวอักษร
          </p>
          <p className={`text-xs ${comment.length < 1 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} suppressHydrationWarning>
            {comment.length}/500
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || comment.length < 1 || comment.length > 500}
          className="flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'กำลังส่ง...' : 'ส่งคอมเมนต์'}</span>
        </Button>
      </div>
    </form>
  );
}