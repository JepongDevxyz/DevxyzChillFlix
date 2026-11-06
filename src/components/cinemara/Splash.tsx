"use client";

import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";

const FULL = "Jepong Devxyz";

/**
 * Boot splash — mirrors the original's cold-load screen:
 * mint arched wordmark that types in letter by letter, thin spinner beneath,
 * letter-spaced credit near the bottom edge, then a fade to black.
 */
export default function Splash({ fading = false }: { fading?: boolean }) {
  const [chars, setChars] = useState(0);

  // typewriter reveal: ~550ms beat before the first letter, then ~100ms per letter
  // (the original shows a caret bar riding the arc while typing)
  useEffect(() => {
    if (chars >= FULL.length) return;
    const t = setTimeout(() => setChars((c) => c + 1), chars === 0 ? 550 : 100);
    return () => clearTimeout(t);
  }, [chars]);
  const typing = chars > 0 && chars < FULL.length;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center">
        <Wordmark
          variant="arched"
          text={FULL.slice(0, chars) + (typing ? "|" : "")}
          className="w-[320px] max-w-[74vw] sm:w-[400px]"
        />
        <div
          className="mt-9 h-9 w-9 animate-spin rounded-full border-[3px] border-neutral-800 border-t-[#26E4B6]"
          role="status"
          aria-label="Loading"
        />
      </div>
      <span className="absolute bottom-10 text-[11px] font-medium uppercase tracking-[0.45em] text-neutral-500">
        Jepong Devxyz
      </span>
    </div>
  );
}
