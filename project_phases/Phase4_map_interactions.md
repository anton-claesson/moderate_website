# Phase 4 — Map Interactions: Implementation Plan

> Phase 4 — Map Interactions. Feature F4.3 (F4.1, F4.2, F4.4 merged into Phase 3).
> Branch: `feature/phase4-map-ui`.

---

## Context

Phase 3 delivered full housing data visualization with functional but visually scattered controls (list, toggle, back button floating independently over the map). Phase 4 resolves three problems:

1. **Layout fragmentation** — controls need a unified container rather than scattered overlays.
2. **Screen real estate** — on desktop, the Stockholm Region only occupies the left ~half of the map canvas; the right side (ocean) is wasted space.
3. **Missing info overlay** — Decision D5 (municipality stats) was deferred and is now resolved: show municipality name, current housing counts, 2060 projection, and growth %.

---

## Decisions Resolved This Phase

| ID | Decision | Resolution |
|----|----------|-----------|
| D5 | Info overlay scope | Municipality name + småhus count + current flerbostadshus + 2060 flerbostadshus + total growth %. Static data from CSV. |

Desktop layout: floating card (semi-transparent, rounded, shadow) over ocean area on right.
Mobile layout: card stacked above map (~30vh / 70vh split).
Container style: floating card (not sidebar — map canvas stays full-width on desktop).

---

## UX Flow

### Desktop — Overview Mode
- Map canvas fills 100% width; region appears left-of-center due to Mapbox camera padding
- Floating card on the right shows municipality list ("Kommuner" heading + scrollable list of 26 names)
- Hovering a list name highlights the corresponding polygon on the map
- Hovering a polygon on the map highlights the corresponding name in the list

### Desktop — Detail Mode (municipality selected)
- Card switches to detail view:
  - Back button ("← Alla kommuner") at top
  - Municipality name as large heading
  - Stats panel: småhus, lägenheter idag, lägenheter 2060, tillväxt %
  - Idag / 2060 layer toggle at bottom
- Map pans to municipality bounds at pitch=45°

### Mobile — Overview Mode
- Card (30vh) sits above the map (70vh) in a flex-col layout
- Municipality list fills the card (scrollable)
- No hover effects (touch device)

### Mobile — Detail Mode
- Card shows same detail view as desktop (back + stats + toggle)

---

## Architecture

### Layout

```
MapSection
├── [mobile only] MunicipalityCard (h-[30vh], full width)
└── div.relative.h-[70vh].md:h-[80vh]
    ├── MapCanvas (fills container)
    └── [desktop only] div.absolute.right-6 (vertically centered)
        └── MunicipalityCard (w-[280px])
```

### Component Hierarchy

```
MapSection (orchestrator)
├── state: selected, view, hoveredMunicipality, housingReady
├── MapCanvas — onMapReady, externalHover, onHoverMunicipality
└── MunicipalityCard (new)
    ├── [overview] MunicipalityList — hoveredMunicipality, onHoverMunicipality
    └── [detail] BackButton + StatsPanel (new) + LayerToggle
```

### Hover Sync (Bidirectional)

State lifted to `MapSection`:
- `hoveredMunicipality: string | null`
- Map hover → `onHoverMunicipality(name)` callback → `setHoveredMunicipality` → list highlights row
- List hover → `onHoverMunicipality(name)` callback → `mapRef.current.setFilter(HOVER_LAYER, ...)` → polygon highlights

`MapCanvas` gains:
- `externalHover: string | null` — `useEffect` triggers `setFilter` when driven by list
- `onHoverMunicipality: (name: string | null) => void` — fires on `mousemove`/`mouseleave`

`MunicipalityList` gains:
- `hoveredMunicipality?: string | null` — highlights matching row
- `onHoverMunicipality?: (name: string | null) => void` — fires on `mouseenter`/`mouseleave` (skipped on mobile)
- `isMobile?: boolean` — suppresses hover handlers

### Map Padding (Desktop Offset)

Mapbox camera padding shifts the optical center without changing the canvas dimensions. Applied once on map load, updated on viewport resize.

