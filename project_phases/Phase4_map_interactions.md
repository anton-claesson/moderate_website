# Phase 4 — Map Interactions: Implementation Plan

> Phase 4 — Map Interactions. Feature F4.3 (F4.1, F4.2, F4.4 merged into Phase 3). **Complete — merged in #8.**
> Branch: `feature/phase4-map-ui` (deleted after merge).

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

### Desktop Layout (CSS Grid)

The map section uses a CSS grid on `md:` breakpoints: map takes `1fr` (all remaining width) and the card takes a fixed `288px` right column. This is more reliable than Mapbox camera padding, which was constrained by `maxBounds` and produced no visible offset.

```
<div class="md:grid md:grid-cols-[1fr_288px] h-[80vh]">
  <div>MapCanvas (fills cell)</div>
  <div>MunicipalityCard (288px column)</div>
</div>
```

`maxBounds` is removed from `MapCanvas` — pan/zoom is already disabled programmatically, so the constraint is not needed and prevented correct camera positioning.

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
| `src/lib/mapConfig.ts` | Add `MUNICIPALITY_OUTLINE_HOVER_LAYER`, `MUNICIPALITY_DIM_LAYER` constants |
| `src/data/housingStats.ts` | **New** — static stats lookup (26 entries) |
| `src/components/map/MapCanvas.tsx` | Remove `maxBounds` (pan disabled programmatically; bounds fought camera) |
| `src/components/map/MunicipalityList.tsx` | Hover props; `scrollIntoView` on hover change; accent/semibold hover style |
| `src/components/map/LayerToggle.tsx` | `flex-1` on each button (fills width, eliminates empty third-slot visual) |
| `src/components/map/StatsPanel.tsx` | **New** — renders 4 stat rows from `MunicipalityStats` |
| `src/components/map/MunicipalityCard.tsx` | **New** — card container, switches overview ↔ detail; opaque background |
| `src/components/sections/MapSection.tsx` | CSS grid layout; new outline-hover + dim layers; tighter fitBounds; `setHighlight()` helper |

---

## Commit Sequence (as shipped)

1. `feat(layout): restructure MapSection for card-based UI, desktop/mobile split`
2. `feat(data): static housingStats lookup and StatsPanel component, resolving D5`
3. `docs: add Phase 4 implementation plan, update project_plan.md`
4. `fix(map): six UI refinements — layout, outlines, hover, card, toggle, zoom`

---

## Refinements Applied (post initial implementation)

After first-pass review the following changes were made in commit 4:

| # | Issue | Fix |
|---|-------|-----|
| 1 | Camera padding didn't visibly offset the region | Replaced with CSS grid layout: map `1fr`, card `288px` column. Removed `DESKTOP_MAP_PADDING` / `MOBILE_MAP_PADDING` / `DESKTOP_BREAKPOINT`. Removed `maxBounds` from `MapCanvas`. |
| 2 | Outlines too thin and no hover colour change | Base outline: 2px / 0.8 opacity. New `municipalities-outline-hover` line layer (white, 2.5px) filtered to hovered/selected name. |
| 3 | Hover highlight in list not prominent; no auto-scroll | `scrollIntoView({block:'nearest'})` on `hoveredMunicipality` change. Hover style: `bg-accent/20 text-accent font-semibold`. |
| 4 | Card semi-transparent, hard to read | `bg-header-bg/90 backdrop-blur-sm` → `bg-header-bg`. |
| 5 | Toggle appeared to have three options | Each button: `flex-1` (was `min-w-[80px]`). The dead space at the end of the container looked like a third slot. |
| 6 | Too much surrounding context in detail view | `fitBounds` padding reduced 60 → 20. Selected municipality keeps its fill+outline highlight. New `municipalities-dim` fill layer (black, 0.4 opacity) dims all other polygons; hidden in overview. |

---

## Verification Checklist

- [ ] Desktop (≥768px): map takes left portion, card column on right — region fills the map canvas
- [ ] Desktop: hovering list name highlights polygon (green fill + white outline) and scrolls list; hovering polygon highlights list name
- [ ] Desktop: clicking municipality → card shows stats, surroundings dimmed, municipality tightly fitted
- [ ] Desktop: Idag/2060 toggle fills full card width with exactly 2 buttons
- [ ] Desktop: back button restores overview, dim cleared, list reappears
- [ ] Mobile (<768px): card is top 30vh, map is bottom 70vh; no hover effects
- [ ] Mobile: select/back/toggle all functional
- [ ] Stats values match raw CSV (spot-check ≥3 municipalities)
- [ ] `npm run lint && npm run format:check && npm run build` passes
