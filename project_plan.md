# Project Plan — Stockholm Housing Stock Visualizer

> A static web application visualizing current and future real estate construction in the Stockholm Region. Aesthetic target: "Google Maps × The Sims" — playful, stylized 3D representation rather than architectural accuracy.

---

## How to use this document

This plan is the single source of truth for roadmapping and iterative delivery. The workflow is:

1. Pick the next feature with status `[ ]` (Open) from the **Feature Backlog**.
2. Produce a detailed implementation guide for that feature.
3. Implement on a dedicated feature branch (commit per step, merge via PR after approval).
4. Update this document: flip the status to `[x]` (Done), add notes/links under **Change Log**, and adjust scope of remaining items if learnings warrant it.

Status legend:
- `[ ]` Open — not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

---

## 1. Vision & Goals

- **Primary goal:** Make Stockholm's housing stock — both existing and planned — legible at a glance through a 3D map that feels approachable, not technical.
- **Audience:** General public, journalists.
- **Non-goals:** Architectural accuracy, parcel-level legal data, real-time updates, user accounts, CMS authoring.

## 2. Product Principles

- **Static-first.** All data ships as GeoJSON; no runtime backend.
- **Mobile-first.** Designed for phones, scales up to desktop.
- **Stylized over realistic.** Representative 3D units (LOD1/LOD2) communicate volume and density, not exact form.
- **Performant on mid-range mobile.** Smooth zoom/pan must hold up on a 3-year-old Android.
- **One screen, one story.** Single-page experience; no deep navigation.

## 3. Tech Stack (proposed)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | Static export friendly, good DX, Vercel-native |
| Map | Mapbox GL JS | Best-in-class 3D extrusions, custom styling for "Sims" look |
| Data | Static GeoJSON in `/public` | Zero infra, cache-friendly, version-controlled |
| Styling | TBD (Tailwind likely) | Decide in Phase 1 |
| Forms | Static form provider (Formspree / Resend / Vercel Forms) | No backend; revisit in Phase 4 |
| Hosting | Vercel | CDN, preview deploys, analytics tie-in |
| Analytics | Vercel Analytics or Plausible | Privacy-friendly, lightweight |

Open decisions are tagged `[DECISION NEEDED]` in the relevant feature.

## 4. Site Structure (single page, top to bottom)

1. Header (logo / title / nav anchor links)
2. Intro textbox (project description)
3. Interactive 3D map (the centerpiece)
4. Embedded videos section
5. Contact / newsletter signup form
6. Footer (credits, data sources, legal)

---

## 5. Phases & Feature Backlog

Each feature is sized to be implementable in roughly one focused session. Dependencies are noted where they exist.

### Phase 0 — Foundations

Get the project skeleton, tooling, and deployment pipeline in place before touching product features.

- [x] **F0.1 — Project scaffold.** Initialize Next.js project, set up TypeScript, linting, formatting, and basic folder structure. Decide on styling approach (`[DECISION NEEDED]`: Tailwind vs. CSS Modules).
- [x] **F0.2 — Vercel deployment pipeline.** Connect repo to Vercel, verify preview deploys on PRs, confirm production deploy on `main` merge.
- [x] **F0.3 — Base layout & responsive shell.** Mobile-first page shell with sections stubbed out (header / intro / map / videos / form / footer). No real content yet.
- [x] **F0.4 — Design tokens & visual language.** Establish palette, typography, spacing scale aligned to "Google Maps × Sims" aesthetic. Document in a short style reference.

### Phase 1 — Static Content & Layout

Ship a complete, content-light version of the site without the map's interactive features.

- [x] **F1.1 — Header.** Title, optional logo, anchor navigation to page sections.
- [x] **F1.2 — Intro textbox.** Static copy describing the project, its data, and how to read the map.
- [x] **F1.3 — Embedded videos section.** Responsive video embeds (provider TBD: YouTube / Vimeo / self-hosted MP4). D2 resolved: YouTube (nocookie), 2 videos.
- [x] **F1.4 — Footer.** Credits, data attribution, contact info, year.

### Phase 2 — Map Foundation

Stand up the map with the right framing and styling, before adding data overlays.

