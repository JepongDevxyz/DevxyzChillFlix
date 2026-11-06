# Jepong Devxyz — Cine UI

Streaming-style movie/TV interface (Next.js 16 + Tailwind CSS 4 + TypeScript).
Brand: **Jepong Devxyz**. Lahat ng playback ay **official YouTube trailers lang** — walang pirated embedding sources.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui components
- Prisma (SQLite)
- lucide-react icons

## Paano Patakbuhin

1. Mag-install ng **Node.js 20+** (o **Bun**)
2. I-install ang dependencies:
   ```bash
   npm install      # o: bun install
   ```
3. Gawin ang `.env` mula sa example:
   ```bash
   cp .env.example .env
   ```
4. I-setup ang SQLite database:
   ```bash
   npm run db:push
   ```
5. Patakbuhin sa dev mode:
   ```bash
   npm run dev
   ```
   Tapos buksan ang **http://localhost:3000**
6. Para sa production:
   ```bash
   npm run build
   npm start
   ```

## Structure

```
src/
  app/                  # App Router (layout, page, api routes, favicon)
  components/
    cinemara/           # Main UI components
      Splash.tsx        # Boot splash (typewriter + fade)
      ProfileGate.tsx   # Profile selection screen
      Header.tsx        # Top nav + mobile fullscreen menu
      Hero.tsx          # Trailer hero (YouTube IFrame + mute/unmute)
      Rows.tsx          # Content rows / carousels
      DetailModal.tsx   # Title detail dialog
      PlayerModal.tsx   # Trailer player
      Views.tsx         # Movies / Shows / My List / Search / Developer pages
      Footer.tsx        # Footer
      Wordmark.tsx      # Brand wordmark (Anton font + arched SVG variant)
      SafeImg.tsx       # Image with fallback
    ui/                 # shadcn/ui primitives
  data/catalog.json     # TMDB-style mock data (movies/TV + official trailer keys)
  lib/cinemara/         # store (zustand), data helpers, art, enrich
prisma/schema.prisma    # Database schema
scripts/favicon_j.py    # ICO favicon generator (Python + PIL)
```

## Notes

- Hero rotation pool: `heroes` array sa `src/data/catalog.json`
- Pa-index ng items: `items` object keyed by `movie-<tmdbId>` / `tv-<tmdbId>`
- Trailer playback: YouTube IFrame API (`enablejsapi`) + `postMessage` para sa mute/unmute ("Tap for sound" capsule)
- Favicon: patakbuhin `python3 scripts/favicon_j.py` kung gusto mong i-regenerate
