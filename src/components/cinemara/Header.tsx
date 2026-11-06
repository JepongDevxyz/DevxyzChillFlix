"use client";

import { useEffect, useRef, useState } from "react";
import SafeImg from "./SafeImg";
import Wordmark from "./Wordmark";
import { Bell, ChevronDown, Search, Pencil, Menu, X } from "lucide-react";
import { searchCatalog, getTitle, type Title } from "@/lib/cinemara/data";
import { avatarUrl, posterUrl, backdropUrl } from "@/lib/cinemara/art";
import type { Profile } from "@/lib/cinemara/store";

export type NavView =
  | "home"
  | "shows"
  | "movies"
  | "new"
  | "livetv"
  | "mylist"
  | "mycinemara"
  | "developer"
  | "search"
  | "watch";

const NAV_ITEMS: { key: NavView; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "shows", label: "Shows" },
  { key: "movies", label: "Movies" },
  { key: "new", label: "New & Popular" },
  { key: "livetv", label: "Live TV" },
  { key: "mylist", label: "My List" },
  { key: "mycinemara", label: "My Jepong Devxyz" },
  { key: "developer", label: "Developer" },
];

interface Props {
  active: NavView;
  onNavigate: (v: NavView) => void;
  onLiveTV?: () => void;
  profile: Profile;
  profiles: Profile[];
  onOpenTitle: (t: Title) => void;
  onManageProfiles: () => void;
  onSwitchProfile: (id: string) => void;
  onSignOut: () => void;
}

export default function Header({
  active,
  onNavigate,
  onLiveTV,
  profile,
  profiles,
  onOpenTitle,
  onManageProfiles,
  onSwitchProfile,
  onSignOut,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const notifItems = NOTIF_IDS.map(getTitle).filter(Boolean) as Title[];

  // lock scroll while the fullscreen mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div ref={wrapRef}>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? "bg-[#0b0b0b] shadow-lg shadow-black/60" : "bg-gradient-to-b from-black/85 via-black/40 to-transparent"
        }`}
      >
        <nav aria-label="Primary" className="flex h-[72px] items-center gap-3 px-4 sm:gap-5 md:px-12">
          <button
            onClick={() => onNavigate("home")}
            aria-label="Jepong Devxyz home"
            className="shrink-0 select-none"
          >
            <Wordmark className="text-[26px] sm:text-[30px]" />
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => onNavigate(item.key)}
                  aria-current={active === item.key ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-[14px] transition-colors ${
                    active === item.key
                      ? "bg-[#1f1f1f] font-semibold text-white"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* mobile: search + hamburger live in the right group (mirrors the original) */}

          <div className="ml-auto flex items-center gap-4 sm:gap-5">
            {onLiveTV && (
              <button
                onClick={onLiveTV}
                aria-label="Live TV"
                className="hidden items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-600 sm:flex"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </button>
            )}
            <button
              aria-label="Search"
              onClick={() => onNavigate("search")}
              className="text-white transition-transform hover:scale-110"
            >
              <Search className="h-[22px] w-[22px]" strokeWidth={2.25} />
            </button>

            <button
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen(true);
                setNotifOpen(false);
                setMenuOpen(false);
              }}
              className="text-white transition-transform hover:scale-110 lg:hidden"
            >
              <Menu className="h-[22px] w-[22px]" strokeWidth={2.25} />
            </button>

            <div className="relative hidden lg:block">
              <button
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setMenuOpen(false);
                }}
                className="relative text-white transition-transform hover:scale-110"
              >
                <Bell className="h-[22px] w-[22px]" strokeWidth={2.25} />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-[#27E9B5]" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-[340px] border-t-2 border-white bg-black/95 py-2 shadow-2xl backdrop-blur">
                  {notifItems.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setNotifOpen(false);
                        onOpenTitle(t);
                      }}
                      className="flex w-full items-center gap-3 border-b border-neutral-900 px-4 py-3 text-left last:border-0 hover:bg-white/5"
                    >
                      <SafeImg
                        src={backdropUrl(t, "w780") || posterUrl(t)}
                        alt=""
                        className="h-[54px] w-24 shrink-0 rounded-sm object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">{t.title}</span>
                        <span className="mt-0.5 block text-xs text-neutral-400">
                          {i === 0
                            ? "New on Jepong Devxyz — now streaming"
                            : i === 1
                              ? `Now in Top 10 ${t.type === "series" ? "Series" : "Movies"} this week`
                              : "New episodes available"}
                        </span>
                        <span className="mt-1 block text-[11px] text-neutral-600">
                          {i === 0 ? "2 hours ago" : i === 1 ? "Yesterday" : "3 days ago"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative hidden lg:block">
              <button
                aria-label="Profile menu"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1.5"
              >
                <SafeImg
                  src={avatarUrl(profile.avatarIdx)}
                  alt="Profile avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <ChevronDown
                  className={`h-4 w-4 text-white transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-60 border-t-2 border-white bg-black/95 py-2 shadow-2xl backdrop-blur">
                  {profiles
                    .filter((p) => p.id !== profile.id)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setMenuOpen(false);
                          onSwitchProfile(p.id);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-300 hover:underline hover:decoration-white"
                      >
                        <SafeImg src={avatarUrl(p.avatarIdx)} alt="" className="h-8 w-8 rounded-md object-cover" />
                        {p.name}
                      </button>
                    ))}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onManageProfiles();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-300 hover:underline hover:decoration-white"
                  >
                    <Pencil className="h-4 w-4" /> Manage Profiles
                  </button>
                  <div className="my-2 border-t border-neutral-800" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:underline hover:decoration-white"
                  >
                    Sign out of Jepong Devxyz
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* fullscreen mobile menu — mirrors the original's hamburger overlay */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] overflow-y-auto bg-black lg:hidden"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <span
              aria-hidden
              className="text-[34px] leading-none text-[#26E4B6]"
              style={{ fontFamily: "var(--font-anton), var(--font-geist-sans), sans-serif" }}
            >
              J
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-1 text-white transition-transform hover:scale-110"
            >
              <X className="h-7 w-7" strokeWidth={2} />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-1 pb-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate(item.key);
                }}
                aria-current={active === item.key ? "page" : undefined}
                className={`block w-full border-b border-white/10 px-4 py-[17px] text-left text-[15px] ${
                  active === item.key ? "font-bold text-white" : "text-neutral-300"
                }`}
              >
                {item.label}
              </button>
            ))}
            <span className="block w-full border-b border-white/10 px-4 py-[17px] text-left text-[15px] text-neutral-300">
              Account
            </span>
            <button
              onClick={() => {
                setMobileOpen(false);
                onSignOut();
              }}
              className="block w-full px-4 py-[17px] text-left text-[15px] text-neutral-300"
            >
              Exit to Profile Selection
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

const NOTIF_IDS = ["tv-250923", "movie-969681", "movie-1236045"];

export { NAV_ITEMS };
