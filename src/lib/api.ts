// React imports for the hook
import { useState, useEffect } from 'react';
import { cacheManager, CACHE_KEYS } from './cache';

// TMDB API functions
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

// Check if online
const isOnline = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
};

// Generic API fetch with caching
async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cacheManager.get<T>(key);
  if (cached) {
    return cached;
  }

  // If offline and no cache, throw error
  if (!isOnline()) {
    throw new Error('ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ และไม่มีข้อมูลในแคช');
  }

  try {
    const data = await fetchFn();
    cacheManager.set(key, data, ttl);
    return data;
  } catch (error) {
    // If fetch fails but we have expired cache, return it
    const expiredCache = cacheManager.get<T>(key);
    if (expiredCache) {
      return expiredCache;
    }
    throw error;
  }
}

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
}

export interface TMDBMovieDetails extends TMDBMovie {
  adult: boolean
  budget: number
  genres: Array<{
    id: number
    name: string
  }>
  homepage: string | null
  imdb_id: string | null
  original_language: string
  original_title: string
  popularity: number
  production_companies: Array<{
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }>
  production_countries: Array<{
    iso_3166_1: string
    name: string
  }>
  revenue: number
  runtime: number | null
  spoken_languages: Array<{
    english_name: string
    iso_639_1: string
    name: string
  }>
  status: string
  tagline: string | null
}

export interface TMDBCast {
  adult: boolean
  gender: number | null
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
  cast_id: number
  character: string
  credit_id: string
  order: number
}

export interface TMDBCrew {
  adult: boolean
  gender: number | null
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
  credit_id: string
  department: string
  job: string
}

export interface TMDBCredits {
  id: number
  cast: TMDBCast[]
  crew: TMDBCrew[]
}

export interface TMDBResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

export interface TMDBVideo {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string
  name: string
  official: boolean
  published_at: string
  site: string
  size: number
  type: string
}

export interface TMDBVideosResponse {
  id: number
  results: TMDBVideo[]
}

export const tmdbApi = {
  async getPopularMovies(page: number = 1): Promise<TMDBResponse> {
    const key = `${CACHE_KEYS.POPULAR_MOVIES}_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=th-TH`
      )
      return response.json()
    });
  },

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse> {
    const key = `top_rated_movies_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}&language=th-TH`
      )
      return response.json()
    });
  },

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse> {
    const key = `upcoming_movies_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}&language=th-TH`
      )
      return response.json()
    });
  },

  async getNowPlayingMovies(page: number = 1): Promise<TMDBResponse> {
    const key = `now_playing_movies_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&language=th-TH`
      )
      return response.json()
    });
  },

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const key = CACHE_KEYS.MOVIE_DETAILS(movieId.toString());
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=th-TH&append_to_response=credits`
      )
      return response.json()
    });
  },

  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    const key = `movie_credits_${movieId}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
      )
      return response.json()
    });
  },

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse> {
    const key = `${CACHE_KEYS.SEARCH_MOVIES(query)}_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=th-TH`
      )
      return response.json()
    }, 1000 * 60 * 10); // 10 minutes cache for search
  },

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse> {
    const key = `movies_genre_${genreId}_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=th-TH`
      )
      return response.json()
    });
  },

  async getMovieVideos(movieId: number): Promise<TMDBVideosResponse> {
    const key = `movie_videos_${movieId}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=th-TH`
      )
      return response.json()
    });
  }
}

// Jikan API functions
const JIKAN_BASE_URL = process.env.NEXT_PUBLIC_JIKAN_API_BASE_URL

export interface JikanAnime {
  mal_id: number
  title: string
  title_english: string | null
  synopsis: string | null
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  aired: {
    from: string | null
    to: string | null
  }
  score: number | null
  scored_by: number | null
  genres: Array<{
    mal_id: number
    name: string
  }>
  type: string
  status: string
  trailer?: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
  }
}

export interface JikanResponse {
  data: JikanAnime[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

export const jikanApi = {
  async getTopAnime(page: number = 1): Promise<JikanResponse> {
    const key = `${CACHE_KEYS.POPULAR_ANIME}_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/top/anime?page=${page}&limit=25`
      )
      return response.json()
    });
  },

  async getAiringAnime(page: number = 1): Promise<JikanResponse> {
    const key = `airing_anime_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/seasons/now?page=${page}&limit=25`
      )
      return response.json()
    });
  },

  async getUpcomingAnime(page: number = 1): Promise<JikanResponse> {
    const key = `upcoming_anime_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/seasons/upcoming?page=${page}&limit=25`
      )
      return response.json()
    });
  },

  async getPopularAnime(page: number = 1): Promise<JikanResponse> {
    const key = `popular_anime_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/top/anime?page=${page}&limit=25&filter=bypopularity`
      )
      return response.json()
    });
  },

  async getAnimeDetails(animeId: number): Promise<{ data: JikanAnime }> {
    const key = CACHE_KEYS.ANIME_DETAILS(animeId.toString());
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/anime/${animeId}`
      )
      return response.json()
    });
  },

  async searchAnime(query: string, page: number = 1): Promise<JikanResponse> {
    const key = `${CACHE_KEYS.SEARCH_ANIME(query)}_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=25`
      )
      return response.json()
    }, 1000 * 60 * 10); // 10 minutes cache for search
  },

  async getAnimeByGenre(genreId: number, page: number = 1): Promise<JikanResponse> {
    const key = `anime_genre_${genreId}_${page}`;
    
    return fetchWithCache(key, async () => {
      const response = await fetch(
        `${JIKAN_BASE_URL}/anime?genres=${genreId}&page=${page}`
      )
      return response.json()
    });
  }
}

// Image URL helpers
export const getImageUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder-movie.jpg'
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// Network status hook
export const useNetworkStatus = () => {
  const [online, setOnline] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: online,
    isOffline: !online,
  };
};