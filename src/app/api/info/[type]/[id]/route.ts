import { NextRequest, NextResponse } from "next/server";

interface RecItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number;
  poster: string;
}

interface RawInfo {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number;
  runtime?: number | null;
  seasonCount?: number | null;
  episodeCount?: number | null;
  genres?: { name: string }[];
  tagline?: string | null;
  overview?: string | null;
  userScore?: number | null;
  regionalCertification?: string | null;
  images?: { poster?: string; backdrop?: string };
  trailer?: { site: string; key?: string } | null;
  credits?: {
    cast?: { name: string; character?: string; profile?: { url?: string } }[];
    crew?: { name: string; job?: string }[];
  };
  creators?: { name: string }[];
  recommendations?: {
    id: number;
    type: string;
    title: string;
    year?: number;
    images?: { poster?: string };
  }[];
}

const UPSTREAM = "https://cinemara.vercel.app/api/cinemara/info";
const TMDB_PREFIXES = ["https://image.tmdb.org/t/p/", "https://media.themoviedb.org/t/p/"];

function stripSize(u: string): string {
  if (!u) return "";
  for (const pre of TMDB_PREFIXES) {
    if (u.startsWith(pre)) u = u.slice(pre.length);
  }
  return u.replace(/^(original|w\d+(_and_h\d+(_face)?)?|h\d+(_face)?)\//, "");
}

function compact(d: RawInfo) {
  const credits = d.credits ?? {};
  const directors = (credits.crew ?? []).filter((c) => c.job === "Director").map((c) => c.name);
  const creators = (d.creators ?? []).map((c) => c.name);
  const trailer = d.trailer && d.trailer.site === "YouTube" ? d.trailer.key ?? "" : "";
  const recs: RecItem[] = (d.recommendations ?? []).slice(0, 9).map((r) => ({
    id: r.id,
    type: r.type === "tv" ? "tv" : "movie",
    title: r.title,
    year: r.year ?? 0,
    poster: stripSize(r.images?.poster ?? ""),
  }));
  return {
    id: d.id,
    type: d.type,
    title: d.title,
    year: d.year,
    runtime: d.runtime ?? null,
    seasons: d.seasonCount ?? null,
    episodes: d.episodeCount ?? null,
    genres: (d.genres ?? []).map((g) => g.name),
    tagline: d.tagline ?? "",
    overview: d.overview ?? "",
    score: d.userScore ?? 0,
    cert: d.regionalCertification ?? "",
    poster: stripSize(d.images?.poster ?? ""),
    backdrop: stripSize(d.images?.backdrop ?? ""),
    trailer,
    cast: (credits.cast ?? []).slice(0, 8).map((c) => ({
      n: c.name,
      ch: c.character ?? "",
      p: stripSize(c.profile?.url ?? ""),
    })),
    director: directors[0] ?? creators[0] ?? "",
    recs,
  };
}

// module-level cache (per server instance)
const cache = new Map<string, object>();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  if (!["movie", "tv"].includes(type) || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }
  const key = `${type}-${id}`;
  const hit = cache.get(key);
  if (hit) return NextResponse.json({ success: true, data: hit });

  try {
    const res = await fetch(
      `${UPSTREAM}/${type}/${id}?include=credits.cast,credits.crew,recommendations`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 });
    }
    const json = (await res.json()) as { data?: RawInfo };
    if (!json.data) {
      return NextResponse.json({ error: "no data" }, { status: 404 });
    }
    const data = compact(json.data);
    cache.set(key, data);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
