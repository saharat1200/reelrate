'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  ArrowLeft, 
  Heart, 
  Share2, 
  Play,
  Users,
  Award,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TMDBMovieDetails, TMDBCredits, TMDBVideosResponse, tmdbApi, getImageUrl } from '@/lib/api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { addToFavoritesByExternal, removeFromFavoritesByExternal, isInFavoritesByExternal } from '@/lib/user-stats';
import { InlineReviewForm } from '@/components/reviews/InlineReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { useResizeHandler } from '@/hooks/useResizeHandler';

export default function MovieDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = params.locale as string;
  const movieId = parseInt(id);
  const { user } = useAuth();
  const { forceRefresh } = useResizeHandler();
  
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [videos, setVideos] = useState<TMDBVideosResponse | null>(null);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  const fetchMovieData = useCallback(async () => {
    try {
      setLoading(true);
      const [movieData, creditsData, videosData] = await Promise.all([
        tmdbApi.getMovieDetails(movieId),
        tmdbApi.getMovieCredits(movieId),
        tmdbApi.getMovieVideos(movieId)
      ]);
      
      setMovie(movieData);
      setCredits(creditsData);
      setVideos(videosData);
      
      // Check if movie is in favorites
      if (user) {
        const favoriteStatus = await isInFavoritesByExternal(user.id, movieId, 'movie');
        setIsFavorite(favoriteStatus);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลหนังได้');
      console.error('Error fetching movie data:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId, user]);

  useEffect(() => {
    if (movieId) {
      fetchMovieData();
    }
  }, [movieId, user, fetchMovieData]);

  // Handle screen resize and fold/unfold events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && movie && !loading) {
        // Page became visible again, just refresh UI layout without triggering loading
        setTimeout(() => {
          // Only trigger a gentle UI refresh without full re-render
          const event = new CustomEvent('ui-refresh');
          window.dispatchEvent(event);
        }, 100);
      }
    };

    const handleOrientationChange = () => {
      if (movie && !loading) {
        setTimeout(() => {
          forceRefresh();
        }, 300);
      } else if (id && !loading && !movie) {
        // Only re-fetch if we don't have data yet
        setTimeout(() => {
          fetchMovieData();
        }, 300);
      }
    };

    const handleResize = () => {
      // Handle window resize events only if we have data
      if (movie && !loading) {
        setTimeout(() => {
          forceRefresh();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [forceRefresh, id, loading, movie, fetchMovieData]);

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'ไม่ระบุ';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ชม. ${mins} นาที`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDirector = () => {
    if (!credits) return 'ไม่ระบุ';
    const director = credits.crew.find(person => person.job === 'Director');
    return director ? director.name : 'ไม่ระบุ';
  };

  const getMainCast = () => {
    if (!credits) return [];
    return credits.cast.slice(0, 6);
  };

  if (loading && !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-96 bg-gray-300 dark:bg-gray-700"></div>
          
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ไม่พบข้อมูลหนัง
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'ไม่สามารถโหลดข้อมูลหนังได้'}
          </p>
          <Link href={`/${locale}/movies`}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าหนัง
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section with Backdrop */}
        <div className="relative h-96 overflow-hidden">
          {movie.backdrop_path && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            </div>
          )}
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
            <div className="flex items-end space-x-6">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-poster.jpg';
                  }}
                />
              </div>
              
              {/* Basic Info */}
              <div className="text-white">
                <Link href={`/${locale}/movies`} className="inline-flex items-center text-white/80 hover:text-white mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปหน้าหนัง
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-white/90 mb-4 italic">"{movie.tagline}"</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-sm ml-1">({movie.vote_count.toLocaleString()} คะแนน)</span>
                  </div>
                  
                  {movie.release_date && (
                    <div className="flex items-center text-white/90">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(movie.release_date).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                  
                  {movie.runtime && (
                    <div className="flex items-center text-white/90">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    size="lg" 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleWatchTrailer}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    ดูตัวอย่าง
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-black"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} suppressHydrationWarning />
                    {isFavorite ? 'ลบจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-black"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    แชร์
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Synopsis */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">เรื่องย่อ</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {movie.overview || 'ไม่มีเรื่องย่อ'}
                </p>
              </section>

              {/* Cast */}
              {credits && credits.cast.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">นักแสดงหลัก</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getMainCast().map((actor) => (
                      <div key={actor.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                            {actor.profile_path ? (
                              <img
                                src={getImageUrl(actor.profile_path, 'w200')}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {actor.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {actor.character}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">หมวดหมู่</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Movie Details */}
            <div className="space-y-6">
              {/* Movie Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">ข้อมูลหนัง</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ผู้กำกับ</span>
                    <p className="text-gray-900 dark:text-white">{getDirector()}</p>
                  </div>
                  
                  {movie.original_title !== movie.title && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ชื่อต้นฉบับ</span>
                      <p className="text-gray-900 dark:text-white">{movie.original_title}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">สถานะ</span>
                    <p className="text-gray-900 dark:text-white">{movie.status}</p>
                  </div>
                  
                  {movie.budget > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">งบประมาณ</span>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(movie.budget)}</p>
                    </div>
                  )}
                  
                  {movie.revenue > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">รายได้</span>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(movie.revenue)}</p>
                    </div>
                  )}
                  
                  {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ภาษา</span>
                      <p className="text-gray-900 dark:text-white">
                        {movie.spoken_languages.map(lang => lang.name).join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {movie.production_countries && movie.production_countries.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ประเทศผู้ผลิต</span>
                      <p className="text-gray-900 dark:text-white">
                        {movie.production_countries.map(country => country.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Production Companies */}
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">บริษัทผู้ผลิต</h3>
                  <div className="space-y-3">
                    {movie.production_companies.slice(0, 5).map((company) => (
                      <div key={company.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                          {company.logo_path ? (
                            <img
                              src={getImageUrl(company.logo_path, 'w200')}
                              alt={company.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Award className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{company.origin_country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">ลิงก์ภายนอก</h3>
                <div className="space-y-2">
                  {movie.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      IMDb
                    </a>
                  )}
                  {movie.homepage && (
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      เว็บไซต์อย่างเป็นทางการ
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="grid lg:grid-cols-1 gap-8">
              {/* Review Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  เขียนรีวิว
                </h2>
                <InlineReviewForm 
                  movieId={id}
                  movieType="movie"
                  movieTitle={movie?.title || 'หนัง'}
                  onReviewSubmitted={() => setReviewRefreshTrigger(prev => prev + 1)}
                />
              </div>

              {/* Reviews List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  รีวิวจากผู้ใช้
                </h2>
                <ReviewList 
                  movieId={id}
                  movieType="movie"
                  refreshTrigger={reviewRefreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );

  function handleWatchTrailer() {
    console.log('=== Debug: handleWatchTrailer called ===');
    console.log('Videos data:', videos);
    
    if (!videos) {
      console.log('No videos object found');
      // ถ้าไม่มีข้อมูลวิดีโอเลย ให้ค้นหาใน YouTube
      searchOnYouTube();
      return;
    }
    
    if (!videos.results || videos.results.length === 0) {
      console.log('No video results found:', videos.results);
      // ถ้าไม่มีผลลัพธ์วิดีโอ ให้ค้นหาใน YouTube
      searchOnYouTube();
      return;
    }

    console.log('Available videos:', videos.results);

    // หา trailer หรือ teaser จาก YouTube
    const trailer = videos.results.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );

    console.log('Found trailer:', trailer);

    if (trailer) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      console.log('Opening YouTube URL:', youtubeUrl);
      window.open(youtubeUrl, '_blank');
    } else {
      // ถ้าไม่มี Trailer หรือ Teaser ให้ลองหาวิดีโอประเภทอื่น
      const anyVideo = videos.results.find(video => video.site === 'YouTube');
      
      if (anyVideo) {
        console.log('Found alternative video:', anyVideo);
        const youtubeUrl = `https://www.youtube.com/watch?v=${anyVideo.key}`;
        console.log('Opening alternative YouTube URL:', youtubeUrl);
        window.open(youtubeUrl, '_blank');
      } else {
        console.log('No YouTube videos found at all');
        // ถ้าไม่มีวิดีโอใน TMDB เลย ให้ค้นหาใน YouTube
        searchOnYouTube();
      }
    }
  }

  function searchOnYouTube() {
    if (!movie) {
      alert('ไม่สามารถค้นหาได้ เนื่องจากไม่มีข้อมูลหนัง');
      return;
    }

    // สร้าง search query สำหรับ YouTube
    const searchQuery = `${movie.title} trailer ${movie.release_date ? new Date(movie.release_date).getFullYear() : ''}`;
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    
    console.log('Searching YouTube for:', searchQuery);
    console.log('YouTube search URL:', youtubeSearchUrl);
    
    // เปิดหน้าค้นหา YouTube ใน tab ใหม่
    window.open(youtubeSearchUrl, '_blank');
  }

  async function handleToggleFavorite() {
    if (!user || !movie) {
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavoritesByExternal(user.id, movieId, 'movie');
        setIsFavorite(false);
        alert('ลบจากรายการโปรดแล้ว');
      } else {
        await addToFavoritesByExternal(user.id, movieId, 'movie');
        setIsFavorite(true);
        alert('เพิ่มในรายการโปรดแล้ว');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('เกิดข้อผิดพลาดในการจัดการรายการโปรด');
    }
  }

  async function handleShare() {
    const shareData = {
      title: movie?.title || 'หนังน่าดู',
      text: `ดูหนังเรื่อง "${movie?.title}" ใน ReelRate`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  }

  function fallbackShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('คัดลอกลิงก์แล้ว!');
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('คัดลอกลิงก์แล้ว!');
    }
  }
}
