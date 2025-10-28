'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Film, Star, Users, TrendingUp, Play, Sparkles, Award, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TMDBMovie, tmdbApi, getImageUrl, JikanAnime, jikanApi } from '@/lib/api'

export default function HomePage() {
  const params = useParams()
  const locale = params.locale as string
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([])
  const [popularAnime, setPopularAnime] = useState<JikanAnime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesResponse, animeResponse] = await Promise.all([
          tmdbApi.getPopularMovies(),
          jikanApi.getTopAnime()
        ])
        
        setPopularMovies(moviesResponse.results.slice(0, 4))
        setPopularAnime(animeResponse.data.slice(0, 4))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-bounce delay-1000">
            <div className="w-16 h-16 bg-yellow-400 rounded-full opacity-20 blur-sm"></div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse delay-2000">
            <div className="w-12 h-12 bg-pink-400 rounded-full opacity-30 blur-sm"></div>
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce delay-3000">
            <div className="w-20 h-20 bg-blue-400 rounded-full opacity-25 blur-sm"></div>
          </div>
          <div className="absolute bottom-20 right-10 animate-pulse delay-500">
            <div className="w-14 h-14 bg-purple-400 rounded-full opacity-20 blur-sm"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Content */}
          <div className="mb-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-4 border border-white border-opacity-20">
                  <Sparkles className="h-12 w-12 text-yellow-300" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
              ยินดีต้อนรับสู่ ReelRate
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              แพลตฟอร์มรีวิวหนังและอนิเมะที่ครบครันที่สุด พร้อมคุณสมบัติที่ทันสมัยและชุมชนที่มีชีวิตชีวา
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={`/${locale}/movies`}>
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <Film className="mr-2 h-5 w-5 group-hover:animate-spin" />
                สำรวจหนัง
              </Button>
            </Link>
            <Link href={`/${locale}/anime`}>
              <Button size="lg" className="group bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105">
                <Play className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                ดูอนิเมะ
              </Button>
            </Link>
          </div>

          {/* Enhanced Feature Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
            {/* Movie Discovery Card */}
            <div className="group relative bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:rotate-12">
                    <Film className="h-10 w-10 text-white group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-purple-200 transition-colors duration-300">ค้นพบหนังใหม่</h3>
                <p className="text-gray-300 text-center leading-relaxed group-hover:text-white transition-colors duration-300">สำรวจหนังล่าสุดและยอดนิยมจากทั่วโลก พร้อมรีวิวและคะแนนจากผู้ใช้งานจริง</p>
                <div className="mt-6 flex justify-center">
                  <div className="bg-white/10 rounded-full px-4 py-2 text-sm text-white/80 group-hover:bg-white/20 transition-all duration-300">
                    10,000+ หนัง
                  </div>
                </div>
              </div>
            </div>

            {/* Community Card */}
            <div className="group relative bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:rotate-12">
                    <Users className="h-10 w-10 text-white group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-blue-200 transition-colors duration-300">ชุมชนรีวิวเวอร์</h3>
                <p className="text-gray-300 text-center leading-relaxed group-hover:text-white transition-colors duration-300">เข้าร่วมชุมชนคนรักหนังและอนิเมะ แบ่งปันความคิดเห็นและค้นพบเนื้อหาใหม่ๆ</p>
                <div className="mt-6 flex justify-center">
                  <div className="bg-white/10 rounded-full px-4 py-2 text-sm text-white/80 group-hover:bg-white/20 transition-all duration-300">
                    5,000+ สมาชิก
                  </div>
                </div>
              </div>
            </div>

            {/* Rating System Card */}
            <div className="group relative bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-lime-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-green-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-4 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:rotate-12">
                    <Star className="h-10 w-10 text-white group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-emerald-200 transition-colors duration-300">ระบบให้คะแนน</h3>
                <p className="text-gray-300 text-center leading-relaxed group-hover:text-white transition-colors duration-300">ให้คะแนนและรีวิวหนังหรืออนิเมะที่คุณชอบ ช่วยคนอื่นค้นพบเนื้อหาคุณภาพ</p>
                <div className="mt-6 flex justify-center">
                  <div className="bg-white/10 rounded-full px-4 py-2 text-sm text-white/80 group-hover:bg-white/20 transition-all duration-300">
                    50,000+ รีวิว
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white bg-opacity-70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-500 rounded-full blur-2xl animate-float delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-3xl animate-float delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 animate-pulse">
              <Sparkles className="h-8 w-8 text-white animate-bounce" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              ทำไมต้อง ReelRate?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              ค้นพบสิ่งที่ทำให้เราแตกต่างและเป็นที่ชื่นชอบของชุมชนผู้รักหนังและอนิเมะ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 hover-lift animate-fade-in">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Film className="h-8 w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                ฐานข้อมูลครบครัน
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                รวบรวมข้อมูลหนังและอนิเมะจาก TMDB และ Jikan API
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto"></div>
              </div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 hover-lift animate-fade-in delay-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Users className="h-8 w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                ชุมชนผู้รีวิว
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                เข้าร่วมชุมชนและแบ่งปันความคิดเห็นกับผู้อื่น
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
              </div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 hover-lift animate-fade-in delay-200">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                อันดับยอดนิยม
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                ติดตามเทรนด์และอันดับหนัง/อนิเมะยอดนิยม
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
              </div>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 hover-lift animate-fade-in delay-300">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Star className="h-8 w-8 text-white group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                ระบบให้คะแนน
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                ระบบให้คะแนนที่แม่นยำและเชื่อถือได้
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Anime Preview */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              อนิเมะยอดนิยม
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              ค้นพบอนิเมะที่กำลังได้รับความนิยมในขณะนี้
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              // Enhanced Loading placeholders
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    <Film className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              // Enhanced anime cards
              popularAnime.map((anime) => (
                <Link key={anime.mal_id} href={`/${locale}/anime/${anime.mal_id}`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                    <div className="h-80 relative overflow-hidden">
                      <img
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-poster.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      {anime.score && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {anime.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {anime.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {anime.score ? anime.score.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {anime.type || 'Anime'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center">
            <Link href={`/${locale}/anime`}>
              <Button size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                <Play className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                ดูอนิเมะทั้งหมด
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Movies Preview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4">
              <Film className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              หนังยอดนิยม
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              ค้นพบหนังที่กำลังได้รับความนิยมในขณะนี้
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              // Enhanced Loading placeholders
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    <Film className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              // Enhanced movie cards
              popularMovies.map((movie) => (
                <Link key={`popular-${movie.id}`} href={`/${locale}/movies/${movie.id}`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                    <div className="h-64 relative overflow-hidden">
                      <img
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-poster.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute top-4 left-4 bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {movie.vote_average.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {new Date(movie.release_date).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center">
            <Link href={`/${locale}/movies`}>
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <Film className="mr-2 h-5 w-5 group-hover:animate-spin" />
                ดูหนังทั้งหมด
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden" suppressHydrationWarning>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M20%2020c0%2011.046-8.954%2020-20%2020v20h40V20H20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              พร้อมเริ่มรีวิวแล้วหรือยัง?
            </h2>
            <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              สมัครสมาชิกวันนี้และเริ่มแบ่งปันความคิดเห็นของคุณกับชุมชนผู้รักหนังและอนิเมะ
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/auth`}>
              <Button size="lg" className="group bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105">
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                สมัครสมาชิกฟรี
              </Button>
            </Link>
            <Link href={`/${locale}/top-rated`}>
              <Button size="lg" variant="outline" className="group border-2 border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105">
                <TrendingUp className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                ดูอันดับยอดนิยม
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
