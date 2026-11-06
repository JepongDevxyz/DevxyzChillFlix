"use client";

import { useEffect, useRef, useState } from "react";
import SafeImg from "./SafeImg";
import { Play, Plus, Check, X, ThumbsUp, ThumbsDown, Volume2, VolumeX } from "lucide-react";
import { getTitle, type Title, type RecItem } from "@/lib/cinemara/data";
import { backdropUrl, posterUrl, trailerEmbed } from "@/lib/cinemara/art";
import { fetchTitleInfo, getCachedInfo, setCachedInfo } from "@/lib/cinemara/enrich";

interface Props {
  title: Title;
  onClose: () => void;
  onPlay: (t: Title, episode?: number) => void;
  inList: (id: string) => boolean;
  onToggleList: (id: string) => void;
  onOpenTitle: (t: Title) => void;
}

export default function DetailModal({ title: initial, onClose, onPlay, inList, onToggleList, onOpenTitle }: Props) {
  // self-enrich: fill missing metadata from the info API (cached)
  const [title, setTitle] = useState<Title>(initial);
  const [prevInitial, setPrevInitial] = useState<Title>(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setTitle(initial);
  }

  const needsEnrich =
    !title.description || title.cast.length === 0 || !title.trailerKey;

  useEffect(() => {
    if (!needsEnrich) return;
    const key = title.id;
    const cached = getCachedInfo(key);
    if (cached) {
      Promise.resolve().then(() => setTitle((t) => ({ ...t, ...cached })));
      return;
    }
    const [type, numId] = key.split("-");
    let alive = true;
    fetchTitleInfo(type as "movie" | "tv", Number(numId))
      .then((info) => {
        setCachedInfo(key, info);
        if (alive) setTitle((t) => ({ ...t, ...info }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [needsEnrich, title]);

  const listed = inList(title.id);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<0 | 1 | -1>(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTrailer(true), 900);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: muted ? "mute" : "unMute", args: [] }),
      "*"
    );
  }, [muted]);

  const similarFull = title.recs
    .map((r) => getTitle(r))
    .filter((x): x is Title => Boolean(x));
  const seen = new Set(similarFull.map((s) => s.id));
  const similarLight: Title[] = (title.recItems ?? [])
    .filter((r: RecItem) => !seen.has(`${r.type}-${r.id}`))
    .slice(0, Math.max(0, 10 - similarFull.length))
    .map((r: RecItem) => ({
      id: `${r.type}-${r.id}`,
      title: r.title,
      year: r.year,
      type: r.type === "tv" ? ("series" as const) : ("movie" as const),
      genres: [],
      rating: "",
      match: 0,
      duration: "",
      description: "",
      tagline: "",
      categories: [],
      posterPath: r.poster,
      backdropPath: "",
      trailerKey: "",
      score: 0,
      cast: [],
      director: "",
      recs: [],
      recItems: [],
    }));
  const similar = [...similarFull, ...similarLight].slice(0, 10);

  // enrich light rec cards in parallel so cards show full data (like the original)
  const [recInfo, setRecInfo] = useState<Record<string, Partial<Title>>>({});
  const lightIds = similarLight.map((s) => s.id).join(",");
  useEffect(() => {
    if (!lightIds) return;
    let alive = true;
    const ids = lightIds.split(",");
    Promise.all(
      ids.map((id) => {
        const cached = getCachedInfo(id);
        if (cached) return Promise.resolve([id, cached] as const);
        const [type, numId] = id.split("-");
        return fetchTitleInfo(type as "movie" | "tv", Number(numId))
          .then((info) => {
            setCachedInfo(id, info);
            return [id, info] as const;
          })
          .catch(() => null);
      })
    ).then((pairs) => {
      if (!alive) return;
      const map: Record<string, Partial<Title>> = {};
      for (const p of pairs) {
        if (p) map[p[0]] = p[1];
      }
      setRecInfo(map);
    });
    return () => {
      alive = false;
    };
  }, [lightIds]);

  const embed = title.trailerKey
    ? trailerEmbed(title.trailerKey, { autoplay: true, mute: true, controls: false })
    : "";
  const runtime =
    title.type === "series"
      ? title.duration
      : title.runtime
        ? `${title.runtime} min`
        : title.duration;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 py-4 backdrop-blur-lg sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-label={title.title}
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-[94%] max-w-[768px] overflow-hidden rounded-lg bg-[#181818] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trailer hero — backdrop art shows instantly, trailer fades in over it */}
        <div className="relative aspect-video max-h-[500px] w-full overflow-hidden">
          <SafeImg
            src={backdropUrl(title) || posterUrl(title)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {showTrailer && embed && (
            <iframe
              ref={iframeRef}
              src={embed}
              title={`${title.title} trailer`}
              allow="autoplay; encrypted-media"
              className="absolute left-1/2 top-1/2 h-[132%] w-[132%] -translate-x-1/2 -translate-y-1/2"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#181818]/70 to-transparent" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#181818] text-white transition-colors hover:bg-black"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="max-w-xl text-2xl font-black leading-tight text-white drop-shadow-xl sm:text-[34px]">
              {title.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onPlay(title)}
                className="flex items-center gap-2 rounded bg-white px-5 py-2.5 text-[15px] font-semibold text-black transition-colors hover:bg-white/80"
              >
                <Play className="h-5 w-5 fill-black" /> Play
              </button>
              <button
                onClick={() => onToggleList(title.id)}
                aria-label={listed ? "Remove from My List" : "Add to My List"}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-neutral-400/80 bg-[#181818]/60 text-white transition-colors hover:border-white"
              >
                {listed ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setLiked((v) => (v === 1 ? 0 : 1))}
                aria-label="I like this"
                aria-pressed={liked === 1}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 bg-[#181818]/60 transition-colors hover:border-white ${
                  liked === 1 ? "border-white text-white" : "border-neutral-400/80 text-white"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLiked((v) => (v === -1 ? 0 : -1))}
                aria-label="Not for me"
                aria-pressed={liked === -1}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 bg-[#181818]/60 transition-colors hover:border-white ${
                  liked === -1 ? "border-white text-white" : "border-neutral-400/80 text-white"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute trailer" : "Mute trailer"}
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-neutral-400/80 bg-[#181818]/60 text-white transition-colors hover:border-white"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Meta + cast column */}
        <div className="grid gap-8 px-6 py-5 sm:grid-cols-[1fr_240px]">
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm">
              <span className="font-semibold text-[#27E9B5]">{title.match}% Match</span>
              <span className="text-neutral-300">{title.year}</span>
              {title.score > 0 && (
                <span className="rounded border border-neutral-500 px-1 py-0.5 text-[11px] leading-none text-neutral-200">
                  {title.score}
                </span>
              )}
              <span className="text-neutral-300">{runtime}</span>
              <span className="rounded border border-neutral-500 px-1 py-0.5 text-[10px] font-semibold leading-none text-neutral-200">
                HD
              </span>
            </div>
            {title.tagline && (
              <p className="mt-3 text-sm italic leading-relaxed text-neutral-400">{title.tagline}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-neutral-100">{title.description}</p>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed">
            {title.cast.length > 0 && (
              <p>
                <span className="text-neutral-500">Cast: </span>
                <span className="text-neutral-200">
                  {title.cast.slice(0, 6).map((c) => c.n).join(", ")}
                </span>
              </p>
            )}
            {(title.director || title.type === "series") && (
              <p>
                <span className="text-neutral-500">
                  {title.type === "series" ? "Creator: " : "Director: "}
                </span>
                <span className="text-neutral-200">{title.director || "—"}</span>
              </p>
            )}
            {title.genres.length > 0 && (
              <p>
                <span className="text-neutral-500">Genres: </span>
                <span className="text-neutral-200">{title.genres.join(", ")}</span>
              </p>
            )}
          </div>
        </div>

        {/* More Like This */}
        {similar.length > 0 && (
          <div className="px-6 pb-10">
            <h3 className="mb-4 text-lg font-bold text-white">More Like This</h3>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {similar.map((raw) => {
                const s = { ...raw, ...(recInfo[raw.id] ?? {}) } as Title;
                return (
                <button
                  key={s.id}
                  onClick={() => onOpenTitle(s)}
                  className="group text-left"
                >
                  <span className="relative block aspect-video w-full overflow-hidden rounded-sm bg-neutral-900">
                    <SafeImg
                      src={backdropUrl(s, "w780") || posterUrl(s)}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-[12px] leading-snug text-neutral-400">
                    {s.title}
                  </span>
                </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
