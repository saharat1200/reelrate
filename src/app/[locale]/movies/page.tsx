'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Star, TrendingUp, Award, Calendar, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TMDBMovie, tmdbApi, getImageUrl } from '@/lib/api';

export default function MoviesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<'popular' | 'top_rated' | 'upcoming' | 'now_playing'>('popular');
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
      loadMoreMovies();
    }
  }, [loadingMore, hasMorePages, searchQuery]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    loadMovies(currentCategory);
  }, [currentCategory]);

  const loadMovies = async (category: string, page: number = 1, append: boolean = false) => {
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
        case 'top_rated':
          data = await tmdbApi.getTopRatedMovies(page);
          break;
        case 'upcoming':
          data = await tmdbApi.getUpcomingMovies(page);
          break;
        case 'now_playing':
          data = await tmdbApi.getNowPlayingMovies(page);
          break;
        default:
          data = await tmdbApi.getPopularMovies(page);
      }

      if (append) {
        setMovies(prev => [...prev, ...data.results]);
      } else {
        setMovies(data.results);
      }
      
      setHasMorePages(page < data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMovies = () => {
    if (!loadingMore && hasMorePages && !searchQuery) {
      const nextPage = currentPage + 1;
      loadMovies(currentCategory, nextPage, true);
    }
  };

  const handleCategoryChange = (category: 'popular' | 'top_rated' | 'upcoming' | 'now_playing') => {
    setCurrentCategory(category);
    setSearchQuery('');
    setMovies([]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadMovies(currentCategory);
      return;
    }

    try {
      setIsSearching(true);
      setHasMorePages(false);
      // Load multiple pages of search results for better content
      const [page1, page2, page3] = await Promise.all([
        tmdbApi.searchMovies(query, 1),
        tmdbApi.searchMovies(query, 2),
        tmdbApi.searchMovies(query, 3)
      ]);
      
      const allResults = [...page1.results, ...page2.results, ...page3.results];
      setMovies(allResults);
    } catch (error) {
      console.error('Error searching movies:', error);
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
      case 'top_rated': return 'หนังคะแนนสูง';
      case 'upcoming': return 'หนังที่กำลังจะมา';
      case 'now_playing': return 'หนังที่กำลังฉาย';
      default: return 'หนังยอดนิยม';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            หนัง
          </h1>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={currentCategory === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('popular')}
              className="flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              ยอดนิยม
            </Button>
            <Button
              variant={currentCategory === 'top_rated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('top_rated')}
              className="flex items-center"
            >
              <Award className="w-4 h-4 mr-1" />
              คะแนนสูง
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
            <Button
              variant={currentCategory === 'now_playing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('now_playing')}
              className="flex items-center"
            >
              <Play className="w-4 h-4 mr-1" />
              กำลังฉาย
            </Button>
          </div>
          

          {/* Status */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery ? `ผลการค้นหา "${searchQuery}" (${movies.length} รายการ)` : `${getCategoryTitle()} (${movies.length} รายการ)`}
            </p>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              กรอง
            </Button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
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
              {movies.map((movie, index) => (
                <Link
                  key={`movies-${currentCategory}-${movie.id}-${index}`}
                  href={`/${locale}/movies/${movie.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group block"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-movie.jpg';
                      }}
                    />
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {movie.vote_average.toFixed(1)}
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
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
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
            {!searchQuery && !hasMorePages && movies.length > 0 && (
              <div className="text-center mt-8 py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🎬 แสดงหนังครบทุกเรื่องแล้ว
                </p>
              </div>
            )}
          </>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ไม่พบหนังที่ค้นหา
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