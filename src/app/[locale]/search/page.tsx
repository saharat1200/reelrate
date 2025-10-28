'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, Film, Tv, Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import { tmdbApi, jikanApi, TMDBMovie, JikanAnime, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [anime, setAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'anime'>('movies');
  const [moviePage, setMoviePage] = useState(1);
  const [animePage, setAnimePage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(false);
  const [hasMoreAnime, setHasMoreAnime] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery: string, page: number = 1, tab: 'movies' | 'anime' = activeTab) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      if (tab === 'movies') {
        const response = await tmdbApi.searchMovies(searchQuery, page);
        if (page === 1) {
          setMovies(response.results);
        } else {
          setMovies(prev => [...prev, ...response.results]);
        }
        setHasMoreMovies(page < response.total_pages);
        setMoviePage(page);
      } else {
        const response = await jikanApi.searchAnime(searchQuery, page);
        
        if (page === 1) {
          setAnime(response.data);
        } else {
          setAnime(prev => [...prev, ...response.data]);
        }
        setHasMoreAnime(response.pagination.has_next_page);
        setAnimePage(page);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setMovies([]);
      setAnime([]);
      setMoviePage(1);
      setAnimePage(1);
      handleSearch(query, 1, activeTab);
    }
  };

  const loadMore = () => {
    if (activeTab === 'movies' && hasMoreMovies) {
      handleSearch(query, moviePage + 1, 'movies');
    } else if (activeTab === 'anime' && hasMoreAnime) {
      handleSearch(query, animePage + 1, 'anime');
    }
  };

  const switchTab = (tab: 'movies' | 'anime') => {
    setActiveTab(tab);
    if (query.trim()) {
      if (tab === 'movies' && movies.length === 0) {
        handleSearch(query, 1, 'movies');
      } else if (tab === 'anime' && anime.length === 0) {
        handleSearch(query, 1, 'anime');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('search.searchResults')}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('nav.search')}
              </Button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => switchTab('movies')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'movies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Film className="h-5 w-5" />
              <span>{t('search.movies')}</span>
            </button>
            <button
              onClick={() => switchTab('anime')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'anime'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Tv className="h-5 w-5" />
              <span>{t('search.anime')}</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {query && (
          <div>
            {activeTab === 'movies' && (
              <div>
                {movies.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {movies.map((movie, index) => (
                        <Link key={`search-movie-${movie.id}-${index}`} href={`/movies/${movie.id}`}>
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                              <img
                                src={getImageUrl(movie.poster_path, 'w500')}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-movie.jpg';
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-sm flex items-center">
                                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                {movie.vote_average.toFixed(1)}
                              </div>
                            </div>
                            <div className="p-3">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                                {movie.title}
                              </h3>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(movie.release_date).getFullYear()}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {hasMoreMovies && (
                      <div className="text-center mt-8">
                        <Button onClick={loadMore} disabled={loading}>
                          {loading ? t('common.loading') : t('movies.loadMore')}
                        </Button>
                      </div>
                    )}
                  </>
                ) : !loading && (
                  <div className="text-center py-12">
                    <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t('search.noResults')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'anime' && (
              <div>
                {anime.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {anime.map((animeItem, index) => (
                        <Link key={`search-anime-${animeItem.mal_id}-${index}`} href={`/anime/${animeItem.mal_id}`}>
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                              <img
                                src={animeItem.images.jpg.large_image_url}
                                alt={animeItem.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-anime.jpg';
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-sm flex items-center">
                                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                {animeItem.score?.toFixed(1) || 'N/A'}
                              </div>
                            </div>
                            <div className="p-3">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                                {animeItem.title}
                              </h3>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {animeItem.aired?.from ? new Date(animeItem.aired.from).getFullYear() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {hasMoreAnime && (
                      <div className="text-center mt-8">
                        <Button onClick={loadMore} disabled={loading}>
                          {loading ? t('common.loading') : t('anime.loadMore')}
                        </Button>
                      </div>
                    )}
                  </>
                ) : !loading && (
                  <div className="text-center py-12">
                    <Tv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t('search.noResults')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('search.placeholder')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}