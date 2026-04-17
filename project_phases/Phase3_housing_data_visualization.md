# Phase 3 — Housing Data Visualization: Implementation Plan

> Phase 3 — Housing Data Visualization. Features F3.1–F3.6. Source: `project_plan.md`.

---

## Context

Phase 2 delivered a styled Mapbox map centered on Stockholm with correct pan bounds. Phase 3 is the product's core: render current and future housing stock as representative 3D extrusions on the map, with a toggle to switch between "Idag" (today) and "2060" views.

**Data source:** `/public/bostads_data.xlsx` — tabular stats per municipality. Relevant columns:
- `Kommun` — municipality name
- `Antal Smahus` — small houses (single-family, same today and 2060)
- `Antal Flerbostadshus` — apartment buildings today
- `Antal flerbostadshus 2060 (hög)` — apartment buildings 2060, high scenario

**Key data rule:** Only new `Flerbostadshus` are built; `Smahus` count is identical for current and 2060 views.

**Representative units:** Instead of per-building data, place scaled representative markers:
- 1 small-house unit on map per 100 `Smahus` (scaling TBD, this is a starting guess)
- 1 apartment-block unit on map per 1000 `Flerbostadshus` (scaling TBD)

**Placement:** Scatter representative units around hardcoded municipality centroid coordinates. Exact placement is exploratory — we start with a simple grid and can refine.

**Phase 2 gap to fix:** `MapCanvas.tsx` is missing `pitch` and `bearing`, and `/src/lib/mapConfig.ts` was never created. Fixed in F3.3.

---

## Branching

All Phase 3 features live on a single branch: `feature/phase-3-housing-visualization`.

---

## Architecture

```
bostads_data.xlsx
       │
scripts/generate-housing-geojson.ts  (devDependency: xlsx)
       │ outputs
       ▼
public/data/housing-smahus.geojson         (same for both views)
public/data/housing-flerbostadshus.geojson (current)
public/data/housing-flerbostadshus-2060.geojson (2060 projection)

MapSection (orchestrator)
├── state: view = 'current' | '2060'
├── fetches all 3 GeoJSON files (Promise.all)
├── MapCanvas — onMapReady gives map instance; pitch/bearing fixed
├── housingLayers.ts — addAllLayers(map, smahusData, currentData, futureData)
│   ├── layer: 'smahus-extrusion' (always visible, small house color)
│   ├── layer: 'flerbostadshus-current-extrusion' (green)
│   └── layer: 'flerbostadshus-2060-extrusion' (amber)
└── LayerToggle — "Idag" / "2060" switches layer visibility
```

---

## Features

### F3.1 — Data source & schema definition

**Steps:**
1. Create `/src/types/housing.ts`:
   ```ts
   export type HousingType = 'smahus' | 'flerbostadshus';
   export type HousingView = 'current' | '2060';

   export interface HousingUnitProperties {
     id: string;
     municipality: string;
     type: HousingType;
     view: HousingView | 'both';  // 'both' = smahus (unchanged)
   }

   export type HousingUnit = GeoJSON.Feature<GeoJSON.Polygon, HousingUnitProperties>;
   export type HousingCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, HousingUnitProperties>;
   ```
2. Create `/src/lib/mapConfig.ts`:
   ```ts
   export const STOCKHOLM_CENTER: [number, number] = [18.07, 59.33];
   export const STOCKHOLM_BOUNDS: [[number, number], [number, number]] = [
     [17.25, 58.9], [19.1, 59.85],
   ];
   export const DEFAULT_ZOOM = 9;
   export const DEFAULT_PITCH = 45;
   export const DEFAULT_BEARING = -15;

   export const SMAHUS_LAYER_ID = 'smahus-extrusion';
   export const FLERBOSTADSHUS_CURRENT_LAYER_ID = 'flerbostadshus-current-extrusion';
   export const FLERBOSTADSHUS_2060_LAYER_ID = 'flerbostadshus-2060-extrusion';

   export const SMAHUS_COLOR = '#7BAE79';
   export const FLERBOSTADSHUS_COLOR = '#5C8B5A';
   export const FLERBOSTADSHUS_2060_COLOR = '#E8A838';

   export const SMAHUS_PER_REPRESENTATIVE = 100;
   export const FLERBOSTADSHUS_PER_REPRESENTATIVE = 1000;

   export const SMAHUS_SIZE_DEG = 0.0003;
   export const FLERBOSTADSHUS_SIZE_DEG = 0.0008;
   export const SMAHUS_HEIGHT_M = 6;
   export const FLERBOSTADSHUS_HEIGHT_M = 24;
   ```
3. Create `/src/data/municipalityCentroids.ts` — hardcoded centroid coordinates for all 26 Stockholm Region municipalities.
4. Update `project_plan.md`: flip F3.1 to `[x]`, note D4 resolved.

**Critical files:**
- `/src/types/housing.ts` — new
- `/src/lib/mapConfig.ts` — new
- `/src/data/municipalityCentroids.ts` — new

---

### F3.2 — Dataset generated from XLSX

**Steps:**
1. Install dev dependency: `npm install --save-dev xlsx`
2. Create `/scripts/generate-housing-geojson.ts`:
   - Reads `/public/bostads_data.xlsx`, columns: `Kommun`, `Antal Smahus`, `Antal Flerbostadshus`, `Antal flerbostadshus 2060 (hög)`
   - Looks up centroid from `municipalityCentroids.ts`
   - Computes: `n_smahus = floor(smahus / SMAHUS_PER_REPRESENTATIVE)`, etc.
   - Generates square polygon footprints scattered in a grid around each centroid
   - Writes 3 GeoJSON files to `/public/data/`
