# Phase 2 — Map Foundation: Implementation Plan

> Phase 2 — Map Foundation. Features F2.1–F2.4. Source: `project_plan.md`.

---

## Context

Phase 1 (static content) is complete. Phase 2 stands up the Mapbox GL JS map with correct framing, styling, and performance baseline — no data layers yet. This is the prerequisite for all Phase 3 housing visualization work.

D3 resolved: **Mapbox Studio → exported `style.json`** committed to `/public/`. All visual design happens in Studio (stakeholder-inclusive), exported JSON is version-controlled. No runtime style overrides.

---

## Features

### F2.1 — Mapbox integration

**Goal:** Install Mapbox GL JS, render a basic map in `MapSection`.

**Branch:** `feature/f2.1-mapbox-integration`

**Steps:**
1. Install dependencies:
   ```
   npm install mapbox-gl
   npm install --save-dev @types/mapbox-gl
   ```
2. Verify `NEXT_PUBLIC_MAPBOX_TOKEN=` is stubbed in `.env.example`
3. Create `/src/components/map/MapCanvas.tsx` — a `'use client'` component that:
   - Accepts a `style` prop (string URL or style object, defaults to `'mapbox://styles/mapbox/streets-v12'` as temporary placeholder)
   - Uses `useRef` for the container div and map instance
   - Initializes `mapboxgl.Map` in `useEffect`, cleans up with `map.remove()` on unmount
   - Reads token from `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`
   - Renders a `div` that fills its container (100% width/height)
4. Update `MapSection.tsx` to render `<MapCanvas />` inside the existing container div (replacing the placeholder span)
5. Verify the map renders locally

**Critical files:**
- `/src/components/sections/MapSection.tsx` — replace stub
- `/src/components/map/MapCanvas.tsx` — new file

---

### F2.2 — Birds-eye 3D camera & Stockholm bounds

**Goal:** Set the correct initial view and restrict pan/zoom to the Stockholm Region.

**Branch:** `feature/f2.2-camera-bounds` (or continue on F2.1 branch)

**Steps:**
1. Add camera constants to `/src/lib/mapConfig.ts` (new file):
   ```ts
   export const STOCKHOLM_CENTER: [number, number] = [18.07, 59.33];
   export const STOCKHOLM_BOUNDS: [[number, number], [number, number]] = [
     [17.25, 58.9],  // SW corner — Stockholm Region
     [19.1, 59.85],  // NE corner
   ];
   export const DEFAULT_ZOOM = 9;
   export const DEFAULT_PITCH = 45;
   export const DEFAULT_BEARING = -15;
   ```
2. Pass these into `mapboxgl.Map` constructor in `MapCanvas.tsx`:
   - `center`, `zoom`, `pitch`, `bearing`
   - `maxBounds: STOCKHOLM_BOUNDS`
3. Verify: panning beyond region boundary is blocked; initial view shows Stockholm in isometric 3D perspective

**Critical files:**
- `/src/lib/mapConfig.ts` — new file with constants
- `/src/components/map/MapCanvas.tsx` — consume constants

---

### F2.3 — Custom map style

**Goal:** Apply "Google Maps × Sims" aesthetic via a Studio-exported `style.json`.

**Branch:** `feature/f2.3-map-style`

**Steps:**
1. **Design in Mapbox Studio** (stakeholder session):
   - Base the style on Mapbox's "Light" or "Outdoors" starter
   - Target palette from design tokens (`docs/style-guide.md`):
     - Land: `#f0f0ea` (surface-muted)
     - Water: `#2c3e2d` (map-bg)
     - Buildings: muted sage
     - Labels: minimal, Geist-adjacent sans-serif
   - Hide or simplify POI/transit clutter
   - Enable 3D buildings layer (needed for Phase 3 extrusions)
2. Export style from Studio: **Export → Download style ZIP** → extract `style.json`
3. Place exported file at `/public/map-style.json`
4. Update `MapCanvas.tsx` `style` prop default to `'/map-style.json'`
5. Verify style loads and matches design intent on both light and dark OS settings

**Note:** Sprite and glyph URLs in the exported JSON still reference Mapbox CDN — a valid token is required (already assumed).

**Critical files:**
- `/public/map-style.json` — new file (exported from Studio)
- `/src/components/map/MapCanvas.tsx` — update default style prop

---

### F2.4 — Performance baseline

**Goal:** Document load time and FPS numbers as a regression baseline before data layers are added.

**Branch:** Same as F2.3 or its own small commit.

**Steps:**
1. Open Chrome DevTools → Performance tab
2. Simulate mid-range mobile: **CPU 4× slowdown**, **Network: Fast 3G**
3. Record: initial page load, time-to-map-interactive, scrolled FPS during map pan
4. Run Lighthouse on mobile preset, note Performance score
5. Document results in `docs/performance-baseline.md`:
   - Date, device simulation settings
   - Load time (ms), time-to-interactive (ms), map FPS, Lighthouse score
   - Screenshot of Lighthouse report (optional)
6. Commit `docs/performance-baseline.md`

**Critical files:**
- `docs/performance-baseline.md` — new file

---

## Decisions resolved

| ID | Decision | Resolution |
|----|----------|------------|
| D3 | Mapbox style approach | Mapbox Studio → exported `style.json` at `/public/map-style.json` |

---

## Verification (end-to-end)

1. `npm run dev` — map renders in `MapSection` with no console errors
2. Map initializes centered on Stockholm, pitched to ~45°, pan blocked outside region bounds
3. Style matches the sage/amber/dark-green palette from `docs/style-guide.md`
4. `npm run build` passes — no TypeScript errors, no ESLint violations
5. Performance baseline documented in `docs/performance-baseline.md`
6. Each feature merged via PR per CLAUDE.md workflow; D3 updated to resolved in `project_plan.md`