- [x] **F2.1 — Mapbox integration.** Add Mapbox GL JS, configure access token (env var), render a map in the page.
- [x] **F2.2 — Birds-eye 3D camera & Stockholm bounds.** Set initial pitch/bearing/zoom for the birds-eye view; restrict pan/zoom to the Stockholm Region bounding box.
- [x] **F2.3 — Custom map style.** Apply stylized basemap (muted colors, simplified labels) consistent with the design tokens. May use Mapbox Studio style or runtime style overrides. D3 resolved: Mapbox Studio → exported `style.json` at `/public/map-style.json`.
- [x] **F2.4 — Performance baseline.** Measure load time and FPS on a mid-range mobile device; document numbers as a regression baseline. Production score: 68. See `docs/performance-baseline.md`.

### Phase 3 — Housing Data Visualization

The product's core: interactive map with municipality selection → 3D housing stock visualization.

UX: 2D overview (all municipalities visible, no pan) → click/select municipality → flyTo + 3D extrusions → toggle Idag/2060 → back to overview.

- [x] **F3.1 — Data source & schema definition.** D4 resolved: `/public/bostads_data.csv`. Columns: `Antal småhus`, `Antal flerbostadshus`, `Antal flerbostadshus 2060 (hög)`. Representative model: 1 unit per 100 småhus / 1000 flerbostadshus. Schema in `/src/types/housing.ts`.
- [x] **F3.2 — Housing dataset.** GeoJSON generation script reads CSV → 3 static GeoJSON files in `/public/data/`. All 26 municipalities covered.
- [x] **F3.3 — Municipality boundaries + 2D overview.** 26 polygons (okfse/sweden-geojson). Monochrome style. `fitBounds` ensures full region visible on load + back-navigation. Municipality name labels as symbol overlay; hover highlight (fill + label) disabled in detail view.
- [x] **F3.4 — Municipality selection.** Click polygon or list → `fitBounds` to municipality polygon at pitch=45. Hover highlight disabled once a municipality is selected.
- [x] **F3.5 — Housing visualization in detail view.** Larger footprints, staggered+jittered grid. Spatially separated areas (småhus north, current flerbostadshus center, new flerbostadshus south). Only newly built apartments (delta 2060 − today) shown in amber; current stock always green.
- [x] **F3.6 — Toggle + back.** "Idag" = småhus + current apartments. "2060" = adds new apartments in amber. Back button → `fitBounds` full region.

### Phase 4 — Map Interactions

- [x] **F4.1 — Municipality boundaries layer.** Merged into F3.3.
- [x] **F4.2 — Municipality selection & zoom animation.** Merged into F3.4.
- [x] **F4.3 — Info text box overlay.** Floating card panel unifying all map controls (municipality list, stats, toggle, back). Desktop: card floats over ocean on right (absolute positioned). Mobile: card stacked above map (30/70vh split). Bidirectional hover sync with auto-scroll. Stats: municipality name, småhus count, current/2060 flerbostadshus, total growth %. Municipality dim layer + tighter zoom on selection. D5 resolved. See `project_phases/Phase4_map_interactions.md`.
- [ ] **F4.4 — Reset / "back to overview" control.** Merged into F3.6.

### Phase 5 — Contact / Newsletter

Convert visitors into newsletter subscribers.

- [x] **F5.1 — Contact form UI.** Mobile-first form with name, email, phone, zip/municipality fields, client-side validation, success/error states.
- [x] **F5.2 — Form submission backend.** D6 re-resolved: Supabase Postgres (Frankfurt, EU). Direct REST API insert via plain `fetch` — no npm dependency. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars. RLS restricts anonymous access to INSERT only. CSV export via Supabase table editor.
- [x] **F5.3 — GDPR consent & privacy copy.** Required consent checkbox with inline Swedish privacy copy; submit disabled until checked.
- [x] **F5.4 — Aesthetic refinements.** Font switched to Space Grotesk. Hero headline scaled to display size. Section eyebrow labels removed. ContactForm card removed, inputs styled as bottom-border-only lines, submit button pill-shaped. Footer reduced to single slim bar (copyright, data note, email). Section dividers added between intro/map/videos, removed between videos/contact.

### Phase 6 — Map Visual Redesign

