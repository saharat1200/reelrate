'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, User, Calendar, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface CommentListProps {
  reviewId: string;
  refreshTrigger?: number;
}

export function CommentList({ reviewId, refreshTrigger }: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          profiles!user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data as unknown as Comment[]) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดคอมเมนต์');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId, refreshTrigger]);

  const handleDelete = async (commentId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคอมเมนต์นี้?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      toast.success('ลบคอมเมนต์เรียบร้อยแล้ว');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('เกิดข้อผิดพลาดในการลบคอมเมนต์');
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || editContent.length < 10) {
      toast.error('คอมเมนต์ต้องมีอย่างน้อย 10 ตัวอักษร');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;
      
      setEditingId(null);
      setEditContent('');
      toast.success('แก้ไขคอมเมนต์เรียบร้อยแล้ว');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('เกิดข้อผิดพลาดในการแก้ไขคอมเมนต์');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">ยังไม่มีคอมเมนต์</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">เป็นคนแรกที่แสดงความคิดเห็น</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">
        ความคิดเห็น ({comments.length})
      </h4>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              {comment.profiles.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.profiles.full_name || 'ผู้ใช้งาน'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(comment.created_at)}</span>
                    {comment.updated_at !== comment.created_at && (
                      <span className="ml-1">(แก้ไขแล้ว)</span>
                    )}
                  </div>
                </div>
                
                {(user?.id === comment.user_id || user?.user_metadata?.role === 'admin') && (
                  <div className="flex space-x-1">
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleEdit(comment)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={editContent.length < 10}
                    >
                      บันทึก
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {comment.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}