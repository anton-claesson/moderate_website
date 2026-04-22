# Phase 6 — Map Visual Redesign: Implementation Plan

> Phase 6 — Map Visual Redesign. **Complete — branch `feature/visual-redesign-f6`.**

---

## Context

Phase 3–4 delivered a functional map with green box extrusions and a flat UI card. Phase 6 replaces the visual metaphor entirely: buildings become blue/red 3D shapes of varied height and footprint, the map floats as a styled card, and the municipality list UI is polished. A secondary pass of micro-tweaks (card styling, label behavior, polygon treatment, neighboring regions) followed the initial redesign.

---

## Features Delivered

### F6.1 — New building color scheme & data-driven heights
- `SMAHUS_COLOR = '#4A90D9'` (steel blue), `FLERBOSTADSHUS_COLOR = '#2C5282'` (navy), `FLERBOSTADSHUS_NEW_COLOR = '#D64045'` (red)
- Heights moved from constants into GeoJSON (`height` property per feature); `fill-extrusion-height: ['get', 'height']`
- Småhus: 20–100 m. Current flerbostadshus: 80–250 m. New 2060 buildings: 150–400 m (deliberately exaggerated for drama)
- **Files:** `src/types/housing.ts`, `src/lib/mapConfig.ts`, `src/lib/housingLayers.ts`

### F6.2 — Organic building placement (generator rewrite)
- Seeded PRNG (Mulberry32 variant) for deterministic randomness
- Point-in-polygon (ray casting) to reject placements outside municipality boundaries
- Clustered layout: 2–3 clusters per municipality, ring-by-ring expansion with ±60% jitter
- 4 footprint shapes: square (40%), L-shape (25%), wide rect (20%), T-shape (15%) — rotated randomly
- Flerbostadshus current + 2060-new drawn from a single position pool so new buildings are spatially interspersed, not peripheral
- **File:** `scripts/generate-housing-geojson.ts`; outputs `public/data/housing-*.geojson`

### F6.3 — Floating map box layout
- Map section: `bg-primary-light` background, narrower horizontal padding, `rounded-2xl overflow-hidden shadow-2xl`
- `OVERVIEW_PADDING_DESKTOP = { top: 20, bottom: 20, left: 20, right: 420 }` shifts overview content left of the 380px card
- **File:** `src/components/sections/MapSection.tsx`

### F6.4 — fitBounds camera & municipality labels
- `selectMunicipality` uses `fitBounds(computeBounds(feature))` so each municipality fills the map proportionally
- Two Mapbox symbol layers from a centroid point source (eliminates tile-boundary label duplication):
  - `municipality-labels-all`: size 11, hidden in overview, visible in detail view (filtered to exclude selected)
  - `municipality-labels-selected`: size 18 bold, always-overlap, shown only for the selected municipality
- Labels hidden on return to overview; filter reset on each selection
- **File:** `src/components/sections/MapSection.tsx`

### F6.5 — Municipality polygon & interaction polish
- Hover/selected fill: `#3a6fa8` at 0.8 opacity; outline hover: 3.5 px, full opacity
- Dim layer: 0.5 opacity over all non-selected municipalities in detail view
- `line-join: 'round'` + `line-cap: 'round'` on both outline layers for softer corners
- Background: `setHighlight` guarded with `isStyleLoaded()` + `getLayer()` to prevent pre-init errors
- **File:** `src/components/sections/MapSection.tsx`

### F6.6 — Municipality card & list UI
- Card background: `#d3d3d3` (matches map water color), fills full right side, no border/shadow
- List layout: flex 0.4:4:0.42 spacer ratio — list occupies most of card height with small breathing room top and bottom
- List items: uppercase, `text-2xl` base size, right-aligned via `flex justify-end` on each `<li>`; hovered item: `text-3xl`, `font-black`, `text-[#AAC0AA]`, `bg-white`
- Hover bug fix: 0 ms debounced leave handler (`leaveTimer` ref + `setTimeout`) prevents `onMouseLeave` from clearing the map highlight when the cursor transitions directly between adjacent items; `isListHovering` ref distinguishes list-originated hovers from map-originated hovers
- Auto-scroll: `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` triggered only when hover originates from the map (guarded by `isListHovering`), so hovering a list item directly never triggers a scroll that would re-fire `onMouseLeave`
- Scroll indicators: up/down chevron SVGs (stroke-width 5, white, 75% opacity) rendered in the spacer flex areas above and below the list; visibility driven by `scrollTop` state updated on the container's `onScroll`
- White custom scrollbar: `.scrollbar-white` CSS utility (`scrollbar-width: thin`, `scrollbar-color: white transparent`, `-webkit-scrollbar` overrides) applied to the list scroll container
- Card width: 380 px; detail view uses `text-text-on-dark` white-variant text throughout
- **Files:** `src/app/globals.css`, `src/components/map/MunicipalityCard.tsx`, `src/components/map/MunicipalityList.tsx`, `src/components/map/StatsPanel.tsx`, `src/components/map/LayerToggle.tsx`, `src/components/map/BackButton.tsx`

### F6.7 — Neighboring regions overlay
- Uppsala, Västmanland, Södermanland municipalities from `okfse/sweden-geojson` filtered by `lan_code` (03, 04, 19)
- Rendered below Stockholm municipality layers: `fill-color: '#89b6a5', fill-opacity: 0.35` — same hue, half opacity
- No outlines, no interaction handlers
- **Script:** `scripts/generate-neighboring-regions.ts` → `public/data/neighboring-regions.geojson`
- **File:** `src/components/sections/MapSection.tsx`

---

## Scripts Added / Modified

| Script | Purpose |
|--------|---------|
| `scripts/generate-housing-geojson.ts` | Rewritten: clustered placement, varied shapes, data-driven heights |
| `scripts/generate-neighboring-regions.ts` | New: filters Swedish municipalities by county code |
| `scripts/generate-outside-region.ts` | New: generates inverted-mask GeoJSON (superseded by neighboring-regions approach) |
| `scripts/smooth-municipalities.ts` | New: Chaikin smoothing utility (explored but not used in final output) |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Building colors | Blue (existing) / Red (new 2060) | Immediately communicates existing vs. planned construction |
| Heights | Data-driven, exaggerated (up to 400 m) | Visual density metaphor, not architectural accuracy |
| Label source | Centroid point GeoJSON, not polygon source | Eliminates tile-boundary label duplication |
| Neighboring regions | Municipality-level (not county-level) | Matches polygon detail of Stockholm municipalities |
| Card background | `#d3d3d3` (map water color) | Card appears to float over the water area of the map |
