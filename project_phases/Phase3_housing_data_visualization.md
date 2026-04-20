# Phase 3 — Housing Data Visualization: Implementation Plan (Revised)

> Phase 3 — Housing Data Visualization. Features F3.1–F3.6. Source: `project_plan.md`.
> Revised to incorporate Phase 4 interaction features (municipality selection, zoom animation).

---

## Context

Phase 2 delivered a styled Mapbox map. Phase 3 builds the full interactive experience:

**UX flow:**
1. User lands on page → sees a 2D schematic overview map with all 26 municipality outlines. No pan/zoom — the view is fixed.
2. User clicks a municipality on the map **or** selects one from a list → smooth flyTo + pitch transition to a 3D detail view of that municipality.
3. In detail view: housing extrusions visible (current stock). Toggle switches to 2060 projection.
4. Back button / deselecting → animates back to 2D overview.

**Data source:** `/public/bostads_data.csv`. Columns used: `Antal småhus`, `Antal flerbostadshus`, `Antal flerbostadshus 2060 (hög)`. Housing shown as representative units (1 per 100 småhus / 1 per 1000 flerbostadshus).

---

## Architecture

```
MapSection (main orchestrator)
├── state: selectedMunicipality: string | null
├── MapCanvas — onMapReady gives map instance
│   Initial state: zoom=8, pitch=0 (2D overview), pan/zoom disabled
├── municipality-boundaries GeoJSON layer (always present, clickable)
├── MunicipalityList component — list of all 26 municipalities
│
├── Overview mode (selectedMunicipality = null):
│   - Municipality polygons highlighted on hover
│   - Click → setSelectedMunicipality
│
└── Detail mode (selectedMunicipality = "Nacka"):
    - flyTo centroid at zoom=13, pitch=45
    - housingLayers.ts adds filtered extrusion layers
    - LayerToggle ("Idag" / "2060")
    - Back button → flyTo overview, pitch=0, clear layers
```

---

## Status — COMPLETE (merged 2026-04-20, PR #7)

- [x] F3.1 — Schema, mapConfig, municipalityCentroids
- [x] F3.2 — GeoJSON generation from CSV
- [x] F3.3 — Municipality boundaries + 2D overview
- [x] F3.4 — Municipality selection (click + list)
- [x] F3.5 — Detail view: fitBounds, 3D, housing layers
- [x] F3.6 — "Idag" / "2060" toggle + back button

---

## Features

### F3.3 — Municipality boundaries + 2D overview

**Prerequisite:** Download Stockholm Region municipality polygon GeoJSON → save to
`/public/data/municipalities.geojson`. Source: SCB open data (Kommungränser) or equivalent.
Each feature must have a `KnNamn` or similar property with the municipality name.

**Steps:**
1. Add overview camera constants to `src/lib/mapConfig.ts`:
   ```ts
   export const OVERVIEW_ZOOM = 8;
   export const OVERVIEW_PITCH = 0;
   export const OVERVIEW_BEARING = 0;
   export const DETAIL_ZOOM = 13;
   ```
2. Update `MapCanvas.tsx`:
   - Initial camera: `zoom: OVERVIEW_ZOOM`, `pitch: OVERVIEW_PITCH`, `bearing: OVERVIEW_BEARING`
   - Keep `onMapReady` prop
3. Update `MapSection.tsx`:
   - Store map instance in `useRef` via `onMapReady`
   - On map ready: `map.dragPan.disable()`, `map.scrollZoom.disable()`, `map.doubleClickZoom.disable()`
   - Add municipality GeoJSON source + two layers:
     - `municipalities-fill`: transparent fill (for click hit area)
     - `municipalities-outline`: visible stroke in design token color

**Critical files:**
- `/public/data/municipalities.geojson` — new (external download)
- `/src/lib/mapConfig.ts` — add overview/detail constants
- `/src/components/map/MapCanvas.tsx` — use overview defaults
- `/src/components/sections/MapSection.tsx` — add boundary layers, disable interactions

---

### F3.4 — Municipality selection (click + list)

