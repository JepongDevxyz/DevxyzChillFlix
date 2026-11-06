"use client";

import { useState } from "react";
import { ArrowLeft, Radio } from "lucide-react";
import { LIVE_CHANNELS } from "@/lib/cinemara/sources";

interface Props {
  onBack: () => void;
}

export default function LiveTVView({ onBack }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const channel = LIVE_CHANNELS[activeIdx];

  const categories = [...new Set(LIVE_CHANNELS.map((c) => c.category))];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Live TV"
      style={{
        backgroundImage:
          "radial-gradient(80% 60% at 20% 10%, #0d2226 0%, #06141a 40%, #02070a 100%)",
      }}
    >
      {channel && (
        <iframe
          key={channel.name}
          src={channel.embed}
          title={`${channel.name} live`}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent px-5 py-5">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="pointer-events-auto flex items-center gap-2 rounded bg-black/50 px-3 py-1 text-xs text-neutral-300">
          <Radio className="h-3.5 w-3.5 text-red-500" />
          {channel?.name} · Live
        </span>
      </div>

      {/* channel list toggle */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-5 pt-10">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="pointer-events-auto rounded-md bg-black/60 px-3 py-2 text-xs text-white transition-colors hover:bg-black/80"
        >
          {menuOpen ? "Hide Channels" : `Browse ${LIVE_CHANNELS.length} Channels`}
        </button>

        {menuOpen && (
          <div className="pointer-events-auto mt-3 max-h-[40vh] overflow-y-auto rounded-lg border border-white/10 bg-[#141414]/95 p-3 backdrop-blur">
            {categories.map((cat) => (
              <div key={cat} className="mb-4 last:mb-0">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {cat}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {LIVE_CHANNELS.map((ch, i) => {
                    if (ch.category !== cat) return null;
                    return (
                      <button
                        key={ch.name}
                        onClick={() => {
                          setActiveIdx(i);
                          setMenuOpen(false);
                        }}
                        className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                          i === activeIdx
                            ? "border-[#27E9B5]/50 bg-[#27E9B5]/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ch.logo}
                          alt={ch.name}
                          className="h-8 w-8 shrink-0 rounded object-contain bg-white/10 p-1"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-white">{ch.name}</p>
                          <p className="text-[10px] text-neutral-500">{ch.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
