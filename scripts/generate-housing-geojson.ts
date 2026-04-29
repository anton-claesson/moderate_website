import * as fs from 'fs';
import * as path from 'path';
import { readFileSync } from 'fs';
import { SMAHUS_PER_REPRESENTATIVE, FLERBOSTADSHUS_PER_REPRESENTATIVE } from '../src/lib/mapConfig';
import type { HousingCollection, HousingUnitProperties } from '../src/types/housing';
import type { Feature, Polygon, Position } from 'geojson';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILL_FACTOR = 0.7; // footprint occupies this fraction of the grid cell
const JITTER = 0; // ±10% position nudge within the grid cell
const TOTAL_COVERAGE = 0.5; // fraction of polygon area allocated to buildings combined

// Flerbo buildings represent 10× more dwellings per unit than smahus,
// so they get 10× more area → √10 ≈ 3.16× larger linear footprint.
const FLERBO_WEIGHT = FLERBOSTADSHUS_PER_REPRESENTATIVE / SMAHUS_PER_REPRESENTATIVE;

// At 59°N: 1° longitude ≈ 57 300 m, 1° latitude ≈ 111 000 m → geometric mean ≈ 84 150 m/°
const AVG_M_PER_DEG = 84150;

// Fixed height-to-footprint ratios — applied to per-municipality halfSize.
// Height is always derived from the (clamped) footprint, so proportions stay constant.
const SMAHUS_HEIGHT_RATIO = 1;
const FLERBO_HEIGHT_RATIO = 3.5;
const FLERBO_NEW_HEIGHT_RATIO = 4.2;