3. Add to `package.json`: `"generate:housing": "tsx scripts/generate-housing-geojson.ts"`
4. Run `npm run generate:housing` and commit the output files

**Placement algorithm (simple grid):**
```
col = i % GRID_COLS
row = floor(i / GRID_COLS)
offset_lng = (col - GRID_COLS/2) * (size_deg * 2)
offset_lat = row * (size_deg * 2)
unit_center = [lng + offset_lng, lat + offset_lat]
```

**Critical files:**
- `/scripts/generate-housing-geojson.ts` — new
- `/public/data/housing-smahus.geojson` — generated
- `/public/data/housing-flerbostadshus.geojson` — generated
- `/public/data/housing-flerbostadshus-2060.geojson` — generated

---

### F3.3 — Housing layers on the map

**Steps:**
1. Fix Phase 2 gap in `MapCanvas.tsx`: add `pitch`, `bearing`, update `center`/`zoom`/`maxBounds` from `mapConfig.ts`, add `onMapReady` prop called in `map.on('load', ...)`
2. Create `/src/lib/housingLayers.ts`:
   - `addAllLayers(map, smahusData, currentData, futureData)` — 3 sources + fill-extrusion layers
   - `setLayerVisibility(map, view: 'current' | '2060')` — smahus always visible; current/2060 mutually exclusive
   - Heights are constant per type (not data-driven)
3. Update `MapSection.tsx`: fetch all 3 GeoJSON via `Promise.all`, wire `onMapReady` → `addAllLayers`
4. Create `housingLayers.test.ts` — unit tests with mocked map

**Critical files:**
- `/src/components/map/MapCanvas.tsx` — add `onMapReady`, fix pitch/bearing/bounds
- `/src/lib/housingLayers.ts` — new
- `/src/lib/housingLayers.test.ts` — new
- `/src/components/sections/MapSection.tsx` — fetch + layer wiring

---

### F3.4 — Toggle UI: "Idag" vs "2060"

**Steps:**
1. Create `/src/components/map/LayerToggle.tsx`:
   - Props: `view: 'current' | '2060'`, `onChange: (v: 'current' | '2060') => void`
   - Two-state toggle: "Idag" | "2060"
   - Absolute-positioned, bottom-left of map, z-index above map
   - Design tokens: dark green bg, amber active, 44px min tap target
2. Add `view` state (default `'current'`) to `MapSection.tsx`
3. `useEffect` on `view` → `setLayerVisibility(map, view)`
4. Component test: renders both options, fires `onChange`

**Critical files:**
- `/src/components/map/LayerToggle.tsx` — new
- `/src/components/sections/MapSection.tsx` — add toggle state + render

---

### F3.5 — Visual QA and placement tuning

**Steps:**
1. `npm run dev` — inspect map visually at various zoom levels
2. Tune `SMAHUS_PER_REPRESENTATIVE` / `FLERBOSTADSHUS_PER_REPRESENTATIVE` if density looks wrong
3. Tune grid spacing if units overlap
4. Verify visual distinction: smahus (small, light green) vs flerbostadshus (tall, dark green / amber in 2060)
5. `npm run build` + `npm run format:check` — clean pass

---

### F3.6 — Real dataset & performance validation

**Steps:**
1. Confirm XLSX column names match generation script (run script, check for errors)
2. Check total GeoJSON feature count; if > ~2000 features assess performance impact
3. Lighthouse mobile preset on production build; compare to Phase 2 baseline (score: 68)
4. If total GeoJSON > 500KB: reduce grid density or polygon precision
5. Update `docs/performance-baseline.md`

---

## Decisions resolved

| ID | Decision | Resolution |
|----|----------|------------|
| D4 | Source datasets | XLSX at `/public/bostads_data.xlsx`. Columns: Kommun, Antal Smahus, Antal Flerbostadshus, Antal flerbostadshus 2060 (hög). Script generates static GeoJSON at build time. |

---

## Verification (end-to-end)

1. `npm run generate:housing` outputs 3 GeoJSON files without errors
2. `npm run dev` — map renders 3D extrusions at pitch=45; smahus and flerbostadshus visible per municipality
3. Toggle switches "Idag" ↔ "2060"; 2060 view shows more amber apartment blocks in high-growth areas
4. `npm run build` — no TypeScript errors, no ESLint violations
5. `npm run format:check` passes before each commit
6. Single PR `feature/phase-3-housing-visualization` → `main`; `project_plan.md` updated F3.1–F3.6 `[x]`
7. Post-F3.6: Lighthouse ≥ 58, LCP < 3s on mobile

---

## File change summary

| File | Action |
|------|--------|
| `/src/types/housing.ts` | New — TypeScript interfaces |
| `/src/lib/mapConfig.ts` | New — constants (completes Phase 2 gap) |
| `/src/data/municipalityCentroids.ts` | New — centroid coords for 26 municipalities |
| `/scripts/generate-housing-geojson.ts` | New — XLSX → GeoJSON generator |
| `/public/data/housing-smahus.geojson` | Generated |
| `/public/data/housing-flerbostadshus.geojson` | Generated |
| `/public/data/housing-flerbostadshus-2060.geojson` | Generated |
| `/src/lib/housingLayers.ts` | New — `addAllLayers`, `setLayerVisibility` |
| `/src/lib/housingLayers.test.ts` | New — unit tests |
| `/src/components/map/MapCanvas.tsx` | Edit — `onMapReady` prop, fix pitch/bearing/bounds |
| `/src/components/map/LayerToggle.tsx` | New — "Idag" / "2060" toggle |
| `/src/components/sections/MapSection.tsx` | Edit — fetch, layer wiring, toggle state |
| `docs/performance-baseline.md` | Edit — Phase 3 numbers |
| `project_plan.md` | Edit — F3.1–F3.6 `[x]` |