```ts
// mapConfig.ts
export const DESKTOP_MAP_PADDING = { top: 0, bottom: 0, left: 0, right: 320 };
export const MOBILE_MAP_PADDING  = { top: 0, bottom: 0, left: 0, right: 0 };
export const DESKTOP_BREAKPOINT  = 768;
```

```ts
// In handleMapReady:
const isDesktop = () => window.innerWidth >= DESKTOP_BREAKPOINT;
const updatePadding = () => map.setPadding(isDesktop() ? DESKTOP_MAP_PADDING : MOBILE_MAP_PADDING);
updatePadding();
window.addEventListener('resize', updatePadding);
// cleanup via map 'remove' event or component unmount
```

All subsequent `fitBounds` calls automatically respect the padding — no changes needed to existing camera calls.

---

## Data: Housing Stats Lookup

Pre-computed static lookup from `/public/bostads_data.csv`. Not fetched at runtime.

**New file:** `src/data/housingStats.ts`

```ts
export interface MunicipalityStats {
  name: string;
  smahusCurrent: number;    // Antal småhus
  flerboCurrent: number;    // Antal flerbostadshus
  flerbo2060: number;       // Antal flerbostadshus 2060 (hög)
  growthPct: number;        // Tillskott 2060 (hög, %) — total housing growth
}

export const HOUSING_STATS: Record<string, MunicipalityStats> = { /* 26 entries */ };
```

Display format: numbers with `toLocaleString('sv-SE')` (space thousands separator), growth as `+X.X%`.

---

## New & Modified Files

| File | Change |
|------|--------|
| `src/lib/mapConfig.ts` | Add `DESKTOP_MAP_PADDING`, `MOBILE_MAP_PADDING`, `DESKTOP_BREAKPOINT` |
| `src/data/housingStats.ts` | **New** — static stats lookup (26 entries) |
| `src/components/map/MapCanvas.tsx` | Add `externalHover` + `onHoverMunicipality` props; apply padding via `handleMapReady` |
| `src/components/map/MunicipalityList.tsx` | Add `hoveredMunicipality`, `onHoverMunicipality`, `isMobile` props; remove absolute positioning |
| `src/components/map/LayerToggle.tsx` | Remove absolute positioning (now inside card) |
| `src/components/map/BackButton.tsx` | Remove absolute positioning (now inside card) |
| `src/components/map/StatsPanel.tsx` | **New** — renders 4 stat rows from `MunicipalityStats` |
| `src/components/map/MunicipalityCard.tsx` | **New** — card container, switches overview ↔ detail |
| `src/components/sections/MapSection.tsx` | Layout restructure; lift hover state; wire padding; remove old overlay divs |

---

## Commit Sequence

1. `feat(layout): restructure MapSection for card-based UI, desktop/mobile split`
2. `feat(map): apply Mapbox camera padding for desktop region offset`
3. `feat(map): bidirectional hover sync between MunicipalityList and map polygons`
4. `feat(map): MunicipalityCard component — overview and detail states`
5. `feat(data): static housingStats lookup resolving D5`
6. `feat(map): StatsPanel component displaying municipality housing data`
7. `test: unit tests for housingStats and StatsPanel`

---

## Verification Checklist

- [ ] Desktop (≥768px): region appears left-of-center; card floats on right over ocean
- [ ] Desktop: hovering list name highlights polygon; hovering polygon highlights list name
- [ ] Desktop: clicking municipality switches card to detail view with correct stats
- [ ] Desktop: Idag/2060 toggle shows/hides amber layer
- [ ] Desktop: back button restores overview, list reappears, map returns to 2D
- [ ] Mobile (<768px): card is top 30vh, map is bottom 70vh; no hover effects
- [ ] Mobile: select/back/toggle all functional
- [ ] Mobile centering unaffected by desktop padding (padding = 0 on mobile)
- [ ] Stats values match raw CSV (spot-check ≥3 municipalities)
- [ ] `npm run lint && npm run format:check && npm run build` passes
