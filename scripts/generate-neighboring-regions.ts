import * as fs from 'fs';
import * as path from 'path';

// lan_code values for Uppsala (03), Södermanland (04), Västmanland (19)
const NEIGHBOR_LAN_CODES = new Set(['03', '04', '19']);

const src = JSON.parse(fs.readFileSync('/tmp/swedish_municipalities.geojson', 'utf8'));

const features = src.features.filter((f: { properties: { lan_code: string } }) =>
  NEIGHBOR_LAN_CODES.has(f.properties.lan_code),
);

console.log(`Filtered ${features.length} municipalities from neighboring counties`);

const out = { type: 'FeatureCollection', features };
const outPath = path.join(process.cwd(), 'public/data/neighboring-regions.geojson');
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`Written to neighboring-regions.geojson`);
