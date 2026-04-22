import * as fs from 'fs';
import * as path from 'path';
import { readFileSync } from 'fs';
import { MUNICIPALITY_CENTROIDS } from '../src/data/municipalityCentroids';
import {
  SMAHUS_PER_REPRESENTATIVE,
  FLERBOSTADSHUS_PER_REPRESENTATIVE,
  SMAHUS_SIZE_DEG,
  FLERBOSTADSHUS_SIZE_DEG,
} from '../src/lib/mapConfig';
import type { HousingCollection, HousingUnitProperties } from '../src/types/housing';
import type { Feature, Polygon, Position } from 'geojson';

// ─── Constants ────────────────────────────────────────────────────────────────

const SMAHUS_HALF = SMAHUS_SIZE_DEG; // 0.0005 (~55m footprint)
const FLERBO_HALF = FLERBOSTADSHUS_SIZE_DEG; // 0.001 (~110m footprint)
const SMAHUS_SPACING = SMAHUS_HALF * 2.5;
const FLERBO_SPACING = FLERBO_HALF * 2.5;

const SMAHUS_HEIGHT_MIN = 20;
const SMAHUS_HEIGHT_MAX = 100;
const FLERBO_CURRENT_HEIGHT_MIN = 80;
const FLERBO_CURRENT_HEIGHT_MAX = 250;
const FLERBO_NEW_HEIGHT_MIN = 150;
const FLERBO_NEW_HEIGHT_MAX = 400;

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

// ─── Shape builders ────────────────────────────────────────────────────────────

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
        [-1.5, -0.6],
        [1.5, -0.6],
        [1.5, 0.6],
        [-1.5, 0.6],
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
    default:
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

function pickShape(seed: number): 'square' | 'L' | 'wide' | 'T' {
  const v = seededFloat(seed);
  if (v < 0.4) return 'square';
  if (v < 0.65) return 'L';
  if (v < 0.85) return 'wide';
  return 'T';
}

// ─── Cluster center finding ────────────────────────────────────────────────────

function findClusterCenters(
  ring: Position[],
  bbox: BBox,
  nClusters: number,
  muniSeed: number,
  fallback: [number, number],
): [number, number][] {
  const centers: [number, number][] = [];
  const lngRange = bbox.maxLng - bbox.minLng;
  const latRange = bbox.maxLat - bbox.minLat;
  const bandHeight = latRange / nClusters;

  for (let c = 0; c < nClusters; c++) {
    const minBandLat = bbox.minLat + c * bandHeight;
    let found = false;

    for (let attempt = 0; attempt < 150; attempt++) {
      const lng =
        bbox.minLng + seededFloat((muniSeed + c * 300 + attempt * 2 + 1) >>> 0) * lngRange;
      const lat =
        minBandLat + seededFloat((muniSeed + c * 300 + attempt * 2 + 2) >>> 0) * bandHeight;
      if (pointInRing(lng, lat, ring)) {
        centers.push([lng, lat]);
        found = true;
        break;
      }
    }

    if (!found) {
      const offset = (c - (nClusters - 1) / 2) * 0.01;
      centers.push([fallback[0] + offset, fallback[1] + offset]);
    }
  }

  return centers;
}

// ─── Position generation ──────────────────────────────────────────────────────

