"use client";

import { useState } from "react";

const LINKS_ROW1: string[] = [
  "FAQ",
  "Help Center",
  "Account",
  "Media Center",
  "Investor Relations",
  "Jobs",
  "Ways to Watch",
  "Terms of Use",
  "Privacy",
  "Cookie Preferences",
  "Corporate Information",
];

const LINKS_ROW2: string[] = [
  "Contact Us",
  "Speed Test",
  "Legal Notices",
  "Only on Jepong Devxyz",
];

export default function Footer() {
  const [code, setCode] = useState<string | null>(null);

  return (
    <footer className="mt-auto bg-black px-6 pb-12 pt-14 text-[12px] text-[#808080] sm:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex flex-wrap gap-x-[18px] gap-y-3">
          {LINKS_ROW1.map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:underline"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-x-[18px] gap-y-3">
          {LINKS_ROW2.map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:underline"
            >
              {l}
            </a>
          ))}
        </div>
        <button
          onClick={() =>
            setCode(
              Math.random().toString(36).slice(2, 6).toUpperCase() +
                "-" +
                Math.floor(100000 + Math.random() * 899999).toString()
            )
          }
          className="mb-6 border border-neutral-600 px-3 py-1.5 text-[12px] text-[#808080] hover:text-neutral-300"
        >
          Service Code
        </button>
        {code && <p className="mb-4 text-xs text-neutral-400">Service code: {code}</p>}
        <p className="text-[11px]">© 2026 Jepong Devxyz, Inc.</p>
      </div>
    </footer>
  );
}
