'use client';

import { useState, useEffect } from 'react';
import { Heart, Filter, Star, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Favorite {
  id: string;
  item_id: string;
  item_type: 'movie' | 'anime';
  title: string;
  poster_url: string;
  rating: number;
  year: number;
  created_at: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'anime'>('all');

  // Fetch favorites from Supabase
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Handle page visibility change (when user comes back from background/minimized)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && favorites.length === 0) {
        // Only refetch if page becomes visible and we don't have data
        fetchFavorites();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, favorites.length]);

  // Handle window focus (additional fallback for mobile devices)
  useEffect(() => {
    const handleFocus = () => {
      if (user && favorites.length === 0) {
        // Only refetch if we don't have data
        fetchFavorites();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, favorites.length]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if we already have data and it's recent (less than 5 minutes old)
      const lastFetch = localStorage.getItem('favorites_last_fetch');
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (lastFetch && favorites.length > 0 && (now - parseInt(lastFetch)) < fiveMinutes) {
        setLoading(false);
        return; // Use cached data if it's recent
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          movies!inner (
            id,
            tmdb_id,
            mal_id,
            title,
            title_english,
            poster_path,
            vote_average,
            score,
            type,
            release_date,
            aired_from
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit initial load to 50 items for better performance

      if (error) throw error;

      const transformed: Favorite[] = (data || []).map((row: any) => {
        const m = row.movies;
        const title = m?.title_english || m?.title || '';
        const type = (m?.type || 'movie') as 'movie' | 'anime';
        const poster_url = type === 'movie'
          ? (m?.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : '') // Use smaller image size
          : (m?.poster_path || '');
        const rating = type === 'movie' ? (m?.vote_average ?? 0) : (m?.score ?? 0);
        const year = type === 'movie'
          ? (m?.release_date ? new Date(m.release_date).getFullYear() : 0)
          : (m?.aired_from ? new Date(m.aired_from).getFullYear() : 0);

        return {
          id: row.id,
          item_id: type === 'movie' ? (m?.tmdb_id?.toString() || m?.id) : (m?.mal_id?.toString() || m?.id),
          item_type: type,
          title,
          poster_url,
          rating,
          year,
          created_at: row.created_at,
        } as Favorite;
      });

      setFavorites(transformed);
      
      // Store the fetch timestamp
      localStorage.setItem('favorites_last_fetch', now.toString());
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      
      // Clear cache when data changes
      localStorage.removeItem('favorites_last_fetch');
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Filter favorites based on type only (removed search functionality)
  const filteredFavorites = favorites.filter(favorite => {
    const matchesFilter = filter === 'all' || favorite.item_type === filter;
    return matchesFilter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            เข้าสู่ระบบเพื่อดูรายการโปรด
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            กรุณาเข้าสู่ระบบเพื่อดูและจัดการรายการโปรดของคุณ
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header and Filter Buttons */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                รายการโปรด
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                หนังและอนิเมะที่คุณชื่นชอบ ({filteredFavorites.length} รายการ)
              </p>
            </div>
            
            {/* Filter Buttons - Moved to Right */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  ทั้งหมด
                </Button>
                <Button
                  variant={filter === 'movie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('movie')}
                >
                  หนัง
                </Button>
                <Button
                  variant={filter === 'anime' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('anime')}
                >
                  อนิเมะ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">กำลังโหลดรายการโปรด...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredFavorites.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter !== 'all' ? 'ไม่พบรายการในหมวดหมู่นี้' : 'ยังไม่มีรายการโปรด'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter !== 'all' 
                ? 'ลองเปลี่ยนตัวกรองดู' 
                : 'เริ่มเพิ่มหนังและอนิเมะที่คุณชื่นชอบเข้าสู่รายการโปรด'
              }
            </p>
            {filter === 'all' && (
              <div className="flex gap-4 justify-center">
                <Link href={`/${locale}/movies`}>
                  <Button>
                    ค้นหาหนัง
                  </Button>
                </Link>
                <Link href={`/${locale}/anime`}>
                  <Button variant="outline">
                    ค้นหาอนิเมะ
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredFavorites.map((favorite, index) => (
              <div key={`favorite-${favorite.item_type}-${favorite.id}-${index}`} className="group relative">
                <Link href={`/${locale}/${favorite.item_type === 'movie' ? 'movies' : 'anime'}/${favorite.item_id}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    {/* Poster */}
                    <div className="aspect-[2/3] relative">
                      <Image
                        src={favorite.poster_url || '/placeholder-poster.jpg'}
                        alt={favorite.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy" // Add lazy loading for better performance
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      />
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          favorite.item_type === 'movie' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-purple-500 text-white'
                        }`}>
                          {favorite.item_type === 'movie' ? 'หนัง' : 'อนิเมะ'}
                        </span>
                      </div>

                      {/* Rating */}
                      {favorite.rating > 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
                          <span className="text-xs font-medium">{favorite.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {favorite.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {favorite.year > 0 ? favorite.year : '-'}
                        </span>
                        <span>
                          {new Date(favorite.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Remove Button - Outside the Link */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(favorite.id);
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="ลบออกจากรายการโปรด"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}