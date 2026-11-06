"use client";

import { useMemo, useState } from "react";
import SafeImg from "./SafeImg";
import {
  byType,
  byCategory,
  CATEGORY_LABELS,
  getTitle,
  type Title,
  type Category,
} from "@/lib/cinemara/data";
import { ContentRow, PosterGrid } from "./Rows";
import type { WatchEntry, Profile } from "@/lib/cinemara/store";
import { avatarUrl, backdropUrl, posterUrl } from "@/lib/cinemara/art";
import {
  Play,
  History,
  ListPlus,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Heart,
  Github,
  Facebook,
  Search,
} from "lucide-react";

interface CommonProps {
  onOpenTitle: (t: Title) => void;
  onPlay: (t: Title) => void;
  inList: (id: string) => boolean;
  onToggleList: (id: string) => void;
}

type SortKey = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";

const SORT_LABELS: Record<SortKey, string> = {
  "popularity.desc": "Popularity",
  "vote_average.desc": "Rating",
  "primary_release_date.desc": "Newest",
};

function SortSelect({ value, onChange, label }: { value: SortKey; onChange: (v: SortKey) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
          aria-label="Sort by"
          className="appearance-none rounded border border-neutral-600 bg-[#141414] py-2 pl-3 pr-9 text-sm text-white focus:outline-none"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              {SORT_LABELS[k]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
      </div>
    </div>
  );
}

function sortTitles(titles: Title[], key: SortKey): Title[] {
  const arr = [...titles];
  if (key === "vote_average.desc") arr.sort((a, b) => b.score - a.score);
  else if (key === "primary_release_date.desc") arr.sort((a, b) => (b.rd || "").localeCompare(a.rd || ""));
  // popularity.desc keeps catalog order (already popularity-ranked)
  return arr;
}

function PageHeading({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 px-4 pt-24 sm:px-12">
      <h1 className="text-4xl font-bold text-white">{children}</h1>
      {right}
    </div>
  );
}

export function ShowsView(props: CommonProps) {
  const [sort, setSort] = useState<SortKey>("popularity.desc");
  const series = useMemo(() => sortTitles(byType("series"), sort), [sort]);
  return (
    <div className="pb-10">
      <PageHeading right={<SortSelect value={sort} onChange={setSort} label="Sort by" />}>
        TV Shows
      </PageHeading>
      <PosterGrid titles={series} onOpenTitle={props.onOpenTitle} />
    </div>
  );
}

export function MoviesView(props: CommonProps) {
  const [sort, setSort] = useState<SortKey>("popularity.desc");
  const movies = useMemo(() => sortTitles(byType("movie"), sort), [sort]);
  return (
    <div className="pb-10">
      <PageHeading right={<SortSelect value={sort} onChange={setSort} label="Sort by" />}>
        Movies
      </PageHeading>
      <PosterGrid titles={movies} onOpenTitle={props.onOpenTitle} />
    </div>
  );
}

const NP_CATEGORIES: { key: Category | "all"; label: string }[] = [
  { key: "new-on-cinemara", label: "New on Jepong Devxyz" },
  { key: "trending-movies", label: "Trending Movies" },
  { key: "trending-series", label: "Trending Series" },
  { key: "top10-movies", label: "Top 10 Movies" },
  { key: "top10-series", label: "Top 10 Series" },
];

export function NewPopularView({ onOpenTitle }: CommonProps) {
  const [cat, setCat] = useState<Category | "all">("new-on-cinemara");
  const titles = useMemo(
    () => (cat === "all" ? [] : byCategory(cat)),
    [cat]
  );
  return (
    <div className="pb-10">
      <PageHeading
        right={
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Category</span>
            <div className="relative">
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as Category)}
                aria-label="Category"
                className="appearance-none rounded border border-neutral-600 bg-[#141414] py-2 pl-3 pr-9 text-sm text-white focus:outline-none"
              >
                {NP_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
            </div>
          </div>
        }
      >
        New &amp; Popular
      </PageHeading>
      <h2 className="mb-5 px-4 text-xl font-bold text-white sm:px-12">
        {CATEGORY_LABELS[cat as Category] ?? "New on Jepong Devxyz"}
      </h2>
      <PosterGrid titles={titles} onOpenTitle={onOpenTitle} />
    </div>
  );
}

