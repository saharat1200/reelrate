import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY as string
const JIKAN_BASE_URL = process.env.NEXT_PUBLIC_JIKAN_API_BASE_URL as string

async function fetchTMDBDetails(movieId: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=th-TH`
  )
  if (!res.ok) throw new Error(`TMDB_FETCH_FAILED_${res.status}`)
  return res.json()
}

async function fetchJikanDetails(animeId: number) {
  const res = await fetch(`${JIKAN_BASE_URL}/anime/${animeId}`)
  if (!res.ok) throw new Error(`JIKAN_FETCH_FAILED_${res.status}`)
  return res.json()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const externalId = body?.externalId
    const itemType = body?.itemType as 'movie' | 'anime'

    if (!externalId || !itemType || (itemType !== 'movie' && itemType !== 'anime')) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'MISSING_SERVICE_KEY' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceKey)

    const numericId = typeof externalId === 'string' ? parseInt(externalId, 10) : externalId

    if (itemType === 'movie') {
      const details = await fetchTMDBDetails(numericId)
      const payload = {
        tmdb_id: numericId,
        title: details?.title ?? '',
        overview: details?.overview ?? null,
        poster_path: details?.poster_path ?? null,
        backdrop_path: details?.backdrop_path ?? null,
        release_date: details?.release_date ?? null,
        genre_ids: details?.genre_ids ?? null,
        vote_average: details?.vote_average ?? null,
        vote_count: details?.vote_count ?? null,
        type: 'movie' as const,
      }

      const { data, error } = await admin
        .from('movies')
        .upsert(payload, { onConflict: 'tmdb_id' })
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ id: data?.id }, { status: 200 })
    } else {
      const { data: anime } = await fetchJikanDetails(numericId)

      const payload = {
        mal_id: numericId,
        title: anime?.title ?? '',
        title_english: anime?.title_english ?? null,
        synopsis: anime?.synopsis ?? null,
        poster_path: anime?.images?.jpg?.large_image_url ?? anime?.images?.jpg?.image_url ?? null,
        aired_from: anime?.aired?.from ? anime.aired.from.substring(0, 10) : null,
        aired_to: anime?.aired?.to ? anime.aired.to.substring(0, 10) : null,
        genres: anime?.genres ?? null,
        score: anime?.score ?? null,
        scored_by: anime?.scored_by ?? null,
        status: anime?.status ?? null,
        anime_type: anime?.type ?? null,
        type: 'anime' as const,
      }

      const { data, error } = await admin
        .from('movies')
        .upsert(payload, { onConflict: 'mal_id' })
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ id: data?.id }, { status: 200 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'UNKNOWN_ERROR' }, { status: 500 })
  }
}