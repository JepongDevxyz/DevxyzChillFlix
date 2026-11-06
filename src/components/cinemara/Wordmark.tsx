"use client";

/**
 * Jepong Devxyz brand wordmark.
 * - "straight"  → nav / gate size text wordmark (mint, condensed display)
 * - "arched"    → splash logo approximating the original's curved wordmark
 *
 * Uses Anton (condensed heavy display) — closest match to the original's
 * varsity-style lettering.
 */
const ANTON = { fontFamily: "var(--font-anton), var(--font-geist-sans), system-ui, sans-serif" };

export default function Wordmark({
  variant = "straight",
  className = "",
  text = "Jepong Devxyz",
}: {
  variant?: "straight" | "arched";
  className?: string;
  /** visible text — splash uses a shrinking slice for the typewriter reveal */
  text?: string;
}) {
  if (variant === "arched") {
    return (
      <svg
        viewBox="0 0 640 150"
        role="img"
        aria-label="Jepong Devxyz"
        className={className}
      >
        <defs>
          <path id="cdx-arc" d="M 28 116 Q 320 44 612 116" fill="none" />
        </defs>
        <text
          fill="#26E4B6"
          fontSize="74"
          fontWeight="900"
          letterSpacing="2"
          style={ANTON}
        >
          <textPath href="#cdx-arc" startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    );
  }

  return (
    <span
      aria-label="Jepong Devxyz"
      role="img"
      style={ANTON}
      className={`select-none font-black leading-none tracking-tight text-[#26E4B6] ${className}`}
    >
      {text}
    </span>
  );
}
