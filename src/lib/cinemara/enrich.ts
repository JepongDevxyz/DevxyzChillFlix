"use client";

import type { Title, CastMember } from "./data";

interface RecItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number;
  poster: string;
}

/**
 * Fetches full metadata for a title id via the local /api/info proxy
 * (public TMDB-derived metadata). Results are cached per session.
 */
export async function fetchTitleInfo(
  type: "movie" | "tv",
  id: number
): Promise<Partial<Title> & { recItems?: RecItem[] }> {
  const res = await fetch(`/api/info/${type}/${id}`);
  if (!res.ok) throw new Error(`info ${res.status}`);
  const json = (await res.json()) as {
    data: {
      id: number;
      type: "movie" | "tv";
      title: string;
      year: number;
      runtime: number | null;
      seasons: number | null;
      episodes: number | null;
      genres: string[];
      tagline: string;
      overview: string;
      score: number;
      cert: string;
      poster: string;
      backdrop: string;
      trailer: string;
      cast: { n: string; ch: string; p: string }[];
      director: string;
      recs: RecItem[];
    };
  };
  const d = json.data;
  const score = d.score ?? 0;
  return {
    id: `${d.type}-${d.id}`,
    type: d.type,
    title: d.title,
    year: d.year,
    runtime: d.runtime ?? undefined,
    seasons: d.seasons ?? undefined,
    episodeCount: d.episodes ?? undefined,
    genres: d.genres,
    tagline: d.tagline,
    description: d.overview,
    score,
    match: Math.min(99, Math.max(50, Math.round(score * 10))),
    rating: d.cert || "TV-14",
    posterPath: d.poster,
    backdropPath: d.backdrop,
    trailerKey: d.trailer,
    cast: d.cast as CastMember[],
    director: d.director,
    recItems: d.recs,
  };
}

const cache = new Map<string, Partial<Title>>();

export function getCachedInfo(key: string): Partial<Title> | undefined {
  return cache.get(key);
}

export function setCachedInfo(key: string, data: Partial<Title>) {
  cache.set(key, data);
}
