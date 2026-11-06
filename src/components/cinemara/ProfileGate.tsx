"use client";

import { useMemo, useState } from "react";
import SafeImg from "./SafeImg";
import Wordmark from "./Wordmark";
import { avatarUrl } from "@/lib/cinemara/art";
import type { Profile } from "@/lib/cinemara/store";
import { X, Pencil, Plus } from "lucide-react";

interface Props {
  profiles: Profile[];
  onAdd: (p: Profile) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function ProfileGate({ profiles, onAdd, onRemove, onSelect }: Props) {
  const [manage, setManage] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div
      className="flex min-h-screen flex-col items-center bg-black px-4"
      style={{
        backgroundImage:
          "radial-gradient(120% 90% at 50% 0%, #161616 0%, #0a0a0a 45%, #000 100%)",
      }}
    >
      <Wordmark className="mt-8 text-[26px] sm:text-[30px]" />

      <div className="flex flex-1 flex-col items-center justify-center pb-16">
        <h1 className="mb-12 text-center text-[22px] font-medium text-white sm:text-[36px]">
          Who&apos;s watching?
        </h1>

        <div className="flex max-w-3xl flex-wrap items-start justify-center gap-5 sm:gap-8">
          {profiles.map((p) => (
            <div key={p.id} className="group flex w-[90px] flex-col items-center sm:w-[152px]">
              <button
                onClick={() => (manage ? undefined : onSelect(p.id))}
                className="relative block focus:outline-none"
                aria-label={`${manage ? "Manage" : "Watch as"} ${p.name}`}
              >
                <SafeImg
                  src={avatarUrl(p.avatarIdx)}
                  alt={`${p.name} avatar`}
                  className={`h-[90px] w-[90px] rounded-full border-2 border-transparent object-cover transition-all group-hover:ring-2 group-hover:ring-white sm:h-[152px] sm:w-[152px] ${
                    manage ? "opacity-60" : ""
                  }`}
                />
                {manage && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-black/70">
                      <Pencil className="h-5 w-5 text-white" />
                    </span>
                  </span>
                )}
                {manage && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Delete ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(p.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        onRemove(p.id);
                      }
                    }}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </span>
                )}
              </button>
              <span className="mt-6 text-sm text-neutral-400 group-hover:text-white">{p.name}</span>
              {p.kids && <span className="text-[10px] uppercase tracking-widest text-[#27E9B5]">Kids</span>}
            </div>
          ))}

          <div className="flex w-[90px] flex-col items-center sm:w-[152px]">
            <button
              onClick={() => setCreating(true)}
              aria-label="Add profile"
              className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 border-dashed border-neutral-500 text-neutral-400 transition-colors hover:border-white hover:text-white sm:h-[152px] sm:w-[152px]"
            >
              <Plus className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.25} />
            </button>
            <span className="mt-6 text-sm text-neutral-400">Add Profile</span>
          </div>
        </div>

        <button
          onClick={() => setManage((m) => !m)}
          className="mt-[68px] rounded-full border border-neutral-500 px-6 py-2.5 text-[15px] tracking-wide text-neutral-300 transition-colors hover:border-white hover:text-white"
        >
          {manage ? "Done" : "Manage Profiles"}
        </button>
      </div>

      {creating && (
        <CreateProfileDialog
          onCancel={() => setCreating(false)}
          onCreate={(p) => {
            onAdd(p);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function CreateProfileDialog({
  onCreate,
  onCancel,
}: {
  onCreate: (p: Profile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [kids, setKids] = useState(false);

  const avatarSrcs = useMemo(() => Array.from({ length: 80 }, (_, i) => avatarUrl(i)), []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create a profile"
    >
      <div className="max-h-[94vh] w-full max-w-[460px] overflow-y-auto rounded-lg bg-[#141414] p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">Create a profile</h3>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded p-1 text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Profile name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name"
            maxLength={24}
            aria-label="Profile name"
            className="mb-6 w-full rounded-md border border-neutral-500 bg-transparent px-3.5 py-3 text-white placeholder:text-neutral-500 focus:border-white focus:outline-none"
          />

          <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Avatar
          </label>
          <div
            className="cinemara-scroll mb-6 grid max-h-[395px] grid-cols-4 justify-items-center gap-3 overflow-y-auto pr-1"
            role="listbox"
            aria-label="Choose an avatar"
          >
            {avatarSrcs.map((src, i) => (
              <button
                key={i}
                role="option"
                aria-selected={avatarIdx === i}
                aria-label={`Avatar ${i + 1}`}
                onClick={() => setAvatarIdx(i)}
                className={`overflow-hidden rounded-full transition-all ${
                  avatarIdx === i
                    ? "ring-[3px] ring-white ring-offset-[3px] ring-offset-[#141414]"
                    : "opacity-85 hover:opacity-100 hover:ring-2 hover:ring-neutral-400"
                }`}
              >
                <SafeImg src={src} alt="" loading="lazy" className="h-[100px] w-[100px] object-cover" />
              </button>
            ))}
          </div>

          <div className="mb-7 flex items-center gap-4">
            <span id="kids-label" className="text-sm text-neutral-300">
              Kids profile
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={kids}
              aria-labelledby="kids-label"
              onClick={() => setKids((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                kids ? "bg-[#27E9B5]" : "bg-[#3f3f3f]"
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  kids ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            disabled={!name.trim()}
            onClick={() =>
              onCreate({
                id: `p${Date.now().toString(36)}`,
                name: name.trim(),
                avatarIdx,
                kids,
              })
            }
            className="w-full rounded-md bg-[#27E9B5] py-3.5 text-base font-semibold text-black transition-colors hover:bg-[#4ff0c4] disabled:cursor-not-allowed disabled:bg-[#0e4437] disabled:text-white/70"
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
}
