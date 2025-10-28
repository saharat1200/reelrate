'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { tmdbApi, jikanApi, TMDBMovie, JikanAnime } from '@/lib/api'
import { 
  Search, 
  Menu, 
  X, 
  User, 
  Heart, 
  Settings, 
  LogOut,
  Film,
  Tv
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationBell } from '@/components/notifications'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || 'th'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{movies: TMDBMovie[], anime: JikanAnime[]}>({movies: [], anime: []})
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length >= 2) {
        performSearch(searchQuery.trim())
      } else {
        setSearchResults({movies: [], anime: []})
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const [moviesResponse, animeResponse] = await Promise.all([
        tmdbApi.searchMovies(query, 1),
        jikanApi.searchAnime(query, 1)
      ])
      
      const animeResults = animeResponse.data.slice(0, 5);
      
      setSearchResults({
        movies: moviesResponse.results.slice(0, 5),
        anime: animeResults
      })
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearchResults(false)
    }
  }

  const handleResultClick = (type: 'movie' | 'anime', id: number) => {
    const url = type === 'movie' ? `/${locale}/movies/${id}` : `/${locale}/anime/${id}`
    router.push(url)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ReelRate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${locale}/movies`} 
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Film className="h-4 w-4" />
              <span>หนัง</span>
            </Link>
            <Link 
              href={`/${locale}/anime`} 
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Tv className="h-4 w-4" />
              <span>อนิเมะ</span>
            </Link>
            <Link 
              href={`/${locale}/top-rated`} 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              อันดับยอดนิยม
            </Link>
          </nav>

          {/* Search Bar with Live Results */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาหนัง, อนิเมะ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.movies.length > 0 || searchResults.anime.length > 0) {
                    setShowSearchResults(true)
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Live Search Results */}
              {showSearchResults && (searchResults.movies.length > 0 || searchResults.anime.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearching && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      กำลังค้นหา...
                    </div>
                  )}
                  
                  {!isSearching && searchResults.movies.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                        หนัง
                      </div>
                      {searchResults.movies.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleResultClick('movie', movie.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title}
                              className="w-10 h-14 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                              <Film className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {movie.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!isSearching && searchResults.anime.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                        อนิเมะ
                      </div>
                      {searchResults.anime.map((anime) => (
                        <button
                          key={anime.mal_id}
                          onClick={() => handleResultClick('anime', anime.mal_id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          {anime.images?.jpg?.image_url ? (
                            <img
                              src={anime.images.jpg.image_url}
                              alt={anime.title}
                              className="w-10 h-14 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                              <Tv className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {anime.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!isSearching && searchQuery.trim() && (
                    <button
                      onClick={handleSearch}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 border-t border-gray-200 dark:border-gray-600"
                    >
                      <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ดูผลการค้นหาทั้งหมดสำหรับ "{searchQuery}"
                      </span>
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Bell - Only show when user is logged in */}
            {user && <NotificationBell />}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{user.user_metadata?.full_name || user.email}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      โปรไฟล์
                    </Link>
                    <Link
                      href={`/${locale}/favorites`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      รายการโปรด
                    </Link>
                    {user.user_metadata?.role === 'admin' && (
                      <Link
                        href={`/${locale}/admin`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        จัดการระบบ
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${locale}/auth`}>
                <Button size="sm">เข้าสู่ระบบ</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาหนัง, อนิเมะ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link
                href={`/${locale}/movies`}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Film className="h-4 w-4" />
                <span>หนัง</span>
              </Link>
              <Link
                href={`/${locale}/anime`}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Tv className="h-4 w-4" />
                <span>อนิเมะ</span>
              </Link>
              <Link
                href={`/${locale}/top-rated`}
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                อันดับยอดนิยม
              </Link>
            </div>

            {/* Mobile Settings */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ธีม</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}