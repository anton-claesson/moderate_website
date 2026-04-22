import * as fs from 'fs';
import * as path from 'path';
import { readFileSync } from 'fs';
import { SMAHUS_PER_REPRESENTATIVE, FLERBOSTADSHUS_PER_REPRESENTATIVE } from '../src/lib/mapConfig';
import type { HousingCollection, HousingUnitProperties } from '../src/types/housing';
import type { Feature, Polygon, Position } from 'geojson';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_COVERAGE = 0.4; // fraction of polygon area covered by all buildings combined
const FILL_FACTOR = 0.7; // footprint occupies 80% of the grid cell
const JITTER = 0.1; // ±15% of cellSize displacement; with FILL_FACTOR=0.8 keeps edge gap ≥ 5%

// Flerbo units represent 10× more actual dwellings than smahus units, so each
// flerbo building gets 10× more area (√10 ≈ 3.16× larger footprint).
const FLERBO_WEIGHT = FLERBOSTADSHUS_PER_REPRESENTATIVE / SMAHUS_PER_REPRESENTATIVE;

// Height = footprint_halfsize_degrees × AVG_M_PER_DEG × ratio.
// Gives natural proportions for typical municipalities; clamps handle sparse outliers.
const AVG_M_PER_DEG = 84150; // average of longitude (~57 300 m/°) and latitude (~111 000 m/°) at 59°N
const SMAHUS_HEIGHT_RATIO = 1;
const FLERBO_HEIGHT_RATIO = 2.5;
const FLERBO_NEW_HEIGHT_RATIO = 3.0; // ~1.2× taller for new 2060 blocks
const HEIGHT_VARIATION = 0.2; // per-building multiplier drawn from [0.9, 1.1]
// Hard clamps prevent extreme heights in large sparse municipalities
const SMAHUS_HEIGHT_MIN = 20;
const SMAHUS_HEIGHT_MAX = 60;
const FLERBO_HEIGHT_MIN = 150;
const FLERBO_HEIGHT_MAX = 600;
const FLERBO_NEW_HEIGHT_MIN = 180;
const FLERBO_NEW_HEIGHT_MAX = 720;

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
  shapeType: 'square' | 'L' | 'wide' | 'T',
  rotIdx: number,
): Position[] {
  const theta = (rotIdx % 4) * (Math.PI / 2);
  const s = halfSize;

  let offsets: [number, number][];
  switch (shapeType) {
    case 'L':
      offsets = [
        [-1, -1],
        [1, -1],
        [1, 0],
        [0, 0],
        [0, 1],
        [-1, 1],
      ];
      break;
    case 'wide':
      offsets = [
        [-1, -0.4],
        [1, -0.4],
        [1, 0.4],
        [-1, 0.4],
      ];
      break;
    case 'T':
      offsets = [
        [-1, 1],
        [1, 1],
        [1, 0],
        [1 / 3, 0],
        [1 / 3, -1],
        [-1 / 3, -1],
        [-1 / 3, 0],
        [-1, 0],
      ];
      break;
    default: // square
      offsets = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
  }

  const ring: Position[] = offsets.map(([dx, dy]) => {
    const [rdx, rdy] = rotatePoint(dx, dy, theta);
    return [centerLng + rdx * s, centerLat + rdy * s];
  });
  ring.push(ring[0]!);
  return ring;
}

// Småhus: low-rise shapes only
function pickSmahusShape(seed: number): 'square' | 'wide' {
  return seededFloat(seed) < 0.7 ? 'square' : 'wide';
}

// Flerbostadshus: more complex footprints to read as city blocks
function pickFlerboShape(seed: number): 'square' | 'L' | 'T' {
  const v = seededFloat(seed);
  if (v < 0.4) return 'square';
  if (v < 0.7) return 'L';
  return 'T';
}

// ─── Grid placement ───────────────────────────────────────────────────────────

