'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Star, TrendingUp, Award, Calendar, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JikanAnime, jikanApi } from '@/lib/api';

export default function AnimePage() {
  const params = useParams();
  const locale = params.locale as string;
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<'top' | 'airing' | 'upcoming' | 'bypopularity'>('top');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Infinite scroll functionality
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMorePages || searchQuery) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMoreAnime();
    }
  }, [loadingMore, hasMorePages, searchQuery]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    loadAnime(currentCategory);
  }, [currentCategory]);

  const loadAnime = async (category: string, page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setCurrentPage(1);
        setHasMorePages(true);
      } else {
        setLoadingMore(true);
      }

      let data;
      switch (category) {
        case 'airing':
          data = await jikanApi.getAiringAnime(page);
          break;
        case 'upcoming':
          data = await jikanApi.getUpcomingAnime(page);
          break;
        case 'bypopularity':
          data = await jikanApi.getPopularAnime(page);
          break;
        default:
          data = await jikanApi.getTopAnime(page);
      }

      if (append) {
        setAnime(prev => [...prev, ...data.data]);
      } else {
        setAnime(data.data);
      }
      
      setHasMorePages(data.pagination.has_next_page);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading anime:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreAnime = () => {
    if (!loadingMore && hasMorePages && !searchQuery) {
      const nextPage = currentPage + 1;
      loadAnime(currentCategory, nextPage, true);
    }
  };

  const handleCategoryChange = (category: 'top' | 'airing' | 'upcoming' | 'bypopularity') => {
    setCurrentCategory(category);
    setSearchQuery('');
    setAnime([]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadAnime(currentCategory);
      return;
    }

    try {
      setIsSearching(true);
      setHasMorePages(false);
      // Load multiple pages of search results for better content
      const [page1, page2, page3] = await Promise.all([
        jikanApi.searchAnime(query, 1),
        jikanApi.searchAnime(query, 2),
        jikanApi.searchAnime(query, 3)
      ]);
      
      const allResults = [...page1.data, ...page2.data, ...page3.data];
      
      setAnime(allResults);
    } catch (error) {
      console.error('Error searching anime:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const getCategoryTitle = () => {
    switch (currentCategory) {
      case 'airing': return 'อนิเมะที่กำลังออนแอร์';
      case 'upcoming': return 'อนิเมะที่กำลังจะมา';
      case 'bypopularity': return 'อนิเมะยอดนิยม';
      default: return 'อนิเมะคะแนนสูง';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            อนิเมะ
          </h1>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={currentCategory === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('top')}
              className="flex items-center"
            >
              <Award className="w-4 h-4 mr-1" />
              คะแนนสูง
            </Button>
            <Button
              variant={currentCategory === 'bypopularity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('bypopularity')}
              className="flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              ยอดนิยม
            </Button>
            <Button
              variant={currentCategory === 'airing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('airing')}
              className="flex items-center"
            >
              <Tv className="w-4 h-4 mr-1" />
              กำลังออนแอร์
            </Button>
            <Button
              variant={currentCategory === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('upcoming')}
              className="flex items-center"
            >
              <Calendar className="w-4 h-4 mr-1" />
              กำลังจะมา
            </Button>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาอนิเมะ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
            </Button>
          </form>

          {/* Status */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery ? `ผลการค้นหา "${searchQuery}" (${anime.length} รายการ)` : `${getCategoryTitle()} (${anime.length} รายการ)`}
            </p>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              กรอง
            </Button>
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-lg aspect-[2/3] mb-2"></div>
                <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 mb-1"></div>
                <div className="bg-gray-300 dark:bg-gray-700 rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {anime.map((animeItem, index) => (
                <Link
                  key={`${currentCategory}-${animeItem.mal_id}-${index}`}
                  href={`/${locale}/anime/${animeItem.mal_id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group block"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={animeItem.images.jpg.large_image_url}
                      alt={animeItem.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-anime.jpg';
                      }}
                    />
                    {animeItem.score && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {animeItem.score.toFixed(1)}
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="sm" className="text-xs">
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {animeItem.title_english || animeItem.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {animeItem.aired.from ? new Date(animeItem.aired.from).getFullYear() : 'N/A'} • {animeItem.type}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Auto-loading indicator */}
            {loadingMore && (
              <div className="text-center mt-8">
                <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  กำลังโหลดเพิ่มเติม...
                </div>
              </div>
            )}

            {/* End of content indicator */}
            {!searchQuery && !hasMorePages && anime.length > 0 && (
              <div className="text-center mt-8 py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🎌 แสดงอนิเมะครบทุกเรื่องแล้ว
                </p>
              </div>
            )}
          </>
        )}

        {!loading && anime.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎌</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ไม่พบอนิเมะที่ค้นหา
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น
            </p>
          </div>
        )}
      </div>
    </div>
  );
}