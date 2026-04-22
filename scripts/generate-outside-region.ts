import * as fs from 'fs';
import * as path from 'path';

type Position = [number, number];

// Reverse a ring's winding order (exterior → hole)
function reverseRing(ring: Position[]): Position[] {
  return [...ring].reverse();
}

const muniPath = path.join(process.cwd(), 'public/data/municipalities.geojson');
const outPath = path.join(process.cwd(), 'public/data/outside-region.geojson');

const muni = JSON.parse(fs.readFileSync(muniPath, 'utf8'));

// Outer ring: large box covering the full map viewport
const outerRing: Position[] = [
  [14, 57],
  [23, 57],
  [23, 62],
  [14, 62],
  [14, 57],
];

// Interior rings (holes): exterior ring of each municipality, reversed
const holes: Position[][] = muni.features.map((f: { geometry: { coordinates: Position[][] } }) =>
  reverseRing(f.geometry.coordinates[0]!),
);

const feature = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [outerRing, ...holes],
  },
  properties: {},
};

fs.writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features: [feature] }));
console.log(`Written outside-region.geojson with ${holes.length} holes`);
