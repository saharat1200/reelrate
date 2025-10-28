import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          tmdb_id: number | null
          title: string
          overview: string | null
          poster_path: string | null
          backdrop_path: string | null
          release_date: string | null
          genre_ids: number[] | null
          vote_average: number | null
          vote_count: number | null
          type: 'movie' | 'anime'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tmdb_id?: number | null
          title: string
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          genre_ids?: number[] | null
          vote_average?: number | null
          vote_count?: number | null
          type: 'movie' | 'anime'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tmdb_id?: number | null
          title?: string
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          genre_ids?: number[] | null
          vote_average?: number | null
          vote_count?: number | null
          type?: 'movie' | 'anime'
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          created_at?: string
        }
      }
    }
  }
}