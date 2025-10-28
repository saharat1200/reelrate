'use client';

import { useState, useEffect } from 'react';
import { User, Settings, Heart, Star, Film, Tv, Edit3, Camera, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { ActivityHistory } from '@/components/profile/ActivityHistory';

interface UserStats {
  totalReviews: number;
  totalFavorites: number;
  averageRating: number;
  joinedDate: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [stats, setStats] = useState<UserStats>({
    totalReviews: 0,
    totalFavorites: 0,
    averageRating: 0,
    joinedDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || '',
  });

  // Fetch user statistics from Supabase
  useEffect(() => {
    if (user) {
      fetchUserStats();
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
      });
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get total reviews count
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get average rating from reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', user.id);

      let averageRating = 0;
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / reviewsData.length;
      }

      // Format joined date
      const joinedDate = new Date(user.created_at).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
      });

      setStats({
        totalReviews: reviewsCount || 0,
        totalFavorites: favoritesCount || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        joinedDate,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            เข้าสู่ระบบเพื่อดูโปรไฟล์
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            กรุณาเข้าสู่ระบบเพื่อดูและจัดการโปรไฟล์ของคุณ
          </p>
          <Button>
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center">
            {/* Profile Picture */}
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <h1 className="text-2xl font-bold mb-1">
              {user.user_metadata?.full_name || 'ผู้ใช้งาน'}
            </h1>
            <p className="text-blue-100 mb-4">{user.email}</p>
            <p className="text-sm text-blue-100">
              เข้าร่วมเมื่อ {stats.joinedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {loading ? '...' : stats.totalReviews}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">รีวิว</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-red-500 mb-1">
              {loading ? '...' : stats.totalFavorites}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">รายการโปรด</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1 flex items-center justify-center">
              <Star className="w-6 h-6 mr-1 fill-current" />
              {loading ? '...' : stats.averageRating || '-'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">คะแนนเฉลี่ย</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {loading ? '...' : stats.totalReviews >= 10 ? 'A+' : stats.totalReviews >= 5 ? 'A' : 'B+'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">เกรด</div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  ภาพรวม
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  ประวัติกิจกรรม
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Profile Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ข้อมูลส่วนตัว
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    แก้ไข
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ชื่อ-นามสกุล
                    </label>
                    <p className="text-gray-900 dark:text-white">{formData.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      อีเมล
                    </label>
                    <p className="text-gray-900 dark:text-white">{formData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      เกี่ยวกับฉัน
                    </label>
                    <p className="text-gray-900 dark:text-white">{formData.bio || 'ยังไม่ได้เพิ่มข้อมูล'}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <ActivityHistory />
          )}

          {activeTab === 'overview' && (
            <>
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    เมนูด่วน
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Heart className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-gray-900 dark:text-white">รายการโปรด</span>
                  </button>
                  <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-gray-900 dark:text-white">รีวิวของฉัน</span>
                  </button>
                  <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-900 dark:text-white">การตั้งค่า</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProfileUpdated={() => {
          // Refresh user data
          if (user) {
            setFormData({
              fullName: user.user_metadata?.full_name || '',
              email: user.email || '',
              bio: user.user_metadata?.bio || '',
            });
          }
        }}
      />
    </div>
  );
}