// Cinemara catalog — real title metadata (TMDB-derived), compact local dataset.
// Posters/backdrops are served through the local /api/image proxy.
import raw from "@/data/catalog.json";

export type TrackType = "movie" | "series";

export interface CastMember {
  n: string;
  ch: string | null;
  p: string;
}

export interface Title {
  id: string; // "tv-250923"
  title: string;
  year: number;
  type: TrackType;
  genres: string[];
  rating: string; // TV-MA, PG-13 ...
  match: number; // 50-99 (%)
  duration: string; // "2h 25m" or "3 Seasons"
  description: string;
  tagline: string;
  categories: Category[];
  kids?: boolean;
  seasons?: number;
  episodeCount?: number;
  runtime?: number;
  posterPath: string; // TMDB path w/o size prefix
  backdropPath: string;
  trailerKey: string; // YouTube key
  score: number; // 0-10
  cast: CastMember[];
  director: string;
  recs: string[]; // recommended title ids present in catalog
  recItems: RecItem[]; // raw recommendations (may be outside catalog)
}

export interface RecItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number;
  poster: string;
}

export type Category =
  | "trending-movies"
  | "trending-series"
  | "popular"
  | "top10-movies"
  | "top10-series"
  | "latest-movies"
  | "latest-tv"
  | "kdrama"
  | "jdrama"
  | "cdrama"
  | "new-on-cinemara";

export const CATEGORY_LABELS: Record<Category, string> = {
  "trending-movies": "Trending Movies",
  "trending-series": "Trending Series",
  popular: "Popular",
  "top10-movies": "Top 10 Movies",
  "top10-series": "Top 10 Series",
  "latest-movies": "Latest Movies",
  "latest-tv": "Latest TV Shows",
  kdrama: "Latest K-Dramas",
  jdrama: "Latest J-Dramas",
  cdrama: "Latest C-Dramas",
  "new-on-cinemara": "New on Jepong Devxyz",
};

interface RawItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number;
  rd: string;
  runtime: number | null;
  seasons: number | null;
  episodes: number | null;
  genres: string[];
  tagline: string | null;
  overview: string | null;
  score: number | null;
  rating: string | null;
  poster: string;
  backdrop: string;
  trailer: string | null;
  cast: { n: string; ch: string | null; p: string }[];
  director: string | null;
  recs: { id: number; type: string; title: string }[];
}

interface RawData {
  hero: string;
  rows: Record<string, string[]>;
  items: Record<string, RawItem>;
  avatars: string[];
}

const data = raw as unknown as RawData;