- [x] **F6.1 — New building color scheme & data-driven heights.** Blue (existing) / red (new 2060) extrusions. Heights stored per-feature in GeoJSON (20–400 m). Generator script fully rewritten.
- [x] **F6.2 — Organic building placement.** Seeded PRNG, point-in-polygon rejection, clustered ring layout, 4 footprint shapes (square, L, wide rect, T). New buildings interspersed with existing in shared position pool.
- [x] **F6.3 — Floating map box layout.** `bg-primary-light` section, narrower padding, `rounded-2xl` overflow-hidden box, shifted overview camera to account for 380 px card.
- [x] **F6.4 — fitBounds camera & municipality labels.** `fitBounds` on municipality polygon bounds. Centroid-point label source (eliminates tile-boundary duplication). Two symbol layers: all-municipalities (hidden in overview) and selected-only (bold, always-overlap).
- [x] **F6.5 — Polygon & interaction polish.** Blue hover fill, 3.5 px hover outline, `line-join: 'round'` on boundaries. Pre-init guard on setHighlight.
- [x] **F6.6 — Municipality card & list UI.** Gray card matching map water color, 2/3-height centered list, scale+size hover zoom, manual scroll centering, white text throughout.
- [x] **F6.7 — Neighboring regions overlay.** Uppsala, Västmanland, Södermanland municipalities at half opacity, no borders, no interaction. Generated from `okfse/sweden-geojson` via `scripts/generate-neighboring-regions.ts`.
- [x] **F6.8 — Stats card redesign, list style alignment & crossfade transition.** Free-floating white `StatsCard` replaces full-height sidebar in detail view. StatsPanel: 2×2 grid with large green numbers, uppercase labels, and inline SVG building icons in the exact map extrusion colors. Housing mix stacked bar chart (Bostadsmix) reacts to Idag/Planerad toggle with 300 ms CSS width transition. Förtätning data from CSV (`fortattning` field, replaces `growthPct`). MunicipalityList: white floating card, green text, full-width inverted hover (green bg / white text). Bidirectional 300 ms opacity crossfade between list and stats views.
- [x] **F6.9 — Housing generator grid rewrite.** Cluster-based placement replaced by `generateGridPositions` (bbox sweep + `pointInRing` filter + seeded Fisher-Yates shuffle). Buffer = `halfSize × √2` eliminates boundary leakage. `wide` shape offsets scaled to ±1.0 to prevent overlap at `FILL_FACTOR=0.7`. Heights proportional to footprint size (`halfSize × AVG_M_PER_DEG × ratio`), clamped per type. Script shrank from ~547 to ~300 lines. See `project_phases/Phase6_map_visual_redesign.md`.

### Phase 7 — Housing Shape & Label Fixes

Small, isolated cleanup pass on the generator and label rendering.

- [x] **F7.1 — Rectangular-only building shapes.** Remove L/T shapes from `pickFlerboShape` (rect/square only). Eliminates multi-vertex polygons that can escape the grid cell buffer. Re-generate all three GeoJSON files. **File:** `scripts/generate-housing-geojson.ts`.
- [x] **F7.2 — Municipality label always visible above buildings.** After `initHousingLayers`, call `map.moveLayer` on both label layers to bring them above the extrusion stack. Increase `text-halo-width` on selected label from 3→4. **File:** `src/components/sections/MapSection.tsx`.
- [x] **F7.3 — Minor size adjustments.** Tuning pass on `TOTAL_COVERAGE`, height clamp constants, after shape change in F7.1. Re-generate GeoJSON. **File:** `scripts/generate-housing-geojson.ts`.

### Phase 8 — Deep Linking

- [x] **F8.1 — URL-based municipality selection.** Query param `?m=MunicipalityName` (e.g. `/?m=Nacka`) opens the page with that municipality already selected and zoomed. `page.tsx` (Server Component) reads `searchParams`, passes `initialMunicipality` prop to `MapSection`. On `handleMapReady`, if the prop matches a valid municipality, call `selectMunicipality`. Links are one-way (shared externally; the app does not update the URL on click). **Files:** `src/app/page.tsx`, `src/components/sections/MapSection.tsx`.

### Phase 10 — Mobile Layout

