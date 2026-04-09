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

### Up Next

- [ ] **Share-to-Pocketto** — PWA share target + quick-add URL so you can share links from TikTok/RedNote/Instagram directly into the app. iOS Shortcut fallback for non-PWA users
- [ ] **Visit Feedback** — Mark places as visited with a rating (great / ok / skip). Shows checkmark on visited places in city view and day planner
- [ ] **Confidence Score** — Auto-computed from source count + vibes (loved=3, recommended=2, mixed=1, warned=-1). Visual indicator on place cards, sortable
- [ ] **Daily Briefing** — "Today" card on home page that jumps straight to today's itinerary when a day plan matches the current date
- [ ] **Bulk Import** — Paste multiple URLs at once, auto-detect platforms, batch-assign to places

### Planned

- [ ] Smart day suggestions (auto-cluster nearby places into day plans)
- [ ] Meal slot awareness (breakfast/lunch/dinner time blocks in day planner)
- [ ] "What's missing" prompts (no dinner planned, no activities, etc.)
- [ ] Similar place comparison (6 hotpot spots? compare side by side)
- [ ] Conflict detection (one source says "amazing", another says "tourist trap")
- [ ] Source quality tracking (which RedNote accounts give consistently good recs)
- [ ] Trip templates (share a completed itinerary for others to fork)
- [ ] Screenshot OCR (upload a screenshot, extract place name via LLM)

### Polish

- [ ] Cmd+K keyboard shortcut for quick-add
- [ ] Undo toast when removing a day plan stop
- [ ] Reorder cities on home page (drag-and-drop)
- [ ] Show "planned" indicator on places already assigned to a day
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
