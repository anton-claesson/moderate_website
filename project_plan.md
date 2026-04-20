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
- [ ] **F4.3 — Info text box overlay.** Overlay showing municipality name and summary stats when selected. `[DECISION NEEDED]`: scope of info shown.
- [ ] **F4.4 — Reset / "back to overview" control.** Merged into F3.6.

### Phase 5 — Contact / Newsletter

Convert visitors into newsletter subscribers.

- [ ] **F5.1 — Contact form UI.** Mobile-first form with name + email fields, validation, success/error states.
- [ ] **F5.2 — Form submission backend.** Wire form to chosen provider. `[DECISION NEEDED]`: Formspree vs. Resend vs. Vercel Forms vs. other. Consider GDPR (audience is in EU).
- [ ] **F5.3 — GDPR consent & privacy copy.** Consent checkbox, link to privacy policy, document data handling.

### Phase 6 — Analytics & Observability

- [ ] **F6.1 — Traffic analytics.** Add lightweight analytics (Vercel Analytics or Plausible). Confirm GDPR-friendly configuration. `[DECISION NEEDED]`: provider.
- [ ] **F6.2 — Key event tracking.** Track: municipality selections, current/future toggle usage, form submissions, video plays. Keep it minimal.

### Phase 7 — Polish & Launch Readiness

- [ ] **F7.1 — Cross-device QA.** Test on real iOS, Android, and desktop browsers. Document and fix issues.
- [ ] **F7.2 — Accessibility pass.** Keyboard navigation, focus states, color contrast, screen reader labels for non-map content. Document map's accessibility limitations honestly.
- [ ] **F7.3 — Performance optimization.** Image/video lazy loading, GeoJSON simplification if needed, font subsetting, Lighthouse audit.
- [ ] **F7.4 — SEO & social sharing.** Meta tags, OG image, favicon, sitemap.
- [ ] **F7.5 — Launch checklist.** Custom domain, HTTPS, production env vars, analytics live, form recipient confirmed.

### Phase 8 — Post-Launch (optional / deferred)

- [ ] **F8.1 — Data update workflow.** Document how to refresh GeoJSON when new construction data is published.
- [ ] **F8.2 — Additional municipality stats.** Richer info overlay (population, units planned, timelines).
- [ ] **F8.3 — Time-slider.** Scrub through years to see future stock materialize over time.
- [ ] **F8.4 — Filtering by attributes.** E.g., by developer, project status, building type.

---

## 6. Open Decisions

Tracked here so they don't get lost between sessions. Resolve before — or as the first step of — the dependent feature.

| ID | Decision | Blocks | Notes |
|---|---|---|---|
| D1 | Styling approach (Tailwind vs. CSS Modules) | F0.1 | **Resolved 2026-04-16: Tailwind CSS.** |
| D2 | Video source(s) and count | F1.3 | **Resolved 2026-04-17: YouTube (nocookie embeds), 2 videos.** |
| D3 | Mapbox style: Studio vs. inline overrides | F2.3 | **Resolved 2026-04-17: Mapbox Studio → exported `style.json` committed to `/public/`.** |
| D4 | Source datasets for current & future housing | F3.1 | **Resolved 2026-04-18: `/public/bostads_data.csv`. Columns: Antal småhus, Antal flerbostadshus, Antal flerbostadshus 2060 (hög). Script generates static GeoJSON at dev time.** |
| D5 | Info overlay scope (static vs. per-municipality stats) | F4.3 | |
| D6 | Form backend provider | F5.2 | GDPR compliance is a hard requirement |
| D7 | Analytics provider | F6.1 | |

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
