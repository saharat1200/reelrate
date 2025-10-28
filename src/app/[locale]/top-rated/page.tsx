'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Award, TrendingUp, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TMDBMovie, JikanAnime, tmdbApi, jikanApi, getImageUrl } from '@/lib/api';

interface TopRatedItem {
  id: string;
  title: string;
  description: string;
  rating: number;
  year: string;
  type: 'movie' | 'anime';
  image: string;
  originalId: number;
}

export default function TopRatedPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [items, setItems] = useState<TopRatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movies' | 'anime'>('all');

  useEffect(() => {
    loadTopRatedContent();
  }, []);

  const loadTopRatedContent = async () => {
    setLoading(true);
    try {
      // Fetch top-rated movies from TMDB (2 pages)
      const [moviesPage1, moviesPage2, topAnime] = await Promise.all([
        tmdbApi.getTopRatedMovies(1),
        tmdbApi.getTopRatedMovies(2),
        jikanApi.getTopAnime(1)
      ]);

      // Combine and deduplicate movies
      const allMovies = [...moviesPage1.results, ...moviesPage2.results];
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );

      // Transform movies to TopRatedItem format
      const movieItems: TopRatedItem[] = uniqueMovies
        .filter(movie => movie.vote_average >= 7.5) // High quality threshold
        .slice(0, 25) // Limit to top 25 movies
        .map(movie => ({
          id: `movie-${movie.id}`,
          title: movie.title,
          description: movie.overview || 'ไม่มีคำอธิบาย',
          rating: movie.vote_average,
          year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'N/A',
          type: 'movie' as const,
          image: getImageUrl(movie.poster_path, 'w500'),
          originalId: movie.id
        }));

      // Transform anime to TopRatedItem format
      const animeItems: TopRatedItem[] = topAnime.data
        .filter(anime => anime.score && anime.score >= 8.5) // High quality threshold
        .slice(0, 25) // Limit to top 25 anime
        .map(anime => ({
          id: `anime-${anime.mal_id}`,
          title: anime.title,
          description: anime.synopsis || 'ไม่มีคำอธิบาย',
          rating: anime.score || 0,
          year: anime.aired?.from ? new Date(anime.aired.from).getFullYear().toString() : 'N/A',
          type: 'anime' as const,
          image: anime.images?.jpg?.image_url || '/placeholder-image.jpg',
          originalId: anime.mal_id
        }));

      // Combine all items and sort by rating
      const allItems = [...movieItems, ...animeItems];
      
      // Remove any potential duplicates by title (final safety check)
      const uniqueItems = allItems.filter((item, index, self) => 
        index === self.findIndex(i => i.title.toLowerCase() === item.title.toLowerCase())
      );

      // Sort by rating (highest first) and take top 50
      const sortedItems = uniqueItems
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 50);

      setItems(sortedItems);
    } catch (error) {
      console.error('Error loading top-rated content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.type === 'movie';
    if (filter === 'anime') return item.type === 'anime';
    return true;
  });

  const getRankingNumber = (index: number) => {
    return index + 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              อันดับสูงสุด (Top Rated)
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            รวมหนังและอนิเมะที่ได้คะแนนสูงสุดจากทั่วโลก
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            ทั้งหมด ({items.length})
          </Button>
          <Button
            variant={filter === 'movies' ? 'default' : 'outline'}
            onClick={() => setFilter('movies')}
            className="flex items-center gap-2"
          >
            <Film className="h-4 w-4" />
            หนัง ({items.filter(item => item.type === 'movie').length})
          </Button>
          <Button
            variant={filter === 'anime' ? 'default' : 'outline'}
            onClick={() => setFilter('anime')}
            className="flex items-center gap-2"
          >
            <Tv className="h-4 w-4" />
            อนิเมะ ({items.filter(item => item.type === 'anime').length})
          </Button>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="flex">
                {/* Ranking Number */}
                <div className="flex-shrink-0 w-16 bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {getRankingNumber(index)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex">
                  {/* Image */}
                  <div className="flex-shrink-0 w-24 h-36">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          href={`/${locale}/${item.type === 'movie' ? 'movies' : 'anime'}/${item.originalId}`}
                          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.year}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {item.type === 'movie' ? 'หนัง' : 'อนิเมะ'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                        <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ไม่พบรายการ
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              ไม่มีรายการในหมวดหมู่ที่เลือก
            </p>
          </div>
        )}
      </div>
    </div>
  );
}