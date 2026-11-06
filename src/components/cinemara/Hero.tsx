"use client";

import { useEffect, useRef, useState } from "react";
import SafeImg from "./SafeImg";
import { Play, Info, Plus, Check, Volume2 } from "lucide-react";
import { getTitle, HERO_IDS, type Title } from "@/lib/cinemara/data";
import { backdropUrl, trailerEmbed } from "@/lib/cinemara/art";

interface Props {
  onPlay: (t: Title) => void;
  onInfo: (t: Title) => void;
  inList: (id: string) => boolean;
  onToggleList: (id: string) => void;
}

export default function Hero({ onPlay, onInfo, inList, onToggleList }: Props) {
  const [trailerFailed, setTrailerFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // original site picks a random featured title on every cold load
  const [heroId] = useState(() => HERO_IDS[Math.floor(Math.random() * HERO_IDS.length)]);
  const hero = getTitle(heroId) ?? getTitle(HERO_IDS[0]) ?? undefined;
  const t = hero;
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!t?.trailerKey) return;
    const timer = setTimeout(() => setShowTrailer(true), 1200);
    return () => clearTimeout(timer);
  }, [t?.trailerKey]);

  if (!t) return null;
  const listed = inList(t.id);
  const embed = t.trailerKey ? trailerEmbed(t.trailerKey, { autoplay: true, mute: true, controls: false, loop: true }) : "";

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: [] }),
      "*"
    );
  };

  return (
    <section
      aria-label="Featured"
      className="relative mx-3 h-[600px] overflow-hidden rounded-xl bg-neutral-950 sm:mx-6 lg:mx-10 lg:h-[636px]"
    >
      {/* Trailer background (falls back to backdrop art) */}
      {showTrailer && embed && !trailerFailed ? (
        <iframe
          ref={iframeRef}
          src={embed}
          title={`${t.title} trailer`}
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2"
          onError={() => setTrailerFailed(true)}
        />
      ) : (
        <SafeImg
          src={backdropUrl(t)}
          alt=""
          className="cinemara-hero-fade absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Cinematic scrims */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Brand mark */}
      <div
        aria-hidden
        className="absolute left-8 top-7 flex h-11 w-11 select-none items-center justify-center"
      >
        <span
          className="text-4xl leading-none text-[#26E4B6]"
          style={{ fontFamily: "var(--font-anton), var(--font-geist-sans), sans-serif" }}
        >
          J
        </span>
      </div>

      {/* Tap for sound — mirrors the original's unmute pill while the trailer plays muted */}
      {showTrailer && embed && !trailerFailed && muted && (
        <button
          onClick={toggleMute}
          aria-label="Tap for sound"
          className="absolute bottom-[13%] right-4 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3.5 py-2 text-[13px] font-medium text-white backdrop-blur transition-colors hover:bg-black/85 sm:right-10 max-sm:bottom-auto max-sm:right-3 max-sm:top-24"
        >
          <Volume2 className="h-4 w-4" /> Tap for sound
        </button>
      )}

      <div className="absolute inset-x-0 bottom-[13%] px-6 sm:px-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-[68px]">
            {t.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-neutral-200">
            <span className="font-semibold text-[#27E9B5]">{t.match}% Match</span>
            <span aria-hidden className="text-neutral-500">·</span>
            <span>{t.year}</span>
            <span aria-hidden className="text-neutral-500">·</span>
            <span>{t.type === "series" ? "Series" : "Film"}</span>
            {t.genres.length > 0 && (
              <>
                <span aria-hidden className="text-neutral-500">·</span>
                <span>{t.genres.join("•")}</span>
              </>
            )}
            {t.type === "series" ? (
              t.rating && (
                <span className="ml-1 rounded border border-neutral-400/70 px-1.5 py-0.5 text-[11px] leading-none text-neutral-200">
                  {t.rating}
                </span>
              )
            ) : (
              <>
                {t.duration && <span>{t.duration}</span>}
                {t.rating && (
                  <span className="ml-1 rounded border border-neutral-400/70 px-1.5 py-0.5 text-[11px] leading-none text-neutral-200">
                    {t.rating}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-neutral-100 drop-shadow sm:line-clamp-2 sm:text-[15px]">
            {t.description}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onPlay(t)}
              className="flex items-center gap-2 whitespace-nowrap rounded-md bg-white px-6 py-2.5 text-[15px] font-semibold text-black transition-colors hover:bg-white/80 sm:px-7"
            >
              <Play className="h-5 w-5 fill-black" /> Play
            </button>
            <button
              onClick={() => onInfo(t)}
              className="flex items-center gap-2 whitespace-nowrap rounded-md bg-neutral-500/60 px-5 py-2.5 text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-neutral-500/45 sm:px-6"
            >
              <Info className="h-5 w-5" /> More Info
            </button>
            <button
              onClick={() => onToggleList(t.id)}
              aria-label={listed ? "Remove from My List" : "Add to My List"}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-400/80 bg-black/40 text-white transition-colors hover:border-white"
            >
              {listed ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