function generateClusteredPositions(
  ring: Position[],
  clusterCenters: [number, number][],
  count: number,
  spacing: number,
  muniSeed: number,
  typeOffset: number,
): [number, number][] {
  const positions: [number, number][] = [];
  const nClusters = clusterCenters.length;

  for (let i = 0; i < count; i++) {
    const clusterIdx = i % nClusters;
    const posInCluster = Math.floor(i / nClusters);
    const [cx, cy] = clusterCenters[clusterIdx]!;

    const ringIdx = Math.floor(Math.sqrt(posInCluster));
    const angleSeed = (muniSeed + typeOffset + i * 7 + 10) >>> 0;
    const angle = seededFloat(angleSeed) * Math.PI * 2;
    const baseDx = ringIdx * spacing * Math.cos(angle);
    const baseDy = ringIdx * spacing * Math.sin(angle);

    const jxSeed = (muniSeed + typeOffset + i * 13 + 20) >>> 0;
    const jySeed = (muniSeed + typeOffset + i * 13 + 21) >>> 0;

    let placed = false;
    for (let retry = 0; retry < 20; retry++) {
      const jx = (seededFloat((jxSeed + retry * 7) >>> 0) - 0.5) * spacing * 1.2;
      const jy = (seededFloat((jySeed + retry * 7) >>> 0) - 0.5) * spacing * 1.2;
      const lng = cx + baseDx + jx;
      const lat = cy + baseDy + jy;
      if (pointInRing(lng, lat, ring)) {
        positions.push([lng, lat]);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Last resort: near cluster center with minimal jitter
      const jx = (seededFloat((jxSeed + 999) >>> 0) - 0.5) * spacing * 0.4;
      const jy = (seededFloat((jySeed + 999) >>> 0) - 0.5) * spacing * 0.4;
      positions.push([cx + jx, cy + jy]);
    }
  }

  return positions;
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

  const centroid = MUNICIPALITY_CENTROIDS[municipality];
  if (!centroid) {
    console.warn(`⚠  No centroid for "${municipality}" — skipping`);
    warnings++;
    continue;
  }

  const polyData = municipalityPolygons.get(municipality);
  if (!polyData) {
    console.warn(`⚠  No polygon for "${municipality}" — skipping`);
    warnings++;
    continue;
  }

  const { ring, bbox } = polyData;
  const muniSeed = hashStr(municipality);

  const smahus = parseNum(row['Antal småhus']);
  const flerbostad = parseNum(row['Antal flerbostadshus']);
  const flerbostad2060 = parseNum(row['Antal flerbostadshus 2060 (hög)']);

  const nSmahus = Math.floor(smahus / SMAHUS_PER_REPRESENTATIVE);
  const nFler = Math.floor(flerbostad / FLERBOSTADSHUS_PER_REPRESENTATIVE);
  const nFlerNew = Math.max(
    0,
    Math.floor((flerbostad2060 - flerbostad) / FLERBOSTADSHUS_PER_REPRESENTATIVE),
  );

  let polyArea = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i] as [number, number];
    const p2 = ring[i + 1] as [number, number];
    polyArea += p1[0] * p2[1] - p2[0] * p1[1];
  }
  polyArea = Math.abs(polyArea / 2);
  if (polyArea === 0) {
    polyArea = (bbox.maxLng - bbox.minLng) * (bbox.maxLat - bbox.minLat);
  }

  const totalFler = nFler + nFlerNew;
  const totalUnits = nSmahus + totalFler;
  const totalShares = nSmahus * 1 + totalFler * 4;

  let smahusHalfSize = SMAHUS_HALF;
  let flerboHalfSize = FLERBO_HALF;
  let dynamicSmahusSpacing = SMAHUS_SPACING;
  let dynamicFlerboSpacing = FLERBO_SPACING;
  let smahusHeightMod = 1;
  let flerboHeightMod = 1;
  let dynamicNClusters = seededFloat((muniSeed + 9999) >>> 0) < 0.5 ? 2 : 3;

  if (totalShares > 0 && polyArea > 0) {
    // 1) Dynamic footprint scaling to target covering ~8% of the polygon's bounding area
    const TARGET_COVERAGE = 0.08;
    const areaPerShare = (polyArea * TARGET_COVERAGE) / totalShares;

    smahusHalfSize = Math.sqrt(areaPerShare) / 2;
    flerboHalfSize = Math.sqrt(areaPerShare * 4) / 2;

    // Optional bounds to prevent vanishing or comically absurd shapes
    smahusHalfSize = Math.max(0.00005, Math.min(smahusHalfSize, 0.015));
    flerboHalfSize = Math.max(0.0001, Math.min(flerboHalfSize, 0.03));

    // 2) Tighter Spacing to encourage the requested "clump" effect
    dynamicSmahusSpacing = smahusHalfSize * 2.1;
    dynamicFlerboSpacing = flerboHalfSize * 2.1;

    // 3) Proportional height modifiers
    smahusHeightMod = smahusHalfSize / SMAHUS_HALF;
    flerboHeightMod = flerboHalfSize / FLERBO_HALF;

    // 4) Dynamic cluster counts based on total area and density
    const baseDensity = totalUnits / polyArea; // units per sq degree
    if (baseDensity > 15000) {
      dynamicNClusters = 1; // highly urban, single dense mass
    } else if (baseDensity > 5000) {
      dynamicNClusters = 2; // suburban towns
    } else {
      dynamicNClusters = Math.min(5, Math.max(2, Math.floor(polyArea / 0.02)));
    }
  }

  // ── Flerbostadshus: unified pool so new buildings fill gaps among existing ──
  if (totalFler > 0) {
    const flerClusters = findClusterCenters(
      ring,
      bbox,
      dynamicNClusters,
      (muniSeed + 1000) >>> 0,
      centroid,
    );
    const flerPositions = generateClusteredPositions(
      ring,
      flerClusters,
      totalFler,
      dynamicFlerboSpacing,
      muniSeed,
      0,
    );

    for (let i = 0; i < flerPositions.length; i++) {
      const [lng, lat] = flerPositions[i]!;
      const isNew = i >= nFler;

      const heightSeed = (muniSeed + i * 13 + 200) >>> 0;
      let baseHeight = isNew
        ? seededFloat(heightSeed) * (FLERBO_NEW_HEIGHT_MAX - FLERBO_NEW_HEIGHT_MIN) +
          FLERBO_NEW_HEIGHT_MIN
        : seededFloat(heightSeed) * (FLERBO_CURRENT_HEIGHT_MAX - FLERBO_CURRENT_HEIGHT_MIN) +
          FLERBO_CURRENT_HEIGHT_MIN;

      // Scale height relative to the new footprint
      let height = baseHeight * flerboHeightMod;
      height = Math.max(40, Math.min(height, 2000)); // sane clamping

      const shape = pickShape((muniSeed + i * 11 + 300) >>> 0);
      const rotIdx = ((((muniSeed + i * 17 + 400) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      const props: HousingUnitProperties = {
        id: isNew ? `fb-new-${municipality}-${i}` : `fb-${municipality}-${i}`,
        municipality,
        type: 'flerbostadshus',
        view: isNew ? 'planned' : 'current',
        height: Math.round(height),
      };

      const feature = makeFeature(lng, lat, flerboHalfSize, shape, rotIdx, props);
      if (isNew) {
        flerbostadshusNewFeatures.push(feature);
      } else {
        flerbostadshusFeatures.push(feature);
      }
    }
  }

  // ── Småhus: separate cluster set ──────────────────────────────────────────
  if (nSmahus > 0) {
    const smaClusters = findClusterCenters(
      ring,
      bbox,
      dynamicNClusters,
      (muniSeed + 2000) >>> 0,
      centroid,
    );
    const smaPositions = generateClusteredPositions(
      ring,
      smaClusters,
      nSmahus,
      dynamicSmahusSpacing,
      muniSeed,
      50000,
    );

    for (let i = 0; i < smaPositions.length; i++) {
      const [lng, lat] = smaPositions[i]!;

      const heightSeed = (muniSeed + i * 7 + 600) >>> 0;
      let baseHeight =
        seededFloat(heightSeed) * (SMAHUS_HEIGHT_MAX - SMAHUS_HEIGHT_MIN) + SMAHUS_HEIGHT_MIN;

      let height = baseHeight * smahusHeightMod;
      height = Math.max(10, Math.min(height, 800));

      // Single-family homes: mostly squares and wide rectangles
      const shapeVal = seededFloat((muniSeed + i * 5 + 700) >>> 0);
      const shape: 'square' | 'wide' = shapeVal < 0.65 ? 'square' : 'wide';
      const rotIdx = ((((muniSeed + i * 19 + 800) >>> 0) * 2654435761 + 1013904223) >>> 0) % 4;

      const props: HousingUnitProperties = {
        id: `sm-${municipality}-${i}`,
        municipality,
        type: 'smahus',
        view: 'both',
        height: Math.round(height),
      };

      smahusFeatures.push(makeFeature(lng, lat, smahusHalfSize, shape, rotIdx, props));
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
