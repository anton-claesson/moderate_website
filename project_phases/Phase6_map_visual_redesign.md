# Phase 6 — Map Visual Redesign: Implementation Plan

> Phase 6 — Map Visual Redesign. **Complete — branch `feature/map-visual-redesign`. Post-F6.8 refinements documented below.**

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

### F6.8 — Stats card redesign, list style alignment & crossfade transition

- **StatsCard** (new component): free-floating white card (`bg-white rounded-2xl shadow-xl`) positioned `top-4 right-4` inside the map container, replacing the full-height sidebar in detail view. Contains back button, municipality heading, StatsPanel, and a light-themed Idag/Planerad toggle.
- **StatsPanel** 2×2 stat grid: large dark-green (`#3a5c39 font-black text-2xl`) numbers with muted-green (`#AAC0AA`) uppercase tracking-wide labels. Each cell carries an inline SVG icon — house in `SMAHUS_COLOR` (`#4A90D9`), building in `FLERBOSTADSHUS_COLOR` (`#2C5282`), building in `FLERBOSTADSHUS_NEW_COLOR` (`#D64045`) — matching the 3D extrusion colors exactly. Icons imported from `src/lib/mapConfig`.
- **Housing mix bar chart** (replaces old progress bar): full-width `h-6` stacked bar below the grid, labeled "Bostadsmix". Three segments in map colors — Småhus / Lgh idag / Lgh nytt — sized by their share of the total unit count. The red (Lgh nytt) segment only appears in Planerad view; all three animate via `transition-[width] duration-300` when the toggle changes.
- **Förtätning data update**: `growthPct` field renamed to `fortattning` in `MunicipalityStats`; all 26 values replaced from the new "Förtätning" column in `public/bostads_data.csv` (integer unit counts, range 41–386). Displayed with `%` suffix in the stat cell.
- **MunicipalityList**: white floating card (`bg-white rounded-2xl shadow-xl`). List items: full-width buttons, text right-aligned, `text-[#5c8b5a]` at rest. Hover: inverted — `bg-[#5c8b5a] text-white`. Green chevron scroll indicators (`stroke="#5c8b5a"`). `scrollbar-green` CSS utility added.
- **Crossfade transition**: list card and stats card are always mounted; visibility toggled via `opacity-0/100` + `pointer-events-none/auto` with `transition-opacity duration-300`. `displayStats` state is set in the `selectMunicipality` event handler (never cleared) so StatsCard remains mounted with the last municipality's data during the fade-out, enabling a true bidirectional crossfade.
- **Files:** `src/app/globals.css`, `src/components/map/MunicipalityCard.tsx`, `src/components/map/MunicipalityList.tsx`, `src/components/map/StatsCard.tsx` (new), `src/components/map/StatsPanel.tsx`, `src/components/sections/MapSection.tsx`, `src/data/housingStats.ts`, `public/bostads_data.csv`

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

---

## Post-F6.8 Refinements (F6.9)

Additional work on branch `feature/map-visual-redesign` after F6.8 was shipped.

### Housing generator: cluster → grid algorithm

The original cluster-based placement (find cluster centers → ring-by-ring expansion → collision detection) was replaced with a simpler and more robust grid approach.

**New algorithm (`generateGridPositions`):**
1. Sweep the municipality bounding box in `cellSize` steps
2. For each cell center, run four cardinal `pointInRing` checks with a buffer = `halfSize × √2` (covers all diagonal corners of a square footprint)
3. Seeded Fisher-Yates shuffle the candidates for deterministic but non-sequential spatial ordering
4. Slice to the requested count

This guarantees no same-type overlap by construction (each building occupies exactly one cell) and no boundary leakage (the diagonal buffer is always sufficient for rectangular footprints).

**Constants introduced:**

| Constant | Value | Purpose |
|----------|-------|---------|
| `TOTAL_COVERAGE` | 0.4 | Fraction of polygon area covered by all buildings |
| `FILL_FACTOR` | 0.7 | Footprint occupies 70% of the grid cell |
| `JITTER` | 0.1 | ±10% random displacement per building within cell |
| `FLERBO_WEIGHT` | `FLERBOSTADSHUS_PER_REPRESENTATIVE / SMAHUS_PER_REPRESENTATIVE` | Flerbo buildings get proportionally more area |
| `AVG_M_PER_DEG` | 84 150 | Average m/° at 59°N, used to convert degree footprint to metres |
| `SMAHUS_HEIGHT_RATIO` | 1 | Height = halfSize × AVG_M_PER_DEG × ratio |
| `FLERBO_HEIGHT_RATIO` | 2.5 | — |
| `FLERBO_NEW_HEIGHT_RATIO` | 3.0 | New 2060 blocks ~1.2× taller |
| `HEIGHT_VARIATION` | 0.2 | Per-building multiplier in [0.9, 1.1] |

**Clamps per type:**

| Type | Min (m) | Max (m) |
|------|---------|---------|
| Småhus | 20 | 60 |
| Flerbostadshus current | 150 | 600 |
| Flerbostadshus new 2060 | 180 | 720 |

**Shape fix:** `wide` shape offsets scaled from ±1.5 to ±1.0 of `halfSize`. The 1.5 factor exceeded cell boundaries at `FILL_FACTOR=0.7`, causing adjacent wide buildings to overlap; aspect ratio preserved at 2.5:1.

**Script size:** ~300 lines (down from ~547). Removed: `findClusterCenters`, `generateClusteredPositions`, `isOverlapping`, `globalHeightMod`, `HEIGHT_MIN/MAX` constants, `dynamicNClusters`.

**Files:** `scripts/generate-housing-geojson.ts`, `public/data/housing-*.geojson`

### Other refinements

- Map typography and layer colors redesigned for better contrast
- `isStyleLoaded` guards removed from housing layer functions (no longer needed after init sequencing was fixed)
- Manual center calculation for `flyTo` to avoid Null Island edge case
- Layer toggle view types corrected for planned housing