function fmtDuration(item: RawItem): string {
  if (item.type === "tv") {
    const s = item.seasons ?? 1;
    return `${s} Season${s > 1 ? "s" : ""}`;
  }
  const m = item.runtime ?? 0;
  if (!m) return "";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h ${r ? `${r}m` : ""}`.trim() : `${r}m`;
}

const KIDS_CERTS = new Set(["G", "PG", "TV-G", "TV-PG", "TV-Y", "TV-Y7", "TV-Y7-FV"]);

function build(id: string, item: RawItem): Title {
  const recs = (item.recs ?? [])
    .map((r) => `${r.type === "tv" ? "tv" : "movie"}-${r.id}`)
    .filter((rid) => rid in data.items);
  const recItems = (item.recs ?? []).map((r) => ({
    id: r.id,
    type: (r.type === "tv" ? "tv" : "movie") as "movie" | "tv",
    title: r.title,
    year: r.year ?? 0,
    poster: r.poster ?? "",
  }));
  return {
    id,
    title: item.title,
    year: item.year,
    type: item.type === "tv" ? "series" : "movie",
    genres: item.genres ?? [],
    rating: item.rating ?? "TV-14",
    match: Math.min(99, Math.max(50, Math.round((item.score ?? 7) * 10))),
    duration: fmtDuration(item),
    description: item.overview ?? "",
    tagline: item.tagline ?? "",
    categories: [],
    kids: KIDS_CERTS.has(item.rating ?? ""),
    seasons: item.seasons ?? undefined,
    episodeCount: item.episodes ?? undefined,
    runtime: item.runtime ?? undefined,
    posterPath: item.poster,
    backdropPath: item.backdrop,
    trailerKey: item.trailer ?? "",
    score: item.score ?? 0,
    cast: item.cast ?? [],
    director: item.director ?? "",
    recs,
    recItems,
  };
}

export const CATALOG: Title[] = Object.entries(data.items).map(([id, item]) =>
  build(id, item)
);

const byId = new Map(CATALOG.map((t) => [t.id, t]));

// attach categories from row order (dedupe)
for (const [row, ids] of Object.entries(data.rows)) {
  const cat = (
    {
      trendingMovies: "trending-movies",
      trendingSeries: "trending-series",
      popular: "popular",
      top10Series: "top10-series",
      top10Movies: "top10-movies",
      latestMovies: "latest-movies",
      latestTv: "latest-tv",
      kdrama: "kdrama",
      jdrama: "jdrama",
      cdrama: "cdrama",
      newOnCinemara: "new-on-cinemara",
    } as Record<string, Category>
  )[row];
  if (!cat) continue;
  ids.forEach((id) => {
    const t = byId.get(id);
    if (t && !t.categories.includes(cat)) t.categories.push(cat);
  });
}

export const HERO_ID = data.hero;
/** Hero pool mirrors the original site (random pick per cold load). */
export const HERO_IDS: string[] =
  (data as unknown as { heroes?: string[] }).heroes && (data as unknown as { heroes: string[] }).heroes.length > 0
    ? (data as unknown as { heroes: string[] }).heroes
    : [data.hero];
export const AVATAR_URLS: string[] = data.avatars ?? [];

export function getTitle(id: string): Title | undefined {
  return byId.get(id);
}

export function byCategory(cat: Category): Title[] {
  const rows: Record<string, string[]> = data.rows;
  const ids: string[] =
    (
      {
        "trending-movies": rows.trendingMovies,
        "trending-series": rows.trendingSeries,
        popular: rows.popular,
        "top10-movies": rows.top10Movies,
        "top10-series": rows.top10Series,
        "latest-movies": rows.latestMovies,
        "latest-tv": rows.latestTv,
        kdrama: rows.kdrama,
        jdrama: rows.jdrama,
        cdrama: rows.cdrama,
        "new-on-cinemara": rows.newOnCinemara,
      } as Record<string, string[] | undefined>
    )[cat] ?? [];
  return ids.map((id) => byId.get(id)).filter(Boolean) as Title[];
}

export function byType(type: TrackType): Title[] {
  return CATALOG.filter((t) => t.type === type);
}

export function searchCatalog(q: string): Title[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return CATALOG.filter(
    (t) =>
      t.title.toLowerCase().includes(s) ||
      t.genres.some((g) => g.toLowerCase().includes(s)) ||
      String(t.year).includes(s) ||
      (t.director && t.director.toLowerCase().includes(s)) ||
      t.cast.some((c) => c.n.toLowerCase().includes(s))
  );
}

/** Home row order mirrors the original site for a signed-in profile. */
export function homeRowsFor(historyIds: string[]): {
  label: string;
  cat?: Category;
  titles?: Title[];
  numbered?: boolean;
}[] {
  const rows: { label: string; cat?: Category; titles?: Title[]; numbered?: boolean }[] = [];
  if (historyIds.length > 0) {
    const cw = historyIds.map((id) => byId.get(id)).filter(Boolean) as Title[];
    rows.push({ label: `Continue Watching`, titles: cw });
    const seed = cw[0];
    if (seed) {
      const because = seed.recs
        .map((r) => byId.get(r))
        .filter(Boolean) as Title[];
      if (because.length >= 6)
        rows.push({ label: `Because you watched ${seed.title}`, titles: because });
    }
  }
  rows.push({ label: "Trending Movies", cat: "trending-movies" });
  rows.push({ label: "Trending Series", cat: "trending-series" });
  rows.push({ label: "Popular", cat: "popular" });
  rows.push({ label: "Top 10 Series", cat: "top10-series", numbered: true });
  rows.push({ label: "Top 10 Movies", cat: "top10-movies", numbered: true });
  rows.push({ label: "Latest Movies", cat: "latest-movies" });
  rows.push({ label: "Latest TV Shows", cat: "latest-tv" });
  rows.push({ label: "Latest K-Dramas", cat: "kdrama" });
  rows.push({ label: "Latest J-Dramas", cat: "jdrama" });
  rows.push({ label: "Latest C-Dramas", cat: "cdrama" });
  return rows;
}
