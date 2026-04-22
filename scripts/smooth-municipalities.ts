import * as fs from 'fs';
import * as path from 'path';

type Position = [number, number];

// Chaikin corner-cutting: each iteration replaces every segment A→B with two
// points at 25% and 75% along the segment. Closed rings stay closed.
function chaikin(ring: Position[], iterations: number): Position[] {
  let pts = ring;
  for (let iter = 0; iter < iterations; iter++) {
    const n = pts.length - 1; // last point == first (closed ring)
    const next: Position[] = [];
    for (let i = 0; i < n; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    next.push(next[0]!); // close the ring
    pts = next;
  }
  return pts;
}

const INPUT = path.join(process.cwd(), 'public/data/municipalities.geojson');
const OUTPUT = path.join(process.cwd(), 'public/data/municipalities.geojson');
const ITERATIONS = 1;

const geojson = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

for (const feature of geojson.features) {
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates = feature.geometry.coordinates.map((ring: Position[]) =>
      chaikin(ring, ITERATIONS),
    );
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(geojson));
console.log(`Smoothed ${geojson.features.length} polygons (${ITERATIONS} Chaikin iterations)`);
