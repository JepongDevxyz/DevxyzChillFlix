"use client";

import { useState, useSyncExternalStore } from "react";

export interface Profile {
  id: string;
  name: string;
  avatarIdx: number;
  kids: boolean;
}

export interface WatchEntry {
  titleId: string;
  progress: number; // 0-100
  episode?: number;
  updatedAt: number;
}

const PROFILES_KEY = "cinemara.profiles.v1";
const MYLIST_PREFIX = "cinemara.mylist.v1.";
const WATCH_PREFIX = "cinemara.watch.v1.";

// ---------- tiny external store over localStorage ----------
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

const EMPTY_PROFILES: Profile[] = [];
const EMPTY_LIST: string[] = [];
const EMPTY_WATCH: WatchEntry[] = [];

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function getJSON<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  const entry = cache.get(key);
  if (entry && entry.raw === raw) return entry.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function setJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — ignore
  }
  emit();
}

function useLocalJSON<T>(key: string, fallback: T, serverFallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => getJSON(key, fallback),
    () => serverFallback
  );
}

// ---------- profiles ----------
export function useProfiles() {
  const profiles = useLocalJSON<Profile[]>(PROFILES_KEY, EMPTY_PROFILES, EMPTY_PROFILES);
  // the active profile is session-only (like the original: a cold load always
  // returns to "Who's watching?" even when profiles are saved)
  const [activeId, setActiveId] = useState<string | null>(null);

  const addProfile = (p: Profile) => {
    setJSON(PROFILES_KEY, [...getJSON<Profile[]>(PROFILES_KEY, EMPTY_PROFILES), p]);
  };

  const removeProfile = (id: string) => {
    setJSON(
      PROFILES_KEY,
      getJSON<Profile[]>(PROFILES_KEY, EMPTY_PROFILES).filter((p) => p.id !== id)
    );
    if (activeId === id) setActiveId(null);
  };

  const selectProfile = (id: string) => setActiveId(id);
  const signOut = () => setActiveId(null);

  const activeProfile = profiles.find((p) => p.id === activeId) ?? null;

  return { profiles, activeProfile, addProfile, removeProfile, selectProfile, signOut };
}

// ---------- my list ----------
export function useMyList(profileId: string | null) {
  const key = MYLIST_PREFIX + (profileId ?? "anon");
  const list = useLocalJSON<string[]>(key, EMPTY_LIST, EMPTY_LIST);

  const toggle = (titleId: string) => {
    const cur = getJSON<string[]>(key, EMPTY_LIST);
    const next = cur.includes(titleId) ? cur.filter((x) => x !== titleId) : [titleId, ...cur];
    setJSON(key, next);
  };

  const has = (titleId: string) => list.includes(titleId);

  return { list, toggle, has };
}

// ---------- continue watching ----------
export function useWatchHistory(profileId: string | null): WatchEntry[] {
  const key = WATCH_PREFIX + (profileId ?? "anon");
  return useLocalJSON<WatchEntry[]>(key, EMPTY_WATCH, EMPTY_WATCH);
}

export function recordWatch(profileId: string | null, titleId: string, progress: number, episode?: number) {
  const key = WATCH_PREFIX + (profileId ?? "anon");
  const cur = getJSON<WatchEntry[]>(key, EMPTY_WATCH).filter((e) => e.titleId !== titleId);
  const next = [{ titleId, progress, episode, updatedAt: Date.now() }, ...cur].slice(0, 20);
  setJSON(key, next);
}