**Steps:**
1. In `MapSection.tsx`: add `selectedMunicipality: string | null` state (default `null`)
2. Add map click handler on `municipalities-fill` layer: reads `KnNamn` property → `setSelectedMunicipality`
3. Add hover handler: show pointer cursor + highlight hovered municipality
4. Create `src/components/map/MunicipalityList.tsx`:
   - Props: `municipalities: string[]`, `selected: string | null`, `onSelect: (name: string) => void`
   - Renders a scrollable list of all 26 municipality names
   - Positioned as an overlay (top-right of map, or below map on mobile)
   - Highlights the selected item

**Critical files:**
- `/src/components/sections/MapSection.tsx` — add state + click handlers
- `/src/components/map/MunicipalityList.tsx` — new

---

### F3.5 — Detail view: flyTo, 3D transition, housing layers

**Steps:**
1. In `MapSection.tsx`: `useEffect` on `selectedMunicipality` change:
   - If selected: `map.flyTo({ center: MUNICIPALITY_CENTROIDS[name], zoom: DETAIL_ZOOM, pitch: DEFAULT_PITCH, bearing: DEFAULT_BEARING, duration: 1500 })`; on fly-end, fetch housing GeoJSON (lazily, with cache) and call `addLayersForMunicipality(map, name, ...data)`
   - If deselected (back): remove housing layers, `map.flyTo({ center: STOCKHOLM_CENTER, zoom: OVERVIEW_ZOOM, pitch: OVERVIEW_PITCH, bearing: OVERVIEW_BEARING, duration: 1200 })`
2. Add `addLayersForMunicipality` to `housingLayers.ts`: same as `addAllLayers` but with a Mapbox layer filter: `['==', ['get', 'municipality'], municipalityName]`
3. Add `removeHousingLayers(map)` to `housingLayers.ts` for clean teardown on deselect

**Critical files:**
- `/src/components/sections/MapSection.tsx` — flyTo logic, layer wiring
- `/src/lib/housingLayers.ts` — add `addLayersForMunicipality`, `removeHousingLayers`

---

### F3.6 — Toggle + back button

**Steps:**
1. Create `src/components/map/LayerToggle.tsx`:
   - Props: `view: 'current' | '2060'`, `onChange: (v) => void`
   - Two-state toggle: "Idag" | "2060"
   - Only rendered when `selectedMunicipality !== null`
2. Create `src/components/map/BackButton.tsx`:
   - Renders "← Alla kommuner" button
   - Calls `setSelectedMunicipality(null)` on click
   - Only rendered when `selectedMunicipality !== null`
3. Add `view` state to `MapSection.tsx`; pass to `LayerToggle` and wire `setLayerVisibility`

**Critical files:**
- `/src/components/map/LayerToggle.tsx` — new
- `/src/components/map/BackButton.tsx` — new
- `/src/components/sections/MapSection.tsx` — add view state + render toggle + back button

---

## Decisions resolved

| ID | Decision | Resolution |
|----|----------|------------|
| D4 | Source datasets | `/public/bostads_data.csv`. Generator script → 3 static GeoJSON files. |
| D5 | Info overlay scope | Skipped for Phase 3. Municipality name shown in list highlight only. |

---

## Verification (end-to-end)

1. Page load → 2D overview with all 26 municipality outlines; no pan/zoom possible
2. Click a municipality on map OR select from list → smooth flyTo + pitch=45 + housing extrusions appear
3. Idag/2060 toggle changes visible layers
4. Back button → returns to 2D overview, clears housing layers
5. `npm run build` — no TypeScript errors, no ESLint violations
6. `npm run format:check` passes before each commit

---

## File change summary

| File | Action |
|------|--------|
| `/public/data/municipalities.geojson` | New (external download) |
| `/src/lib/mapConfig.ts` | Edit — add overview/detail camera constants |
| `/src/components/map/MapCanvas.tsx` | Edit — overview defaults, onMapReady prop |
| `/src/lib/housingLayers.ts` | Edit — add addLayersForMunicipality, removeHousingLayers |
| `/src/components/sections/MapSection.tsx` | Rewrite — overview + selection + detail orchestration |
| `/src/components/map/MunicipalityList.tsx` | New |
| `/src/components/map/LayerToggle.tsx` | New |
| `/src/components/map/BackButton.tsx` | New |
| `project_plan.md` | Edit — merge F4.1/F4.2 into Phase 3; update F3 items |
