'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JikanAnime, jikanApi } from '@/lib/api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { addToFavoritesByExternal, removeFromFavoritesByExternal, isInFavoritesByExternal } from '@/lib/user-stats';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { InlineReviewForm } from '@/components/reviews/InlineReviewForm';
import { useResizeHandler } from '@/hooks/useResizeHandler';

export default function AnimeDetailPage() {
  const params = useParams();
  const t = useTranslations();
  const id = params.id as string;
  const locale = params.locale as string;
  const { user } = useAuth();
  const { forceRefresh } = useResizeHandler();
  
  const [anime, setAnime] = useState<JikanAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  const fetchAnimeDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jikanApi.getAnimeDetails(parseInt(id));
      setAnime(response.data);
      
      // Check if anime is in favorites
      if (user) {
        const favoriteStatus = await isInFavoritesByExternal(user.id, id, 'anime');
        setIsFavorite(favoriteStatus);
      }
    } catch (err) {
      console.error('Error fetching anime details:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [id, user, t]);

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
    }
  }, [id, user, fetchAnimeDetails]);

  // Handle screen resize and fold/unfold events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && anime && !loading) {
        // Page became visible again, just refresh UI layout without triggering loading
        setTimeout(() => {
          // Only trigger a gentle UI refresh without full re-render
          const event = new CustomEvent('ui-refresh');
          window.dispatchEvent(event);
        }, 100);
      }
    };

    const handleOrientationChange = () => {
      if (anime && !loading) {
        setTimeout(() => {
          forceRefresh();
        }, 300);
      } else if (id && !loading && !anime) {
        // Only re-fetch if we don't have data yet
        setTimeout(() => {
          fetchAnimeDetails();
        }, 300);
      }
    };

    const handleResize = () => {
      // Handle window resize events only if we have data
      if (anime && !loading) {
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
  }, [forceRefresh, id, loading, anime, fetchAnimeDetails]);

  const handleWatchTrailer = () => {
    if (!anime || !anime.trailer || !anime.trailer.youtube_id) {
      alert(t('details.noTrailer') || 'ไม่มีตัวอย่างอนิเมะสำหรับเรื่องนี้');
      return;
    }

    // เปิด YouTube trailer
    window.open(`https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`, '_blank');
  };

  const handleToggleFavorite = async () => {
    if (!user || !anime) {
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavoritesByExternal(user.id, id, 'anime');
        setIsFavorite(false);
        alert('ลบจากรายการโปรดแล้ว');
      } else {
        await addToFavoritesByExternal(user.id, id, 'anime');
        setIsFavorite(true);
        alert('เพิ่มในรายการโปรดแล้ว');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('เกิดข้อผิดพลาดในการจัดการรายการโปรด');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: anime?.title || 'อนิเมะน่าดู',
      text: `ดูอนิเมะเรื่อง "${anime?.title}" ใน ReelRate`,
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
  };

  const fallbackShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(t('common.linkCopied') || 'คัดลอกลิงก์แล้ว!');
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(t('common.linkCopied') || 'คัดลอกลิงก์แล้ว!');
    }
  };

  if (loading && !anime) {
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

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('common.notFound') || 'ไม่พบอนิเมะที่ค้นหา'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('common.notFoundDescription') || 'อนิเมะที่คุณค้นหาอาจไม่มีอยู่ในระบบ'}
          </p>
          <Link href={`/${locale}/anime`}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าอนิเมะ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section with Background */}
        <div className="relative h-96 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${anime.images.jpg.large_image_url})`,
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
            <div className="flex items-end space-x-6">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-2xl border-4 border-white/20"
                />
              </div>
              
              {/* Basic Info */}
              <div className="text-white pb-4">
                <Link href={`/${locale}/anime`} className="inline-flex items-center text-white/80 hover:text-white mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back') || 'กลับไปหน้าอนิเมะ'}
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {anime.title_english || anime.title}
                </h1>
                
                {anime.title_english && anime.title !== anime.title_english && (
                  <p className="text-xl text-white/80 mb-4">{anime.title}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm">
                  {anime.score && (
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{anime.score.toFixed(1)}</span>
                      {anime.scored_by && (
                        <span className="text-white/60 ml-1">({anime.scored_by.toLocaleString()} {t('details.ratings') || 'คะแนน'})</span>
                      )}
                    </div>
                  )}
                
                  {anime.aired.from && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(anime.aired.from).getFullYear()}</span>
                    </div>
                  )}
                
                  <div className="flex items-center">
                    <Tv className="w-4 h-4 mr-1" />
                    <span>{anime.type}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-4 mt-6">
                  <Button 
                    size="lg" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleWatchTrailer}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {t('details.watchTrailer') || 'ดูตัวอย่าง'}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-gray-900"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} suppressHydrationWarning />
                    {isFavorite ? (t('details.removeFromFavorites') || 'ลบจากรายการโปรด') : (t('details.addToFavorites') || 'เพิ่มในรายการโปรด')}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-gray-900"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    {t('details.share') || 'แชร์'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Synopsis */}
              {anime.synopsis && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('details.synopsis') || 'เรื่องย่อ'}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {anime.synopsis}
                  </p>
                </div>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('details.genres') || 'หมวดหมู่'}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre.mal_id}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Anime Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('details.animeInfo') || 'ข้อมูลอนิเมะ'}
                </h3>
                
                <div className="space-y-3 text-sm">
                  {anime.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('details.status') || 'สถานะ'}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{anime.status}</span>
                    </div>
                  )}
                  
                  {anime.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('details.type') || 'ประเภท'}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{anime.type}</span>
                    </div>
                  )}
                  
                  {anime.aired.from && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('details.airDate') || 'วันที่เริ่มออกอากาศ'}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(anime.aired.from).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  )}
                  
                  {anime.aired.to && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('details.endDate') || 'วันที่จบ'}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(anime.aired.to).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  )}
                  
                  {anime.score && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('details.malScore') || 'คะแนน MAL'}:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {anime.score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {anime.scored_by && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('details.ratedBy') || 'จำนวนผู้ให้คะแนน'}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {anime.scored_by.toLocaleString()} {t('details.people') || 'คน'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* External Links */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('details.externalLinks') || 'ลิงก์ภายนอก'}
                </h3>
                
                <div className="space-y-2">
                  <a
                    href={`https://myanimelist.net/anime/${anime.mal_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">MyAnimeList</span>
                    </div>
                    <span className="text-xs text-gray-500">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Review Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  เขียนรีวิว
                </h2>
                <InlineReviewForm 
                  movieId={id}
                  movieType="anime"
                  movieTitle={anime?.title_english || anime?.title || 'อนิเมะ'}
                  onReviewSubmitted={() => setReviewRefreshTrigger(prev => prev + 1)}
                />
              </div>

              {/* Review List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <ReviewList 
                  movieId={id}
                  movieType="anime"
                  refreshTrigger={reviewRefreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