// Returns up to `count` cell centers inside the polygon, seeded-shuffled so
// the result is deterministic but spatially distributed (not top-to-bottom).
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
  // Seeded Fisher-Yates shuffle for deterministic but non-sequential ordering
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
  shapeType: 'square' | 'L' | 'wide' | 'T',
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

  // Polygon area via shoelace formula (degree² units, consistent with cellSize²)
  let polyArea = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i] as [number, number];
    const [x2, y2] = ring[i + 1] as [number, number];
    polyArea += x1 * y2 - x2 * y1;
  }
  polyArea = Math.abs(polyArea / 2);
  if (polyArea === 0) polyArea = (bbox.maxLng - bbox.minLng) * (bbox.maxLat - bbox.minLat);

  // Weighted total: flerbo units get FLERBO_WEIGHT times more area than smahus units,
  // reflecting the higher number of actual dwellings each representative building covers.
  const weightedTotal = nSmahus + totalFler * FLERBO_WEIGHT;
  const areaPerUnit = weightedTotal > 0 ? (polyArea * TOTAL_COVERAGE) / weightedTotal : 0;

  const smaCellSize = Math.max(0.0001, Math.min(Math.sqrt(areaPerUnit), 0.02));
  const flerboCellSize = Math.max(0.0002, Math.min(Math.sqrt(areaPerUnit * FLERBO_WEIGHT), 0.06));
  const smaHalfSize = (smaCellSize * FILL_FACTOR) / 2;
  const flerHalfSize = (flerboCellSize * FILL_FACTOR) / 2;

  // Heights scale with footprint size, giving automatic visual proportions per municipality
  const smaBaseHeight = smaHalfSize * AVG_M_PER_DEG * SMAHUS_HEIGHT_RATIO;
  const flerBaseHeight = flerHalfSize * AVG_M_PER_DEG * FLERBO_HEIGHT_RATIO;
  const flerNewBaseHeight = flerHalfSize * AVG_M_PER_DEG * FLERBO_NEW_HEIGHT_RATIO;

  // ── Flerbostadshus: unified pool — first nFler positions = current, rest = new 2060
  //    The shuffle distributes new apartments spatially among existing ones.
  if (totalFler > 0) {
    const flerGrid = generateGridPositions(
      ring,
      bbox,
      totalFler,
      flerboCellSize,
      (muniSeed + 1000) >>> 0,
      flerHalfSize * Math.SQRT2,
    );

    for (let i = 0; i < flerGrid.length; i++) {
      const [cx, cy] = flerGrid[i]!;
      const isNew = i >= nFler;

      const jx = (seededFloat((muniSeed + i * 13 + 10) >>> 0) - 0.5) * JITTER * flerboCellSize;
      const jy = (seededFloat((muniSeed + i * 17 + 11) >>> 0) - 0.5) * JITTER * flerboCellSize;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const inBounds = pointInRing(jLng, jLat, ring);
      const lng = inBounds ? jLng : cx;
      const lat = inBounds ? jLat : cy;

      const variation =
        1 - HEIGHT_VARIATION / 2 + seededFloat((muniSeed + i * 11 + 200) >>> 0) * HEIGHT_VARIATION;
      const baseH = isNew ? flerNewBaseHeight : flerBaseHeight;
      const minH = isNew ? FLERBO_NEW_HEIGHT_MIN : FLERBO_HEIGHT_MIN;
      const maxH = isNew ? FLERBO_NEW_HEIGHT_MAX : FLERBO_HEIGHT_MAX;
      const height = Math.max(minH, Math.min(Math.round(baseH * variation), maxH));

      const shape = pickFlerboShape((muniSeed + i * 7 + 300) >>> 0);
      const rotIdx = ((((muniSeed + i * 19 + 400) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      const props: HousingUnitProperties = {
        id: isNew ? `fb-new-${municipality}-${i}` : `fb-${municipality}-${i}`,
        municipality,
        type: 'flerbostadshus',
        view: isNew ? 'planned' : 'current',
        height,
      };

      const feature = makeFeature(lng, lat, flerHalfSize, shape, rotIdx, props);
      if (isNew) {
        flerbostadshusNewFeatures.push(feature);
      } else {
        flerbostadshusFeatures.push(feature);
      }
    }
  }

  // ── Småhus ────────────────────────────────────────────────────────────────
  if (nSmahus > 0) {
    const smaGrid = generateGridPositions(
      ring,
      bbox,
      nSmahus,
      smaCellSize,
      (muniSeed + 2000) >>> 0,
      smaHalfSize * Math.SQRT2,
    );

    for (let i = 0; i < smaGrid.length; i++) {
      const [cx, cy] = smaGrid[i]!;

      const jx = (seededFloat((muniSeed + i * 13 + 500) >>> 0) - 0.5) * JITTER * smaCellSize;
      const jy = (seededFloat((muniSeed + i * 17 + 501) >>> 0) - 0.5) * JITTER * smaCellSize;
      const jLng = cx + jx;
      const jLat = cy + jy;
      const inBounds = pointInRing(jLng, jLat, ring);
      const lng = inBounds ? jLng : cx;
      const lat = inBounds ? jLat : cy;

      const variation =
        1 - HEIGHT_VARIATION / 2 + seededFloat((muniSeed + i * 7 + 600) >>> 0) * HEIGHT_VARIATION;
      const height = Math.max(
        SMAHUS_HEIGHT_MIN,
        Math.min(Math.round(smaBaseHeight * variation), SMAHUS_HEIGHT_MAX),
      );

      const shape = pickSmahusShape((muniSeed + i * 5 + 700) >>> 0);
      const rotIdx = ((((muniSeed + i * 19 + 800) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      const props: HousingUnitProperties = {
        id: `sm-${municipality}-${i}`,
        municipality,
        type: 'smahus',
        view: 'both',
        height,
      };

      smahusFeatures.push(makeFeature(lng, lat, smaHalfSize, shape, rotIdx, props));
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
