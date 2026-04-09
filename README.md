# pocketto

A minimalist trip planner for China. Collect restaurant and activity recommendations from social media, organize them by city, and build day-by-day itineraries.

## Features

- **Collect recommendations** — Save places from TikTok, RedNote, Instagram, YouTube with auto-detected platform and author
- **Source tracking** — Link multiple sources to the same place, track key takeaways and vibes
- **City-based planning** — Each city is its own trip with lodging, dates, and a place collection
- **Day planner** — Drag-and-drop itinerary builder with day columns
- **Collaborative** — Share an invite code with travel companions for full editing access
- **China-optimized** — Bilingual names, GCJ-02 coordinate support, AMap export ready

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Supabase** (Postgres) for data persistence
- **Tailwind CSS** for styling
- **dnd-kit** for drag-and-drop
- **Mapbox GL JS** (planned) for maps

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key

# Run the database schema
# Paste supabase/schema.sql into the Supabase SQL Editor

# Start dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Project Structure

```
src/
  app/
    page.tsx              # Landing — create/join group
    home/page.tsx         # City list
    city/[id]/page.tsx    # City view — places, filters, detail
    city/[id]/planner/    # Day planner — drag-and-drop
  components/             # UI components
  lib/
    store.ts              # Data layer (Supabase + optimistic state)
    types.ts              # TypeScript types
    constants.ts          # Category/platform/priority configs
    url-parser.ts         # Social media URL auto-detection
    supabase.ts           # Supabase client
supabase/
    schema.sql            # Database schema
    seed.sql              # Sample data (Dali food spots)
```

## Roadmap

- [ ] Cmd+K keyboard shortcut for quick-add
- [ ] Undo toast when removing a day plan stop
- [ ] Reorder cities on the home page (drag-and-drop)
- [ ] Shorter add-place flow (collapse categories into dropdown or two-step)
- [ ] Show "planned" indicator on places already assigned to a day
- [ ] Source count visual weight (bolder border for high-confidence places)
- [ ] Better empty states with onboarding hints
- [ ] Persist filter state across navigation
- [ ] Map view with Mapbox GL JS
- [ ] Proximity clustering on city map
- [ ] AMap export links for in-country navigation
- [ ] Mobile-responsive layout
- [ ] Realtime collaboration (Supabase realtime)
- [ ] View switcher (list / map / board / day)
- [ ] LLM-generated place summaries from sources
- [ ] Offline PWA mode

## License

MIT
