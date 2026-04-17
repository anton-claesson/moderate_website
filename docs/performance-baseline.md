# Performance Baseline — F2.4

Lighthouse mobile preset (Moto G Power 2022 simulation, Fast 3G). Two runs taken during Phase 2.

---

## Run 1 — Dev server (reference only)

**Date:** 2026-04-17  
**Environment:** `npm run dev` (localhost:3000)  
**Score: 27** — not representative. Dev mode ships unminified JS, no tree-shaking, and includes ~218 KB of Next.js devtools that are absent in production. Discard this number for any real assessment.

---

## Run 2 — Production build (true baseline)

**Date:** 2026-04-17  
**Environment:** `npm run build && npm start` (localhost:3000)  
**Lazy-loading:** `MapCanvas` deferred via `next/dynamic` (applied before this run)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Performance score | **68** | ≥ 70 | ⚠️ Close |
| First Contentful Paint | 0.8 s | < 1.8 s | ✅ |
| Largest Contentful Paint | 2.4 s | < 2.5 s | ✅ |
| Total Blocking Time | 2,140 ms | < 200 ms | ❌ |
| Speed Index | 4.1 s | < 3.4 s | ⚠️ |
| Cumulative Layout Shift | 0 | < 0.1 | ✅ |
| Time to Interactive | 13.3 s | — | ❌ |

### Root cause of TBT / TTI

`mapbox-gl` (~2,537 ms CPU time) initialises on the main thread during React hydration even though the map is below the fold. `next/dynamic` defers the bundle download but not the render trigger — MapSection is mounted immediately by page.tsx.

### Known improvement (deferred to Phase 7)

Wrapping `MapCanvas` in an `IntersectionObserver` would push all Mapbox init work until the user scrolls to the map section, directly cutting TBT and TTI. Deferred to F7.3 (Performance optimization).

### Context

- This baseline was measured on localhost, not a Vercel deployment. Vercel's CDN, HTTP/2, and Brotli compression will improve real-world scores.
- LCP of 2.4 s already satisfies the project success criterion ("mobile load time under 3 s on a 4G connection").
- A score of 68 is reasonable for a map-heavy application at this stage of development.
