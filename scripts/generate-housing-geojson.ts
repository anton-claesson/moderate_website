import * as fs from 'fs';
import * as path from 'path';
import { readFileSync } from 'fs';
import { SMAHUS_PER_REPRESENTATIVE, FLERBOSTADSHUS_PER_REPRESENTATIVE } from '../src/lib/mapConfig';
import type { HousingCollection, HousingUnitProperties } from '../src/types/housing';
import type { Feature, Polygon, Position } from 'geojson';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILL_FACTOR = 0.7; // footprint occupies this fraction of the grid cell
const JITTER = 0.1; // ±10% position nudge within the grid cell

// At 59°N: 1° longitude ≈ 57 300 m, 1° latitude ≈ 111 000 m → geometric mean ≈ 84 150 m/°
const AVG_M_PER_DEG = 84150;

// Fixed footprint half-sizes — all buildings of the same type are identical in shape and area.
// Each smahus represents 100 real units (suburban cluster); each flerbo represents 1 000 (city block).
const SMAHUS_HALF_SIZE = 0.0007; // ~59 m half-width at 59°N
const SMAHUS_CELL_SIZE = (SMAHUS_HALF_SIZE * 2) / FILL_FACTOR;
const SMAHUS_HEIGHT = Math.round(SMAHUS_HALF_SIZE * AVG_M_PER_DEG * 1); // height ratio 1× → ~59 m

const FLERBO_HALF_SIZE = 0.0018; // ~154 m half-width at 59°N
const FLERBO_CELL_SIZE = (FLERBO_HALF_SIZE * 2) / FILL_FACTOR;
const FLERBO_HEIGHT = Math.round(FLERBO_HALF_SIZE * AVG_M_PER_DEG * 3.5); // ratio 3.5× → ~530 m
const FLERBO_NEW_HEIGHT = Math.round(FLERBO_HALF_SIZE * AVG_M_PER_DEG * 4.2); // ratio 4.2× → ~636 m

// Minimum separation between a smahus center and any flerbo center (diagonal sum of half-extents)
const FLERBO_SMAHUS_EXCL_SQ = (FLERBO_HALF_SIZE + SMAHUS_HALF_SIZE * Math.SQRT2) ** 2;

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

fs.mkdirSync(outDir, { recursive: true });

const rows = parseCsv(csvPath);
const municipalityPolygons = loadMunicipalityPolygons(muniPath);

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
  const totalFler = nFler + nFlerNew;

  // ── Flerbostadshus: unified pool — first nFler positions = current, rest = new 2060.
  //    placedFlerPositions is recorded so smahus can exclude overlapping cells.
  const placedFlerPositions: [number, number][] = [];

  if (totalFler > 0) {
    const flerGrid = generateGridPositions(
      ring,
      bbox,
      totalFler,
      FLERBO_CELL_SIZE,
      (muniSeed + 1000) >>> 0,
      FLERBO_HALF_SIZE * Math.SQRT2,
    );

    for (let i = 0; i < flerGrid.length; i++) {
      const [cx, cy] = flerGrid[i]!;
      placedFlerPositions.push([cx, cy]);
      const isNew = i >= nFler;

      const jx = (seededFloat((muniSeed + i * 13 + 10) >>> 0) - 0.5) * JITTER * FLERBO_CELL_SIZE;
      const jy = (seededFloat((muniSeed + i * 17 + 11) >>> 0) - 0.5) * JITTER * FLERBO_CELL_SIZE;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const lng = pointInRing(jLng, jLat, ring) ? jLng : cx;
      const lat = pointInRing(jLng, jLat, ring) ? jLat : cy;

      const rotIdx = ((((muniSeed + i * 19 + 400) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      const props: HousingUnitProperties = {
        id: isNew ? `fb-new-${municipality}-${i}` : `fb-${municipality}-${i}`,
        municipality,
        type: 'flerbostadshus',
        view: isNew ? 'planned' : 'current',
        height: isNew ? FLERBO_NEW_HEIGHT : FLERBO_HEIGHT,
      };

      const feature = makeFeature(lng, lat, FLERBO_HALF_SIZE, 'wide', rotIdx, props);
      if (isNew) {
        flerbostadshusNewFeatures.push(feature);
      } else {
        flerbostadshusFeatures.push(feature);
      }
    }
  }

  // ── Småhus: generate all candidates, exclude those overlapping flerbo footprints, then slice.
  if (nSmahus > 0) {
    const smaGrid = generateGridPositions(
      ring,
      bbox,
      Infinity,
      SMAHUS_CELL_SIZE,
      (muniSeed + 2000) >>> 0,
      SMAHUS_HALF_SIZE * Math.SQRT2,
    )
      .filter(([cx, cy]) => {
        for (const [fx, fy] of placedFlerPositions) {
          if ((cx - fx) ** 2 + (cy - fy) ** 2 < FLERBO_SMAHUS_EXCL_SQ) return false;
        }
        return true;
      })
      .slice(0, nSmahus);

    for (let i = 0; i < smaGrid.length; i++) {
      const [cx, cy] = smaGrid[i]!;

      const jx = (seededFloat((muniSeed + i * 13 + 500) >>> 0) - 0.5) * JITTER * SMAHUS_CELL_SIZE;
      const jy = (seededFloat((muniSeed + i * 17 + 501) >>> 0) - 0.5) * JITTER * SMAHUS_CELL_SIZE;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const lng = pointInRing(jLng, jLat, ring) ? jLng : cx;
      const lat = pointInRing(jLng, jLat, ring) ? jLat : cy;

      const rotIdx = ((((muniSeed + i * 19 + 800) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      const props: HousingUnitProperties = {
        id: `sm-${municipality}-${i}`,
        municipality,
        type: 'smahus',
        view: 'both',
        height: SMAHUS_HEIGHT,
      };

      smahusFeatures.push(makeFeature(lng, lat, SMAHUS_HALF_SIZE, 'square', rotIdx, props));
    }
  }

  console.log(
    `  ${municipality}: ${nSmahus} småhus, ${nFler} apt (idag), +${nFlerNew} nya apt (2060)`,
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
