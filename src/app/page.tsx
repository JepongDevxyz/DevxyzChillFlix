"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Splash from "@/components/cinemara/Splash";
import ProfileGate from "@/components/cinemara/ProfileGate";
import Header, { type NavView } from "@/components/cinemara/Header";
import Hero from "@/components/cinemara/Hero";
import { ContentRow } from "@/components/cinemara/Rows";
import DetailModal from "@/components/cinemara/DetailModal";
import WatchView from "@/components/cinemara/PlayerModal";
import LiveTVView from "@/components/cinemara/LiveTVView";
import Footer from "@/components/cinemara/Footer";
import {
  ShowsView,
  MoviesView,
  NewPopularView,
  MyListView,
  MyCinemaraView,
  DeveloperView,
  SearchView,
} from "@/components/cinemara/Views";
import {
  byCategory,
  homeRowsFor,
  searchCatalog,
  getTitle,
  HERO_ID,
  type Title,
  type Category,
} from "@/lib/cinemara/data";
import {
  useProfiles,
  useMyList,
  useWatchHistory,
} from "@/lib/cinemara/store";

const VALID_VIEWS: NavView[] = [
  "home",
  "shows",
  "movies",
  "new",
  "livetv",
  "mylist",
  "mycinemara",
  "developer",
  "search",
];

function viewFromHash(): NavView {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (h === "watch" || VALID_VIEWS.includes(h as NavView)) return h as NavView;
  return "home";
}

function hashFor(v: NavView): string {
  return v === "home" ? "#/" : `#/${v}`;
}

// ---------- hash-driven view (external store, SSR-safe) ----------
function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
function getHashView(): NavView {
  return viewFromHash();
}
function getServerView(): NavView {
  return "home";
}

export default function Home() {
  // cold-load boot splash: show → fade (500ms) → done, ~2.5s total like the original
  const [boot, setBoot] = useState<"show" | "fade" | "done">("show");
  useEffect(() => {
    const a = setTimeout(() => setBoot("fade"), 2000);
    const b = setTimeout(() => setBoot("done"), 2500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const { profiles, activeProfile, addProfile, removeProfile, selectProfile, signOut } =
    useProfiles();
  const { list, toggle, has } = useMyList(activeProfile?.id ?? null);
  const history = useWatchHistory(activeProfile?.id ?? null);

  const view = useSyncExternalStore(subscribeHash, getHashView, getServerView);
  const [detail, setDetail] = useState<Title | null>(null);
  const [watch, setWatch] = useState<{ title: Title; episode?: number } | null>(null);
  const [liveTv, setLiveTv] = useState(false);

  // leaving the watch hash closes the player (event callback, not effect body)
  useEffect(() => {
    const onHash = () => {
      if (viewFromHash() !== "watch") setWatch(null);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((v: NavView) => {
    if (window.location.hash !== hashFor(v)) {
      window.location.hash = hashFor(v);
    } else {
      // same hash: force scroll reset manually (no hashchange event)
      window.scrollTo({ top: 0 });
    }
  }, []);

  const openDetail = useCallback((t: Title) => {
    setWatch(null);
    setDetail(t);
  }, []);

  const play = useCallback(
    (t: Title, episode?: number) => {
      setDetail(null);
      setWatch({ title: t, episode });
      if (window.location.hash !== "#/watch") window.location.hash = "#/watch";
      window.scrollTo({ top: 0 });
    },
    []
  );

  const backFromWatch = useCallback(() => {
    setWatch(null);
    navigate("home");
  }, [navigate]);

  const openLiveTV = useCallback(() => {
    setDetail(null);
    setWatch(null);
    setLiveTv(true);
  }, []);

  if (boot !== "done") {
    return <Splash fading={boot === "fade"} />;
  }

  if (!activeProfile) {
    return (
      <ProfileGate
        profiles={profiles}
        onAdd={(p) => {
          // the original enters the new profile immediately after creation
          addProfile(p);
          selectProfile(p.id);
          navigate("home");
        }}
        onRemove={removeProfile}
        onSelect={(id) => {
          selectProfile(id);
          navigate("home");
        }}
      />
    );
  }

  if (liveTv) {
    return <LiveTVView onBack={() => setLiveTv(false)} />;
  }

  if (watch) {
    return (
      <WatchView
        title={watch.title}
        episode={watch.episode}
        profileId={activeProfile.id}
        onBack={backFromWatch}
      />
    );
  }

  const historyIds = history.map((h) => h.titleId);

  // kids mode: filter every row to kid-safe certs
  const filterKids = (titles: Title[]) =>
    activeProfile.kids ? titles.filter((t) => t.kids) : titles;

  const rows = homeRowsFor(historyIds).map((r) => ({
    ...r,
    titles: r.cat ? filterKids(byCategory(r.cat)) : filterKids(r.titles ?? []),
  }));

  const heroTitle = getTitle(HERO_ID);
  const heroAllowed = heroTitle && (!activeProfile.kids || heroTitle.kids);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header
        active={view}
        onNavigate={navigate}
        onLiveTV={openLiveTV}
        profile={activeProfile}
        profiles={profiles}
        onOpenTitle={openDetail}
        onManageProfiles={() => {
          setDetail(null);
          signOut();
        }}
        onSwitchProfile={(id) => {
          selectProfile(id);
          navigate("home");
        }}
        onSignOut={() => signOut()}
      />

      <main className="flex-1">
        {view === "home" ? (
          <>
            <div className="h-[97px]" aria-hidden />
            {heroAllowed ? (
              <Hero
                onPlay={(t) => play(t)}
                onInfo={openDetail}
                inList={has}
                onToggleList={toggle}
              />
            ) : (
              <div className="h-24" />
            )}
            <div className={`relative z-10 ${heroAllowed ? "mt-6" : "pt-4"} pb-8`}>
              {rows.map((r, i) => (
                <ContentRow
                  key={`${r.label}-${i}`}
                  label={r.label}
                  titles={r.titles ?? []}
                  numbered={r.numbered}
                  onOpenTitle={openDetail}
                  onPlay={(t) => play(t)}
                  inList={has}
                  onToggleList={toggle}
                />
              ))}
            </div>
          </>
        ) : view === "shows" ? (
          <ShowsView onOpenTitle={openDetail} onPlay={(t) => play(t)} inList={has} onToggleList={toggle} />
        ) : view === "movies" ? (
          <MoviesView onOpenTitle={openDetail} onPlay={(t) => play(t)} inList={has} onToggleList={toggle} />
        ) : view === "new" ? (
          <NewPopularView onOpenTitle={openDetail} onPlay={(t) => play(t)} inList={has} onToggleList={toggle} />
        ) : view === "mylist" ? (
          <MyListView
            ids={list}
            onOpenTitle={openDetail}
            onBrowse={() => navigate("home")}
            profileName={activeProfile.name}
          />
        ) : view === "mycinemara" ? (
          <MyCinemaraView
            profile={activeProfile}
            history={history}
            listIds={list}
            onOpenTitle={openDetail}
            onPlay={(t) => play(t)}
            inList={has}
            onToggleList={toggle}
          />
        ) : view === "search" ? (
          <SearchView onOpenTitle={openDetail} searchCatalog={searchCatalog} />
        ) : (
          <DeveloperView />
        )}
      </main>

      {view !== "watch" && <Footer />}

      {detail && (
        <DetailModal
          title={detail}
          onClose={() => setDetail(null)}
          onPlay={(t, ep) => play(t, ep)}
          inList={has}
          onToggleList={toggle}
          onOpenTitle={openDetail}
        />
      )}
    </div>
  );
}

// keep Category import used for typing in future rows config
export type { Category };