// Per-municipality halfSize bounds — only the footprint is clamped; height follows proportionally.
const SMAHUS_HALF_SIZE_MIN = 0.0006; // ~25 m high (dense urban)
const SMAHUS_HALF_SIZE_MAX = 0.0015; // ~101 m high (sparse rural)
const FLERBO_HALF_SIZE_MIN = 0.001; // ~236 m high
const FLERBO_HALF_SIZE_MAX = 0.004; // ~883 m high (sparse large municipality)

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function seededFloat(seed: number): number {
  return ((seed * 2654435761 + 1013904223) >>> 0) / 4294967296;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

// ─── Geometry ─────────────────────────────────────────────────────────────────

function pointInRing(lng: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  const n = ring.length - 1;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = ring[i] as [number, number];
    const [xj, yj] = ring[j] as [number, number];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

type BBox = { minLng: number; maxLng: number; minLat: number; maxLat: number };

function computeBBox(ring: Position[]): BBox {
  let minLng = Infinity,
    maxLng = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;
  for (const coord of ring) {
    const [lng, lat] = coord as [number, number];
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLng, maxLng, minLat, maxLat };
}

// ─── Shape builders ───────────────────────────────────────────────────────────

function rotatePoint(dx: number, dy: number, theta: number): [number, number] {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [dx * c - dy * s, dx * s + dy * c];
}

function buildFootprintRing(
  centerLng: number,
  centerLat: number,
  halfSize: number,
  shapeType: 'square' | 'wide',
  rotIdx: number,
): Position[] {
  const theta = (rotIdx % 4) * (Math.PI / 2);
  const s = halfSize;

  const offsets: [number, number][] =
    shapeType === 'wide'
      ? [
          [-1, -0.4],
          [1, -0.4],
          [1, 0.4],
          [-1, 0.4],
        ]
      : [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ];

  const ring: Position[] = offsets.map(([dx, dy]) => {
    const [rdx, rdy] = rotatePoint(dx, dy, theta);
    return [centerLng + rdx * s, centerLat + rdy * s];
  });
  ring.push(ring[0]!);
  return ring;
}

// ─── Grid placement ───────────────────────────────────────────────────────────

// Returns cell centers inside the polygon (up to count), seeded-shuffled for spatial distribution.
function generateGridPositions(
  ring: Position[],
  bbox: BBox,
  count: number,
  cellSize: number,
  seed: number,
  buffer: number,
): [number, number][] {
  const candidates: [number, number][] = [];
  for (let lat = bbox.minLat; lat < bbox.maxLat; lat += cellSize) {
    for (let lng = bbox.minLng; lng < bbox.maxLng; lng += cellSize) {
      const cx = lng + cellSize / 2;
      const cy = lat + cellSize / 2;
      if (
        pointInRing(cx, cy, ring) &&
        pointInRing(cx + buffer, cy, ring) &&
        pointInRing(cx - buffer, cy, ring) &&
        pointInRing(cx, cy + buffer, ring) &&
        pointInRing(cx, cy - buffer, ring)
      )
        candidates.push([cx, cy]);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(seededFloat((seed + i * 7919) >>> 0) * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }
  return candidates.slice(0, count);
}

// ─── Feature factory ──────────────────────────────────────────────────────────

function makeFeature(
  lng: number,
  lat: number,
  halfSize: number,
  shapeType: 'square' | 'wide',
  rotIdx: number,
  props: HousingUnitProperties,
): Feature<Polygon, HousingUnitProperties> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [buildFootprintRing(lng, lat, halfSize, shapeType, rotIdx)],
    },
    properties: props,
  };
}

// ─── Municipality polygon loader ──────────────────────────────────────────────

type PolyData = { ring: Position[]; bbox: BBox };

function loadMunicipalityPolygons(filePath: string): Map<string, PolyData> {
  const raw = readFileSync(filePath, 'utf-8');
  const geojson = JSON.parse(raw) as GeoJSON.FeatureCollection;
  const map = new Map<string, PolyData>();
  for (const feature of geojson.features) {
    if (feature.geometry.type !== 'Polygon') continue;
    const name = feature.properties?.['kom_namn'] as string;
    if (!name) continue;
    const ring = (feature.geometry as GeoJSON.Polygon).coordinates[0] as Position[];
    map.set(name, { ring, bbox: computeBBox(ring) });
  }
  return map;
}

// ─── Development zone loader ──────────────────────────────────────────────────

// Flattens Polygon and MultiPolygon zone features into a list of exterior rings.
function loadZonePolygons(filePath: string): PolyData[] {
  const raw = readFileSync(filePath, 'utf-8');
  const geojson = JSON.parse(raw) as GeoJSON.FeatureCollection;
  const result: PolyData[] = [];
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    const rings: Position[][] =
      geom.type === 'Polygon'
        ? [(geom as GeoJSON.Polygon).coordinates[0] as Position[]]
        : geom.type === 'MultiPolygon'
          ? (geom as GeoJSON.MultiPolygon).coordinates.map((p) => p[0] as Position[])
          : [];
    for (const ring of rings) {
      result.push({ ring, bbox: computeBBox(ring) });
    }
  }
  return result;
}

// Returns shuffled grid positions that fall inside a development zone AND inside the municipality.
// Uses the minimum possible cell size so small zones still yield candidates regardless of the
// per-municipality flerCellSize. Zones with no bbox overlap are skipped cheaply.
// The merged list is shuffled with a stable seed; the caller's greedy exclusion pass enforces
// correct building-to-building spacing.
const ZONE_CELL_SIZE = (FLERBO_HALF_SIZE_MIN * 2) / FILL_FACTOR;

function getZoneCandidates(
  muniRing: Position[],
  muniBBox: BBox,
  zones: PolyData[],
  seed: number,
): [number, number][] {
  const all: [number, number][] = [];
  for (let zi = 0; zi < zones.length; zi++) {
    const z = zones[zi]!;
    if (
      z.bbox.maxLng < muniBBox.minLng ||
      z.bbox.minLng > muniBBox.maxLng ||
      z.bbox.maxLat < muniBBox.minLat ||
      z.bbox.minLat > muniBBox.maxLat
    )
      continue;
    // buffer=0: only check the center point — the zone boundary just needs to contain the building
    // center, not a margin. Municipality boundary clipping is handled by the filter below.
    const candidates = generateGridPositions(
      z.ring,
      z.bbox,
      Infinity,
      ZONE_CELL_SIZE,
      (seed + zi * 31) >>> 0,
      0,
    ).filter(([cx, cy]) => pointInRing(cx, cy, muniRing));
    all.push(...candidates);
  }
  // Shuffle the merged list with a stable municipality-scoped seed.
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(seededFloat((seed + i * 9973) >>> 0) * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  return all;
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function parseCsv(filePath: string): Record<string, string>[] {
  const raw = readFileSync(filePath, 'utf-8').replace(/^﻿/, '');
  const [headerLine, ...rows] = raw.trim().split('\n');
  const headers = (headerLine ?? '').split(';');
  return rows.map((row) => {
    const cols = row.split(';');
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (cols[i] ?? '').trim()]));
  });
}

