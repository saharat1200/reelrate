import { supabase } from './supabase';

export interface UserStats {
  totalReviews: number;
  totalFavorites: number;
  averageRating: number;
  joinedDate: string;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'review' | 'favorite' | 'rating';
  title: string;
  item_type: 'movie' | 'anime';
  rating?: number;
  created_at: string;
}

/**
 * Fetch comprehensive user statistics from Supabase
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Get total reviews count
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get total favorites count
    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get average rating from reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('user_id', userId);

    let averageRating = 0;
    if (reviewsData && reviewsData.length > 0) {
      const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviewsData.length;
    }

    // Get user creation date
    const { data: userData } = await supabase.auth.getUser();
    const joinedDate = userData.user?.created_at 
      ? new Date(userData.user.created_at).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
        })
      : '';

    // Get recent activity
    const recentActivity = await getRecentActivity(userId);

    return {
      totalReviews: reviewsCount || 0,
      totalFavorites: favoritesCount || 0,
      averageRating: Math.round(averageRating * 10) / 10,
      joinedDate,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalReviews: 0,
      totalFavorites: 0,
      averageRating: 0,
      joinedDate: '',
      recentActivity: [],
    };
  }
}

/**
 * Get recent user activity (reviews and favorites)
 */
export async function getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Get recent reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, title, item_type, rating, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (reviews) {
      reviews.forEach(review => {
        activities.push({
          id: review.id,
          type: 'review',
          title: review.title,
          item_type: review.item_type,
          rating: review.rating,
          created_at: review.created_at,
        });
      });
    }

    // Get recent favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('id, title, item_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (favorites) {
      favorites.forEach(favorite => {
        activities.push({
          id: favorite.id,
          type: 'favorite',
          title: favorite.title,
          item_type: favorite.item_type,
          created_at: favorite.created_at,
        });
      });
    }

    // Sort all activities by date and return the most recent ones
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Get user's favorite items with pagination
 */
export async function getUserFavorites(
  userId: string, 
  options: {
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    const { search = '', limit = 20, offset = 0 } = options;

    let query = supabase
      .from('favorites')
      .select(`
        *,
        movies (
          id,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply search filter on movie title
    if (search) {
      query = query.or(`movies.title.ilike.%${search}%,movies.title_english.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return {
      data: [],
      count: 0,
    };
  }
}

/**
 * Add item to user's favorites
 */
export async function addToFavorites(
  userId: string,
  movieId: string
) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        movie_id: movieId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

/**
 * Remove item from user's favorites
 */
export async function removeFromFavorites(userId: string, movieId: string) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

/**
 * Check if item is in user's favorites
 */
export async function isInFavorites(userId: string, movieId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
}
/**
 * Resolve internal movies.id (UUID) from external id (TMDB/MAL)
 */
export async function getMovieUUIDByExternalId(
  externalId: number | string,
  itemType: 'movie' | 'anime'
): Promise<string | null> {
  try {
    const numericId = typeof externalId === 'string' ? parseInt(externalId, 10) : externalId;
    const column = itemType === 'movie' ? 'tmdb_id' : 'mal_id';
    const { data, error } = await supabase
      .from('movies')
      .select('id')
      .eq(column, numericId)
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) return data[0].id;
    return null;
  } catch (error) {
    console.error('Error resolving internal movie UUID:', error);
    return null;
  }
}

/**
 * Add favorite by external id (TMDB/MAL). Requires movie to exist in movies table.
 */
export async function addToFavoritesByExternal(
  userId: string,
  externalId: number | string,
  itemType: 'movie' | 'anime'
) {
  let movieUUID = await getMovieUUIDByExternalId(externalId, itemType);
  if (!movieUUID) {
    movieUUID = await ensureMovieIndexedByExternal(externalId, itemType);
  }
  if (!movieUUID) {
    throw new Error('MOVIE_NOT_INDEXED');
  }
  return addToFavorites(userId, movieUUID);
}

/**
 * Remove favorite by external id (TMDB/MAL)
 */
export async function removeFromFavoritesByExternal(
  userId: string,
  externalId: number | string,
  itemType: 'movie' | 'anime'
) {
  const movieUUID = await getMovieUUIDByExternalId(externalId, itemType);
  if (!movieUUID) {
    // If the movie isn't indexed, there's nothing to remove.
    return true;
  }
  return removeFromFavorites(userId, movieUUID);
}

/**
 * Check favorite by external id (TMDB/MAL)
 */
export async function isInFavoritesByExternal(
  userId: string,
  externalId: number | string,
  itemType: 'movie' | 'anime'
): Promise<boolean> {
  const movieUUID = await getMovieUUIDByExternalId(externalId, itemType);
  if (!movieUUID) return false;
  return isInFavorites(userId, movieUUID);
}

/**
 * Ensure movie/anime is indexed in movies table by calling server API.
 * Returns the internal UUID if indexing succeeds, otherwise null.
 */
export async function ensureMovieIndexedByExternal(
  externalId: number | string,
  itemType: 'movie' | 'anime'
): Promise<string | null> {
  try {
    const res = await fetch('/api/index-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ externalId, itemType }),
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json?.id ?? null;
  } catch (error) {
    console.warn('Indexing request failed:', error);
    return null;
  }
}