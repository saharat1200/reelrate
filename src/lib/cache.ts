// Cache utility for offline functionality
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private readonly DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set data in cache with optional TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.DEFAULT_TTL);
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt,
    };

    this.cache.set(key, cacheItem);
    
    // Also store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`reelrate_cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to store in localStorage:', error);
      }
    }
  }

  // Get data from cache
  get<T>(key: string): T | null {
    let cacheItem = this.cache.get(key);
    
    // If not in memory, try localStorage
    if (!cacheItem && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`reelrate_cache_${key}`);
        if (stored) {
          cacheItem = JSON.parse(stored);
          if (cacheItem) {
            this.cache.set(key, cacheItem);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage:', error);
      }
    }

    if (!cacheItem) {
      return null;
    }

    // Check if expired
    if (Date.now() > cacheItem.expiresAt) {
      this.delete(key);
      return null;
    }

    return cacheItem.data as T;
  }

  // Delete from cache
  delete(key: string): void {
    this.cache.delete(key);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`reelrate_cache_${key}`);
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('reelrate_cache_')
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  // Check if data exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  POPULAR_MOVIES: 'popular_movies',
  POPULAR_ANIME: 'popular_anime',
  MOVIE_DETAILS: (id: string) => `movie_${id}`,
  ANIME_DETAILS: (id: string) => `anime_${id}`,
  SEARCH_MOVIES: (query: string) => `search_movies_${query}`,
  SEARCH_ANIME: (query: string) => `search_anime_${query}`,
  USER_FAVORITES: 'user_favorites',
  USER_REVIEWS: 'user_reviews',
} as const;

// Helper functions for common cache operations
export const cacheManager = CacheManager.getInstance();

export const getCachedData = <T>(key: string): T | null => {
  return cacheManager.get<T>(key);
};

export const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
  cacheManager.set(key, data, ttl);
};

export const clearCache = (): void => {
  cacheManager.clear();
};

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 1000 * 60 * 5);
}