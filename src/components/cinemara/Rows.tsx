"use client";

import SafeImg from "./SafeImg";
import { Play, Plus, Check, Info } from "lucide-react";
import type { Title } from "@/lib/cinemara/data";
import { posterUrl } from "@/lib/cinemara/art";

interface CardActions {
  onOpenTitle: (t: Title) => void;
  onPlay: (t: Title) => void;
  inList: (id: string) => boolean;
  onToggleList: (id: string) => void;
}

interface RowProps extends CardActions {
  label: string;
  titles: Title[];
  numbered?: boolean;
}

export function ContentRow({ label, titles, onOpenTitle, onPlay, inList, onToggleList, numbered }: RowProps) {
  if (titles.length === 0) return null;

  return (
    <section className="cinemara-row relative py-3" aria-label={label}>
      <h2 className="mb-2.5 px-4 text-[14px] font-bold leading-snug text-white sm:px-12 sm:text-lg">{label}</h2>
      <div className="relative">
        <div
          className="cinemara-scroll flex gap-2 overflow-x-auto scroll-smooth px-4 pb-1 sm:px-12"
        >
          {titles.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              rank={numbered ? i + 1 : undefined}
              onOpenTitle={onOpenTitle}
              onPlay={onPlay}
              inList={inList}
              onToggleList={onToggleList}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  t,
  rank,
  onOpenTitle,
  onPlay,
  inList,
  onToggleList,
}: CardActions & { t: Title; rank?: number }) {
  const listed = inList(t.id);

  if (rank !== undefined) {
    // Top 10 — giant outlined numeral beside the poster, Netflix style
    return (
      <div className="cinemara-card group relative flex shrink-0 items-end pb-1">
        <span
          aria-hidden
          className="cinemara-rank select-none text-right font-black leading-[0.72] text-black"
          style={{ WebkitTextStroke: "4px #4d4d4d" }}
        >
          {rank}
        </span>
        <button
          onClick={() => onOpenTitle(t)}
          aria-label={t.title}
          className="relative z-10 -ml-5 block w-[112px] shrink-0 overflow-hidden rounded-md sm:-ml-[46px] sm:w-[168px]"
        >
          <SafeImg
            src={posterUrl(t)}
            alt={t.title}
            loading="lazy"
            className="aspect-[84/179] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="cinemara-card-actions absolute inset-x-0 bottom-0 flex items-center justify-between rounded-b-md bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-2 pt-8">
            <span className="flex items-center gap-1.5">
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(t);
                }}
                aria-label={`Play ${t.title}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black"
              >
                <Play className="h-3.5 w-3.5 fill-black" />
              </span>
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleList(t.id);
                }}
                aria-label={listed ? "Remove from My List" : "Add to My List"}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-400 bg-black/70 text-white"
              >
                {listed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </span>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onOpenTitle(t);
              }}
              aria-label={`More info about ${t.title}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-400 bg-black/70 text-white"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="cinemara-card group relative w-[126px] shrink-0 sm:w-[156px] md:w-[176px]">
      <button onClick={() => onOpenTitle(t)} aria-label={t.title} className="block w-full text-left">
        <SafeImg
          src={posterUrl(t)}
          alt={t.title}
          loading="lazy"
          className="aspect-[2/3] w-full rounded-md object-cover"
        />
        <span className="cinemara-card-actions absolute inset-x-0 bottom-0 z-10 flex-col gap-1.5 rounded-b-md bg-gradient-to-t from-black/95 via-black/60 to-transparent px-2.5 pb-2.5 pt-10">
          <span className="flex w-full items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(t);
                }}
                aria-label={`Play ${t.title}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-300"
              >
                <Play className="h-3.5 w-3.5 fill-black" />
              </span>
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleList(t.id);
                }}
                aria-label={listed ? "Remove from My List" : "Add to My List"}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-400 bg-black/70 text-white hover:border-white"
              >
                {listed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </span>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onOpenTitle(t);
              }}
              aria-label={`More info about ${t.title}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-400 bg-black/70 text-white hover:border-white"
            >
              <Info className="h-3.5 w-3.5" />
            </span>
          </span>
          <span className="truncate text-[13px] font-semibold leading-tight text-white">{t.title}</span>
          <span className="text-[11px] leading-none text-neutral-400">{t.year}</span>
        </span>
      </button>
    </div>
  );
}

/** Poster grid with title + year below, for Shows/Movies/Search-style pages.
 *  `badge`    — adds the FILM / TV chip in the poster's top-right corner (search results)
 *  `caption`  — "Title (Year)" single-line caption instead of the stacked two-liner
 */
export function PosterGrid({
  titles,
  onOpenTitle,
  badge = false,
  caption = false,
}: {
  titles: Title[];
  onOpenTitle: (t: Title) => void;
  badge?: boolean;
  caption?: boolean;
}) {
  if (titles.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-7 px-4 pb-16 sm:grid-cols-3 sm:px-12 md:grid-cols-5 lg:grid-cols-6">
      {titles.map((t) => (
        <button key={t.id} onClick={() => onOpenTitle(t)} className="group text-left">
          <span className="relative block overflow-hidden rounded-md">
            <SafeImg
              src={posterUrl(t)}
              alt={t.title}
              loading="lazy"
              className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {badge && (
              <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/90">
                {t.type === "series" ? "SERIES" : "FILM"}
              </span>
            )}
          </span>
          {caption ? (
            <span className="mt-2 block truncate text-sm text-neutral-300">
              {t.title} <span className="text-neutral-500">({t.year})</span>
            </span>
          ) : (
            <>
              <span className="mt-2 block truncate text-sm text-white">{t.title}</span>
              <span className="block text-xs text-neutral-500">{t.year}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