- [x] **F10.1 — Dropdown municipality selector on mobile.** Replace the mobile `MunicipalityCard` block (above-map list) with a native `<select>` dropdown. Stays visible even when a municipality is selected (allows direct switching). Hidden on desktop (`md:hidden`). **File:** `src/components/sections/MapSection.tsx`.
- [x] **F10.2 — Stats panel below map on mobile.** Move the stats card outside the map `div` on mobile, rendering it below the map. Desktop overlay unchanged. **File:** `src/components/sections/MapSection.tsx`.

### Phase 11 — Contact Form Updates

- [x] **F11.1 — Field changes & GDPR note.** Email + Kommun mandatory; Name and Telefon optional. Kommun becomes a `<select>` dropdown (26 municipalities + "Ingen / Vet ej"). Updated Swedish GDPR copy: clarifies data shared with Formspree EU servers only, not third parties, deleted on request. **File:** `src/components/contact/ContactForm.tsx`.

### Phase 12 — Visual Alignment

- [x] **F12.1 — Align static sections with map design.** Full design refresh: neutral palette, Inter (body) + Oswald (display) font stack, Oswald applied globally, wider map layout. Footer cleaned up with social icons. Map info button added. Mapbox overlay opacity reduced. Intro section scaling fixed for mobile. Mobile font sizes decreased. iOS down-arrow glyph fix. **Files:** `src/components/sections/IntroSection.tsx`, `src/components/Footer.tsx`, `src/app/globals.css`.

### Phase 13 — Cleanup & Launch Readiness

- [x] **F13.1 — Remove unused code & files.** Deleted `scripts/generate-outside-region.ts`, `scripts/smooth-municipalities.ts`, outdated GeoJSON files (`outside-region`, `housing-flerbostadshus-2060`), and removed dead constants from `mapConfig.ts`. Removed commented out obsolete sections except `VideosSection`. Fixed ESLint warnings.
- [x] **F13.2 — Cross-device QA & Bug Fixes.** Resolved map interaction bugs (polygon hover fill issues during camera animations, housing layers persisting when navigating back to overview) and generator bugs (fixed Täby/MultiPolygon support and building shape aspect ratios scaling incorrectly with latitude). Added generator validation summary.
- [ ] **F13.3 — Accessibility pass.** Keyboard navigation, focus states, ARIA labels on map controls, color contrast on stats panel. Document map's accessibility limitations honestly.
- [ ] **F13.4 — Performance optimization.** Lighthouse audit, GeoJSON size check, font subsetting, image/video lazy loading.
- [ ] **F13.5 — SEO & social sharing.** Meta tags, OG image, favicon, sitemap.
- [ ] **F13.6 — Launch checklist.** Custom domain, HTTPS, production env vars, analytics decision (D7), form recipient confirmed.

### Phase 9 — Post-Launch (optional / deferred)

- [ ] **F9.1 — Data update workflow.** Document how to refresh GeoJSON when new construction data is published.
- [ ] **F9.2 — Additional municipality stats.** Richer info overlay (population, units planned, timelines).
- [ ] **F9.3 — Time-slider.** Scrub through years to see future stock materialize over time.
- [ ] **F9.4 — Filtering by attributes.** E.g., by developer, project status, building type.
- [ ] **F9.5 — Form/newsletter platform review.** Evaluate replacing Formspree with a dedicated newsletter tool (e.g., Buttondown, Brevo, Mailchimp) once subscriber volume and stakeholder requirements are known.

---

## 6. Open Decisions

Tracked here so they don't get lost between sessions. Resolve before — or as the first step of — the dependent feature.

| ID | Decision | Blocks | Notes |
|---|---|---|---|
| D1 | Styling approach (Tailwind vs. CSS Modules) | F0.1 | **Resolved 2026-04-16: Tailwind CSS.** |
| D2 | Video source(s) and count | F1.3 | **Resolved 2026-04-17: YouTube (nocookie embeds), 2 videos.** |
| D3 | Mapbox style: Studio vs. inline overrides | F2.3 | **Resolved 2026-04-17: Mapbox Studio → exported `style.json` committed to `/public/`.** |
| D4 | Source datasets for current & future housing | F3.1 | **Resolved 2026-04-18: `/public/bostads_data.csv`. Columns: Antal småhus, Antal flerbostadshus, Antal flerbostadshus 2060 (hög). Script generates static GeoJSON at dev time.** |
| D5 | Info overlay scope (static vs. per-municipality stats) | F4.3 | **Resolved 2026-04-20: municipality name + småhus + current flerbostadshus + 2060 flerbostadshus + total growth %. Static lookup from CSV. Floating card layout.** |
| D6 | Form backend provider | F5.2 | **Re-resolved 2026-04-29: Supabase Postgres (Frankfurt, EU). Plain fetch to REST API, no new npm dep, INSERT-only RLS policy, CSV export from dashboard. Replaces Formspree.** |
| D7 | Analytics provider | F13.6 | Open — Vercel Analytics or Plausible. Resolve before launch. |
| D8 | Visual alignment direction for static sections | F12.1 | **Resolved 2026-04-29: Neutral palette, Inter/Oswald font stack, wider map layout.** |

