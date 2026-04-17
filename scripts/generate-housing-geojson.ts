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
import type { Feature, Polygon } from 'geojson';

const GRID_COLS = 8;

function makeSquare(
  centerLng: number,
  centerLat: number,
  halfSize: number,
): Feature<Polygon, HousingUnitProperties> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [centerLng - halfSize, centerLat - halfSize],
          [centerLng + halfSize, centerLat - halfSize],
          [centerLng + halfSize, centerLat + halfSize],
          [centerLng - halfSize, centerLat + halfSize],
          [centerLng - halfSize, centerLat - halfSize],
        ],
      ],
    },
    properties: {} as HousingUnitProperties,
  };
}

function generateGrid(
  centroid: [number, number],
  count: number,
  sizeHalf: number,
  spacing: number,
  municipality: string,
  id_prefix: string,
  props: Omit<HousingUnitProperties, 'id' | 'municipality'>,
): Feature<Polygon, HousingUnitProperties>[] {
  const [baseLng, baseLat] = centroid;
  const features: Feature<Polygon, HousingUnitProperties>[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const lng = baseLng + (col - GRID_COLS / 2) * spacing;
    const lat = baseLat + row * spacing;
    const feature = makeSquare(lng, lat, sizeHalf);
    feature.properties = {
      id: `${id_prefix}-${municipality}-${i}`,
      municipality,
      ...props,
    };
    features.push(feature);
  }

  return features;
}

function parseCsv(filePath: string): Record<string, string>[] {
  const raw = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, ''); // strip BOM
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

const csvPath = path.resolve(__dirname, '../public/bostads_data.csv');
const outDir = path.resolve(__dirname, '../public/data');
fs.mkdirSync(outDir, { recursive: true });

const rows = parseCsv(csvPath);

const smahusFeatures: Feature<Polygon, HousingUnitProperties>[] = [];
const flerbostadshusFeatures: Feature<Polygon, HousingUnitProperties>[] = [];
const flerbostadshus2060Features: Feature<Polygon, HousingUnitProperties>[] = [];

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

  const smahus = parseNum(row['Antal småhus']);
  const flerbostad = parseNum(row['Antal flerbostadshus']);
  const flerbostad2060 = parseNum(row['Antal flerbostadshus 2060 (hög)']);

  const nSmahus = Math.floor(smahus / SMAHUS_PER_REPRESENTATIVE);
  const nFler = Math.floor(flerbostad / FLERBOSTADSHUS_PER_REPRESENTATIVE);
  const nFler2060 = Math.floor(flerbostad2060 / FLERBOSTADSHUS_PER_REPRESENTATIVE);

  const smahusSpacing = SMAHUS_SIZE_DEG * 2.2;
  const flerSpacing = FLERBOSTADSHUS_SIZE_DEG * 2.2;

  smahusFeatures.push(
    ...generateGrid(centroid, nSmahus, SMAHUS_SIZE_DEG, smahusSpacing, municipality, 'sm', {
      type: 'smahus',
      view: 'both',
    }),
  );

  flerbostadshusFeatures.push(
    ...generateGrid(centroid, nFler, FLERBOSTADSHUS_SIZE_DEG, flerSpacing, municipality, 'fb', {
      type: 'flerbostadshus',
      view: 'current',
    }),
  );

  flerbostadshus2060Features.push(
    ...generateGrid(
      centroid,
      nFler2060,
      FLERBOSTADSHUS_SIZE_DEG,
      flerSpacing,
      municipality,
      'fb60',
      { type: 'flerbostadshus', view: '2060' },
    ),
  );

  console.log(
    `  ${municipality}: ${nSmahus} småhus, ${nFler} flerbostadshus (idag), ${nFler2060} flerbostadshus (2060)`,
  );
}

function writeCollection(filePath: string, features: Feature<Polygon, HousingUnitProperties>[]) {
  const collection: HousingCollection = { type: 'FeatureCollection', features };
  fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
  console.log(`✓ Wrote ${features.length} features → ${path.relative(process.cwd(), filePath)}`);
}

writeCollection(path.join(outDir, 'housing-smahus.geojson'), smahusFeatures);
writeCollection(path.join(outDir, 'housing-flerbostadshus.geojson'), flerbostadshusFeatures);
writeCollection(
  path.join(outDir, 'housing-flerbostadshus-2060.geojson'),
  flerbostadshus2060Features,
);

if (warnings > 0) {
  console.warn(`\n${warnings} municipalities had no centroid and were skipped.`);
}