export function MyListView({
  ids,
  onOpenTitle,
  onBrowse,
  profileName,
}: {
  ids: string[];
  onOpenTitle: (t: Title) => void;
  onBrowse: () => void;
  profileName: string;
}) {
  const titles = ids.map(getTitle).filter(Boolean) as Title[];
  return (
    <div className="flex min-h-[70vh] flex-col pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-24 sm:px-12">
        <h1 className="text-5xl font-bold text-white">My List</h1>
        <span className="text-sm text-neutral-400">
          {titles.length} titles · {profileName}
        </span>
      </div>
      {titles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <ListPlus className="mb-5 h-12 w-12 text-neutral-700" strokeWidth={1.5} />
          <h2 className="text-2xl font-medium text-white">Your list is empty</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
            Add titles to My List using the + button and they will show up here, saved for this
            profile.
          </p>
          <button
            onClick={onBrowse}
            className="mt-8 rounded bg-white px-6 py-2.5 text-base font-semibold text-black transition-colors hover:bg-white/80"
          >
            Browse Titles
          </button>
        </div>
      ) : (
        <div className="pt-8">
          <PosterGrid titles={titles} onOpenTitle={onOpenTitle} />
        </div>
      )}
    </div>
  );
}

export function MyCinemaraView({
  profile,
  history,
  listIds,
  onOpenTitle,
  onPlay,
}: CommonProps & { profile: Profile; history: WatchEntry[]; listIds: string[] }) {
  const continueWatching = history
    .map((h) => ({ entry: h, title: getTitle(h.titleId) }))
    .filter((x): x is { entry: WatchEntry; title: Title } => Boolean(x.title))
    .slice(0, 10);
  const recently = continueWatching.slice(0, 6);
  const fromList = listIds.map(getTitle).filter(Boolean) as Title[];

  return (
    <div className="pb-10 pt-24">
      {/* Profile header */}
      <div className="mb-10 flex items-center gap-5 px-4 sm:px-12">
        <SafeImg
          src={avatarUrl(profile.avatarIdx)}
          alt={`${profile.name} avatar`}
          className="h-20 w-20 rounded-xl object-cover"
        />
        <div>
          <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
          <p className="mt-1 text-sm text-neutral-400">Premium Member</p>
        </div>
      </div>

      {/* Continue Watching */}
      <section aria-label="Continue Watching" className="mb-10">
        <div className="mb-4 flex items-center justify-between px-4 sm:px-12">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Play className="h-5 w-5 fill-white" /> Continue Watching
          </h2>
          <span className="text-sm text-neutral-400">View all</span>
        </div>
        {continueWatching.length === 0 ? (
          <p className="px-4 text-sm text-neutral-500 sm:px-12">
            Nothing in progress yet — press Play on anything and it will show up here.
          </p>
        ) : (
          <div className="cinemara-scroll flex gap-3 overflow-x-auto px-4 pb-2 sm:px-12">
            {continueWatching.map(({ entry, title }) => (
              <button
                key={entry.titleId}
                onClick={() => onPlay(title)}
                className="group w-[300px] shrink-0 text-left"
              >
                <span className="relative block overflow-hidden rounded-md bg-neutral-900">
                  <SafeImg
                    src={backdropUrl(title, "w780") || posterUrl(title)}
                    alt={title.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
                    <span
                      className="block h-full bg-[#27E9B5]"
                      style={{ width: `${Math.min(96, Math.max(5, entry.progress))}%` }}
                    />
                  </span>
                </span>
                <span className="mt-2 block truncate text-sm text-white">{title.title}</span>
                <span className="block text-xs text-neutral-500">
                  {title.type === "series" ? "Series" : "Movie"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Recently Watched */}
      {recently.length > 0 && (
        <section aria-label="Recently Watched" className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 px-4 text-xl font-bold text-white sm:px-12">
            <History className="h-5 w-5" /> Recently Watched
          </h2>
          <div className="cinemara-scroll flex gap-2.5 overflow-x-auto px-4 pb-2 sm:px-12">
            {recently.map(({ title }) => (
              <button
                key={`rw-${title.id}`}
                onClick={() => onOpenTitle(title)}
                className="group w-[140px] shrink-0 text-left"
              >
                <SafeImg
                  src={posterUrl(title)}
                  alt={title.title}
                  loading="lazy"
                  className="aspect-[2/3] w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <span className="mt-2 block truncate text-xs text-white">{title.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {fromList.length > 0 && (
        <ContentRow
          label="From My List"
          titles={fromList}
          onOpenTitle={onOpenTitle}
          onPlay={onPlay}
          inList={props.inList}
          onToggleList={props.onToggleList}
        />
      )}
    </div>
  );
}

export function DeveloperView() {
  return (
    <div className="mx-auto max-w-[880px] px-4 pb-20 pt-28 sm:px-8">
      <p className="text-[13px] font-bold uppercase tracking-[0.35em] text-[#27E9B5]">Developer</p>
      <h1 className="mt-2 text-5xl font-black tracking-tight text-white">About the developer</h1>

      <div className="mt-10 rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3d31] text-[#27E9B5]">
            <Github className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-bold text-white">
              Jepong Devxyz
            </p>
            <p className="text-sm text-neutral-400">Creator &amp; maintainer of Jepong Devxyz</p>
          </div>
        </div>
        <p className="mt-6 leading-relaxed text-neutral-300">
          Jepong Devxyz is a fan-made clone of <span className="font-semibold text-white">Cinemara</span>,
          a streaming interface made for people who just want to browse their favourite movies and
          shows — without dealing with annoying ads.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[#27E9B5]" /> Ad-free by design
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs text-neutral-300">
            <Heart className="h-3.5 w-3.5 text-[#27E9B5]" /> Made to be free
          </span>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">Support me</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <a
          href="https://github.com/jepongdevxyz"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111] px-5 py-4 transition-colors hover:bg-[#181818]"
        >
          <Github className="h-6 w-6 text-white" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">GitHub</span>
            <span className="block truncate text-xs text-neutral-500">github.com/jepongdevxyz</span>
          </span>
          <ExternalLink className="h-4 w-4 text-neutral-500" />
        </a>
        <a
          href="https://facebook.com/jepongdevxyz"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111] px-5 py-4 transition-colors hover:bg-[#181818]"
        >
          <Facebook className="h-6 w-6 text-white" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">Facebook</span>
            <span className="block truncate text-xs text-neutral-500">facebook.com/jepongdevxyz</span>
          </span>
          <ExternalLink className="h-4 w-4 text-neutral-500" />
        </a>
      </div>

      <p className="mt-10 text-sm text-neutral-500">Jepong Devxyz 1.0.0 · © 2026</p>
    </div>
  );
}

export function SearchView({
  onOpenTitle,
  searchCatalog,
}: {
  onOpenTitle: (t: Title) => void;
  searchCatalog: (q: string) => Title[];
}) {
  const [q, setQ] = useState("");
  const results = q.trim() ? searchCatalog(q) : [];
  return (
    <div className="min-h-[80vh] pb-16">
      <div className="px-4 pt-[84px] sm:px-12">
        <div className="flex max-w-[780px] items-center gap-3 rounded-md border border-white/25 bg-[#141414] px-4 py-3.5 transition-colors focus-within:border-white/90">
          <Search className="h-5 w-5 shrink-0 text-neutral-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Titles, people, genres"
            aria-label="Search Jepong Devxyz"
            className="w-full bg-transparent text-lg text-white placeholder:text-neutral-500 focus:outline-none sm:text-xl"
          />
        </div>
      </div>

      {q.trim() === "" ? (
        <div className="flex flex-col items-center px-6 pt-32 text-center">
          <p className="text-2xl text-neutral-300">Search for movies and TV shows</p>
          <p className="mt-3 text-sm text-neutral-500">Try searching for a title, genre, or year</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center px-6 pt-32 text-center">
          <p className="text-2xl text-neutral-300">No matches for &ldquo;{q}&rdquo;</p>
          <p className="mt-3 text-sm text-neutral-500">Try a different title, genre, or year</p>
        </div>
      ) : (
        <div className="pt-8">
          <p className="px-4 text-sm text-neutral-400 sm:px-12">
            Search results for{" "}
            <span className="font-semibold text-white">&ldquo;{q.trim()}&rdquo;</span>
          </p>
          {results.some((t) => t.type === "movie") && (
            <>
              <h2 className="px-4 pb-1 pt-8 text-2xl font-bold text-white sm:px-12">Movies</h2>
              <PosterGrid
                titles={results.filter((t) => t.type === "movie")}
                onOpenTitle={onOpenTitle}
                badge
                caption
              />
            </>
          )}
          {results.some((t) => t.type === "series") && (
            <>
              <h2 className="px-4 pb-1 pt-4 text-2xl font-bold text-white sm:px-12">TV Shows</h2>
              <PosterGrid
                titles={results.filter((t) => t.type === "series")}
                onOpenTitle={onOpenTitle}
                badge
                caption
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