## 7. Risks

- **Data quality & availability.** Future housing data may be inconsistent across municipalities; schema normalization is non-trivial.
- **Mobile performance.** 3D extrusions over the full region could strain low-end devices; may require LOD strategies or zoom-based loading.
- **Mapbox cost.** Free tier limits could be exceeded if the site gets traction; monitor early.
- **Aesthetic ambiguity.** "Google Maps × Sims" is subjective — needs a visual reference / mood board to align on (consider as a Phase 0 addition if needed).

## 8. Success Criteria

- Visitor can identify, within 10 seconds of arriving, where current vs. planned housing exists in Stockholm.
- Mobile load time under 3 seconds on a 4G connection.
- At least one newsletter signup per 50 visitors during launch month.
- No critical bugs reported in the first two weeks post-launch.

---

## Change Log

_Add an entry each time a feature is completed or scope changes meaningfully._

| Date | Feature | Change | PR |
|---|---|---|---|
| 2026-04-16 | F0.1 | Next.js + TS + Tailwind scaffold, ESLint/Prettier, tsconfig `noUncheckedIndexedAccess`, editorconfig. D1 resolved: Tailwind. | #1 |
| 2026-04-16 | F0.2 | Vercel connected, GitHub Actions CI (lint + format + build), `vercel.json`, `.env.example`, README rewritten. Node 24. | #2 |
| 2026-04-17 | F0.3 | Responsive shell: Header, Footer, four stub sections (intro, map, videos, contact), page.tsx rewritten, metadata updated. | #3 |
| 2026-04-17 | F0.4 | Design token system in globals.css (sage green / amber palette), all components updated to token-based classes, dark mode, docs/style-guide.md added. | #4 |
| 2026-04-17 | F1.1–F1.4 | Phase 1 complete: mobile hamburger nav, Swedish intro copy, YouTube nocookie embeds (2 videos), 3-column footer with data attribution. D2 resolved: YouTube. | #5 |
| 2026-04-17 | F2.1–F2.4 | Phase 2 complete: Mapbox GL JS integrated, Stockholm camera + pan bounds, Mapbox Studio style exported to `/public/map-style.json`, lazy-loaded via `next/dynamic`. Production Lighthouse score: 68. D3 resolved: Studio export. See `docs/performance-baseline.md`. | #6 |
| 2026-04-20 | F3.1–F3.6 + F4.1–F4.2 | Phase 3 complete: CSV → GeoJSON generation script, municipality boundaries (okfse/sweden-geojson), monochrome map style, 2D overview with hover highlight, municipality selection (click + list), fitBounds + 3D transition at pitch=45, housing extrusions (småhus/flerbostadshus/new), Idag/2060 toggle, back button. F4.1 and F4.2 merged into Phase 3. Race condition in lazy housing init fixed. D4 resolved. | #7 |
| 2026-04-20 | F4.3 | Phase 4 complete. MunicipalityCard (overview/detail states), StatsPanel, bidirectional hover sync with auto-scroll, municipality dim layer, tighter zoom. UI polish: 3px outlines + white hover outline, glassy card (zinc-700/88), flex-1 toggle, floating absolute layout. D5 resolved. | #8 |
| 2026-04-20 | F5.1–F5.3 | Phase 5 complete. ContactForm component: 4 fields (name, email, phone, zip/municipality), client-side validation, idle/submitting/success/error states. Formspree integration via `NEXT_PUBLIC_FORMSPREE_URL` (no new deps). GDPR consent checkbox with inline Swedish privacy copy. D6 resolved. | #9 |
| 2026-04-21 | F5.4 | Aesthetic refinements. Font: Geist → Space Grotesk. Headline: uppercase + scaleX(0.9) condensed block style, fluid `clamp(2rem, 9vw, 5rem)` sizing to fill container width. Eyebrow labels removed sitewide. ContactForm: no card wrapper, bottom-border inputs, pill submit button. Footer: single slim bar on bg-primary-light. Section dividers: border-t intro→videos; removed videos→contact. Mobile overflow fixed: `overflow-x: hidden` on html+body, `w-full` on body+main. | #9 |
| 2026-04-22 | F6.1–F6.7 | Phase 6 complete. Generator rewritten: seeded PRNG, point-in-polygon placement, 4 footprint shapes, data-driven heights (20–400 m), blue/red color scheme. Floating map box with rounded corners. fitBounds camera per municipality. Centroid-point label source (no tile-boundary duplication), labels hidden in overview. Hover: scale+size zoom on list items, manual scroll centering. Card: gray #d3d3d3 water-match background, 2/3-height list, 380 px wide, white text. Round line joins on boundaries. Neighboring regions (Uppsala, Västmanland, Södermanland) at half opacity. | — |
| 2026-04-22 | F6.6 | List UI refinements & hover bug fix. Root cause: `onMouseLeave(A)` fires after `onMouseEnter(B)`, causing map highlight to clear when moving directly between adjacent items. Fix: 0 ms debounced leave handler (`leaveTimer` ref + `setTimeout`) lets `onMouseEnter` cancel the clear before it runs. `isListHovering` ref added to skip `scrollIntoView` when hover originates from the list. Font sizes increased to `text-2xl`/`text-3xl`. Hover color: `#AAC0AA` text + `bg-white` background. Items right-aligned. Scroll indicators: up/down chevron SVGs. `.scrollbar-white` CSS utility added. | — |
| 2026-04-22 | F6.8 | Stats card redesign, list style alignment & crossfade. StatsCard: free-floating white card, auto-height, `top-4 right-4`. StatsPanel: 2×2 grid, dark-green numbers, muted-green uppercase labels, inline SVG icons in map colors. Bostadsmix stacked bar (h-6), animated 300 ms on toggle. Förtätning field (`fortattning`) from CSV. MunicipalityList: white card, `text-[#5c8b5a]`, full-width inverted hover. Crossfade: both cards always mounted, opacity toggled 300 ms. | — |
| 2026-04-22 | F6.9 | Housing generator rewritten: cluster-based → grid-based (`generateGridPositions`). Buffer = `halfSize×√2` eliminates boundary leakage. `wide` shape offsets scaled to ±1.0 to prevent overlap. Heights proportional to footprint (`halfSize × AVG_M_PER_DEG × ratio`), clamped per type. Script ~300 lines. Typography and layer colors redesigned. See `project_phases/Phase6_map_visual_redesign.md`. | — |
| 2026-04-28 | Roadmap | Phases 7–13 defined: housing shape fixes, deep linking, post-selection pan/zoom, mobile layout, contact form updates, visual alignment, cleanup & launch. Old Phase 7 (analytics) and Phase 8 (polish) folded in. | — |
| 2026-04-29 | F12.1 | Phase 12 complete. Design refresh: neutral palette, Inter/Oswald font stack, Oswald applied globally, wider map layout, map info button, social icons in footer, footer cleanup, reduced Mapbox overlay opacity, mobile font size + intro scaling fixes, iOS down-arrow glyph fix. Phase 9 (Post-Selection Pan & Zoom) removed from backlog — no longer relevant. D8 resolved. | — |
| 2026-04-29 | F5.2 | Replaced Formspree with Supabase Postgres (Frankfurt). Plain fetch to Supabase REST API — no new npm dep. INSERT-only RLS policy. CSV export via table editor. GDPR text updated. Env vars: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. D6 re-resolved. | #10 |
| 2026-04-29 | F13.1–F13.2 | Cleanup and Bug Fixes. Removed unused scripts, components (`Header`, `DataNoteSection`), redundant GeoJSON data and dead variables. Resolved map selection highlight race conditions and housing visibility bugs. Fixed `MultiPolygon` parsing for generator to support all municipality borders correctly, and corrected the scaling distortion on rotated rectangle shapes. | — |