function parseNum(val: string | undefined): number {
  if (!val) return 0;
  return parseInt(val.replace(/\s/g, ''), 10) || 0;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const csvPath = path.resolve(__dirname, '../public/bostads_data.csv');
const outDir = path.resolve(__dirname, '../public/data');
const muniPath = path.resolve(__dirname, '../public/data/municipalities.geojson');
const zonePath = path.resolve(__dirname, '../public/Bebyggelsestruktur_NY_granskning.geojson');

fs.mkdirSync(outDir, { recursive: true });

const rows = parseCsv(csvPath);
const municipalityPolygons = loadMunicipalityPolygons(muniPath);
const zones = loadZonePolygons(zonePath);

const smahusFeatures: Feature<Polygon, HousingUnitProperties>[] = [];
const flerbostadshusFeatures: Feature<Polygon, HousingUnitProperties>[] = [];
const flerbostadshusNewFeatures: Feature<Polygon, HousingUnitProperties>[] = [];

let warnings = 0;

for (const row of rows) {
  const municipality = (row['Kommun'] ?? '').trim();
  if (!municipality) continue;

  const polyData = municipalityPolygons.get(municipality);
  if (!polyData) {
    console.warn(`⚠  No polygon for "${municipality}" — skipping`);
    warnings++;
    continue;
  }

  const { ring, bbox } = polyData;
  const muniSeed = hashStr(municipality);

  const nSmahus = Math.floor(parseNum(row['Antal småhus']) / SMAHUS_PER_REPRESENTATIVE);
  const nFler = Math.floor(
    parseNum(row['Antal flerbostadshus']) / FLERBOSTADSHUS_PER_REPRESENTATIVE,
  );
  const nFlerNew = Math.max(
    0,
    Math.floor(
      (parseNum(row['Antal flerbostadshus 2060 (hög)']) - parseNum(row['Antal flerbostadshus'])) /
        FLERBOSTADSHUS_PER_REPRESENTATIVE,
    ),
  );

  // ── Per-municipality building sizes ──────────────────────────────────────────
  // Polygon area via shoelace formula (degree² units)
  let polyArea = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i] as [number, number];
    const [x2, y2] = ring[i + 1] as [number, number];
    polyArea += x1 * y2 - x2 * y1;
  }
  polyArea = Math.abs(polyArea / 2);
  if (polyArea === 0) polyArea = (bbox.maxLng - bbox.minLng) * (bbox.maxLat - bbox.minLat);

  // Weighted area per unit — flerbo gets FLERBO_WEIGHT times the area of a smahus slot
  const totalFler = nFler + nFlerNew;
  const weightedTotal = nSmahus + totalFler * FLERBO_WEIGHT;
  const areaPerUnit = weightedTotal > 0 ? (polyArea * TOTAL_COVERAGE) / weightedTotal : 0;

  // Clamp only the footprint halfSize; height is always derived proportionally from it.
  // This keeps the height/footprint aspect ratio constant across all municipalities.
  const rawFlerHalfSize = (Math.sqrt(areaPerUnit * FLERBO_WEIGHT) * FILL_FACTOR) / 2;
  const flerHalfSize = Math.max(
    FLERBO_HALF_SIZE_MIN,
    Math.min(rawFlerHalfSize, FLERBO_HALF_SIZE_MAX),
  );
  const flerCellSize = (flerHalfSize * 2) / FILL_FACTOR;
  const flerHeight = Math.round(flerHalfSize * AVG_M_PER_DEG * FLERBO_HEIGHT_RATIO);
  const flerNewHeight = Math.round(flerHalfSize * AVG_M_PER_DEG * FLERBO_NEW_HEIGHT_RATIO);

  const rawSmaHalfSize = (Math.sqrt(areaPerUnit) * FILL_FACTOR) / 2;
  const smaHalfSize = Math.max(
    SMAHUS_HALF_SIZE_MIN,
    Math.min(rawSmaHalfSize, SMAHUS_HALF_SIZE_MAX),
  );
  const smaCellSize = (smaHalfSize * 2) / FILL_FACTOR;
  const smaHeight = Math.round(smaHalfSize * AVG_M_PER_DEG * SMAHUS_HEIGHT_RATIO);

  // Exclusion radii for overlap checks
  const flerSmaExclSq = (flerHalfSize + smaHalfSize * Math.SQRT2) ** 2; // flerbo vs smahus
  const flerFlerExclSq = flerCellSize ** 2; // flerbo vs flerbo: one full grid cell

  // ── Phase 1: Blue flerbostadshus (current) — random across municipality ──────
  const placedBluePositions: [number, number][] = [];

  if (nFler > 0) {
    const blueGrid = generateGridPositions(
      ring,
      bbox,
      nFler,
      flerCellSize,
      (muniSeed + 1000) >>> 0,
      flerHalfSize * Math.SQRT2,
    );

    for (let i = 0; i < blueGrid.length; i++) {
      const [cx, cy] = blueGrid[i]!;
      placedBluePositions.push([cx, cy]);

      const jx = (seededFloat((muniSeed + i * 13 + 10) >>> 0) - 0.5) * JITTER * flerCellSize;
      const jy = (seededFloat((muniSeed + i * 17 + 11) >>> 0) - 0.5) * JITTER * flerCellSize;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const lng = pointInRing(jLng, jLat, ring) ? jLng : cx;
      const lat = pointInRing(jLng, jLat, ring) ? jLat : cy;

      const rotIdx = ((((muniSeed + i * 19 + 400) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      flerbostadshusFeatures.push(
        makeFeature(lng, lat, flerHalfSize, 'wide', rotIdx, {
          id: `fb-${municipality}-${i}`,
          municipality,
          type: 'flerbostadshus',
          view: 'current',
          height: flerHeight,
        }),
      );
    }
  }

  // ── Phase 2: Småhus — random across municipality, excluding blue flerbo ───────
  const placedSmaPositions: [number, number][] = [];

  if (nSmahus > 0) {
    const smaGrid = generateGridPositions(
      ring,
      bbox,
      Infinity,
      smaCellSize,
      (muniSeed + 2000) >>> 0,
      smaHalfSize * Math.SQRT2,
    )
      .filter(([cx, cy]) => {
        for (const [fx, fy] of placedBluePositions) {
          if ((cx - fx) ** 2 + (cy - fy) ** 2 < flerSmaExclSq) return false;
        }
        return true;
      })
      .slice(0, nSmahus);

    for (let i = 0; i < smaGrid.length; i++) {
      const [cx, cy] = smaGrid[i]!;
      placedSmaPositions.push([cx, cy]);

      const jx = (seededFloat((muniSeed + i * 13 + 500) >>> 0) - 0.5) * JITTER * smaCellSize;
      const jy = (seededFloat((muniSeed + i * 17 + 501) >>> 0) - 0.5) * JITTER * smaCellSize;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const lng = pointInRing(jLng, jLat, ring) ? jLng : cx;
      const lat = pointInRing(jLng, jLat, ring) ? jLat : cy;

      const rotIdx = ((((muniSeed + i * 19 + 800) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      smahusFeatures.push(
        makeFeature(lng, lat, smaHalfSize, 'square', rotIdx, {
          id: `sm-${municipality}-${i}`,
          municipality,
          type: 'smahus',
          view: 'both',
          height: smaHeight,
        }),
      );
    }
  }

  // ── Phase 3: Red flerbostadshus (new 2060) — zone-biased, no overlap ─────────
  let fromZones = 0;
  let fromFallback = 0;
  if (nFlerNew > 0) {
    // Primary candidates from development zones, clipped to municipality boundary.
    // Greedy selection ensures spacing is maintained between all building types.
    const zoneCandidates = getZoneCandidates(ring, bbox, zones, (muniSeed + 3000) >>> 0);

    const selectedRed: [number, number][] = [];

    const tryPlace = (cx: number, cy: number): boolean => {
      for (const [fx, fy] of placedBluePositions) {
        if ((cx - fx) ** 2 + (cy - fy) ** 2 < flerFlerExclSq) return false;
      }
      for (const [sx, sy] of placedSmaPositions) {
        if ((cx - sx) ** 2 + (cy - sy) ** 2 < flerSmaExclSq) return false;
      }
      for (const [rx, ry] of selectedRed) {
        if ((cx - rx) ** 2 + (cy - ry) ** 2 < flerFlerExclSq) return false;
      }
      return true;
    };

    for (const [cx, cy] of zoneCandidates) {
      if (tryPlace(cx, cy)) {
        selectedRed.push([cx, cy]);
        if (selectedRed.length >= nFlerNew) break;
      }
    }

    fromZones = selectedRed.length;

    // Fallback: supplement from municipality-wide grid if zones didn't supply enough.
    if (selectedRed.length < nFlerNew) {
      const fallback = generateGridPositions(
        ring,
        bbox,
        Infinity,
        flerCellSize,
        (muniSeed + 4000) >>> 0,
        flerHalfSize * Math.SQRT2,
      );
      for (const [cx, cy] of fallback) {
        if (selectedRed.length >= nFlerNew) break;
        if (tryPlace(cx, cy)) {
          selectedRed.push([cx, cy]);
          fromFallback += 1;
        }
      }
    }

    for (let i = 0; i < selectedRed.length; i++) {
      const [cx, cy] = selectedRed[i]!;

      const jx = (seededFloat((muniSeed + i * 13 + 10) >>> 0) - 0.5) * JITTER * flerCellSize;
      const jy = (seededFloat((muniSeed + i * 17 + 11) >>> 0) - 0.5) * JITTER * flerCellSize;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const lng = pointInRing(jLng, jLat, ring) ? jLng : cx;
      const lat = pointInRing(jLng, jLat, ring) ? jLat : cy;

      const rotIdx = ((((muniSeed + i * 19 + 400) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      flerbostadshusNewFeatures.push(
        makeFeature(lng, lat, flerHalfSize, 'wide', rotIdx, {
          id: `fb-new-${municipality}-${i}`,
          municipality,
          type: 'flerbostadshus',
          view: 'planned',
          height: flerNewHeight,
        }),
      );
    }
  }

  const redInfo =
    nFlerNew > 0 ? ` [${fromZones ?? 0} zone / ${fromFallback ?? 0} fallback red]` : '';
  console.log(
    `  ${municipality}: ${nSmahus} småhus, ${nFler} apt (idag), +${nFlerNew} nya apt (2060)${redInfo}`,
  );
}

function writeCollection(filePath: string, features: Feature<Polygon, HousingUnitProperties>[]) {
  const collection: HousingCollection = { type: 'FeatureCollection', features };
  fs.writeFileSync(filePath, JSON.stringify(collection));
  console.log(`✓ Wrote ${features.length} features → ${path.relative(process.cwd(), filePath)}`);
}

writeCollection(path.join(outDir, 'housing-smahus.geojson'), smahusFeatures);
writeCollection(path.join(outDir, 'housing-flerbostadshus.geojson'), flerbostadshusFeatures);
writeCollection(path.join(outDir, 'housing-flerbostadshus-new.geojson'), flerbostadshusNewFeatures);

if (warnings > 0) {
  console.warn(`\n${warnings} municipalities had no data and were skipped.`);
}
