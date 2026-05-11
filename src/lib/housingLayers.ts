import type mapboxgl from 'mapbox-gl';
import type { HousingCollection, HousingView } from '@/types/housing';
import {
  SMAHUS_LAYER_ID,
  FLERBOSTADSHUS_CURRENT_LAYER_ID,
  FLERBOSTADSHUS_NEW_LAYER_ID,
  SMAHUS_COLOR,
  FLERBOSTADSHUS_COLOR,
  FLERBOSTADSHUS_NEW_COLOR,
} from './mapConfig';

const SMAHUS_SOURCE_ID = 'housing-smahus';
const FLERBOSTADSHUS_SOURCE_ID = 'housing-flerbostadshus';
const FLERBOSTADSHUS_NEW_SOURCE_ID = 'housing-flerbostadshus-new';

// Point sources — centroids of each building feature, used for uniform circle overview.
const SMAHUS_POINTS_SOURCE_ID = 'housing-smahus-points';
const FLERBOSTADSHUS_POINTS_SOURCE_ID = 'housing-flerbostadshus-points';
const FLERBOSTADSHUS_NEW_POINTS_SOURCE_ID = 'housing-flerbostadshus-new-points';

// Highlight layers — same sources, rendered on top; filtered to selected municipality.
const SMAHUS_HIGHLIGHT_ID = 'smahus-highlight';
const FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID = 'flerbostadshus-current-highlight';
const FLERBOSTADSHUS_NEW_HIGHLIGHT_ID = 'flerbostadshus-new-highlight';

export const HOUSING_HIGHLIGHT_LAYER_IDS = [
  SMAHUS_HIGHLIGHT_ID,
  FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID,
  FLERBOSTADSHUS_NEW_HIGHLIGHT_ID,
] as const;

// Uniform-radius circle layers used at overview zoom. Every building renders as an identical
// 3px dot so footprint-size differences in the GeoJSON don't affect visual density.
const SMAHUS_OVERVIEW_CIRCLE_ID = 'smahus-overview-circles';
const FLERBOSTADSHUS_CURRENT_OVERVIEW_CIRCLE_ID = 'flerbostadshus-current-overview-circles';
const FLERBOSTADSHUS_NEW_OVERVIEW_CIRCLE_ID = 'flerbostadshus-new-overview-circles';

const DIM_OPACITY = 0.05;
const FULL_OPACITY = 0.9;

// Circles: opaque at z8, gone by z10 (extrusions take over).
const OVERVIEW_CIRCLE_OPACITY_EXPR = [
  'interpolate',
  ['linear'],
  ['zoom'],
  8,
  0.8,
  10,
  0,
] as unknown as number;

// Extrusions: invisible at z≤9, fade to full at z10.5 (crossfade with circles above).
const OVERVIEW_OPACITY_EXPR = [
  'interpolate',
  ['linear'],
  ['zoom'],
  9,
  0,
  10.5,
  FULL_OPACITY,
] as unknown as number;

// Compute centroid of each polygon feature and return a Point FeatureCollection.
function computePointSource(
  collection: HousingCollection,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: collection.features.map((f) => {
      const ring = f.geometry.coordinates[0] ?? [];
      const lng = ring.reduce((s, c) => s + (c[0] ?? 0), 0) / (ring.length || 1);
      const lat = ring.reduce((s, c) => s + (c[1] ?? 0), 0) / (ring.length || 1);
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [lng, lat] },
        properties: f.properties,
      };
    }),
  };
}

function addOverviewCircleLayer(
  map: mapboxgl.Map,
  layerId: string,
  sourceId: string,
  color: string,
) {
  map.addLayer({
    id: layerId,
    type: 'circle',
    source: sourceId,
    paint: {
      'circle-radius': 2,
      'circle-color': color,
      'circle-opacity': OVERVIEW_CIRCLE_OPACITY_EXPR,
    },
    layout: { visibility: 'none' },
  });
}

function addExtrusionLayer(
  map: mapboxgl.Map,
  layerId: string,
  sourceId: string,
  color: string,
  opacity: number = OVERVIEW_OPACITY_EXPR,
) {
  map.addLayer({
    id: layerId,
    type: 'fill-extrusion',
    source: sourceId,
    paint: {
      'fill-extrusion-color': color,
      'fill-extrusion-height': ['get', 'height'] as unknown as number,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': opacity,
    },
    layout: { visibility: 'none' },
  });
}

function layersReady(map: mapboxgl.Map): boolean {
  return [
    SMAHUS_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_CURRENT_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_NEW_OVERVIEW_CIRCLE_ID,
    SMAHUS_LAYER_ID,
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    FLERBOSTADSHUS_NEW_LAYER_ID,
    SMAHUS_HIGHLIGHT_ID,
    FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID,
    FLERBOSTADSHUS_NEW_HIGHLIGHT_ID,
  ].every((id) => !!map.getLayer(id));
}

// Call once when housing data is first fetched. All layers start hidden.
export function initHousingLayers(
  map: mapboxgl.Map,
  smahusData: HousingCollection,
  currentData: HousingCollection,
  newData: HousingCollection,
) {
  // Polygon sources for extrusion detail view.
  map.addSource(SMAHUS_SOURCE_ID, { type: 'geojson', data: smahusData });
  map.addSource(FLERBOSTADSHUS_SOURCE_ID, { type: 'geojson', data: currentData });
  map.addSource(FLERBOSTADSHUS_NEW_SOURCE_ID, { type: 'geojson', data: newData });

  // Point sources (centroids) for uniform circle overview.
  map.addSource(SMAHUS_POINTS_SOURCE_ID, {
    type: 'geojson',
    data: computePointSource(smahusData),
  });
  map.addSource(FLERBOSTADSHUS_POINTS_SOURCE_ID, {
    type: 'geojson',
    data: computePointSource(currentData),
  });
  map.addSource(FLERBOSTADSHUS_NEW_POINTS_SOURCE_ID, {
    type: 'geojson',
    data: computePointSource(newData),
  });

  // Circle overview layers — added first so they render below extrusions.
  addOverviewCircleLayer(map, SMAHUS_OVERVIEW_CIRCLE_ID, SMAHUS_POINTS_SOURCE_ID, SMAHUS_COLOR);
  addOverviewCircleLayer(
    map,
    FLERBOSTADSHUS_CURRENT_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_POINTS_SOURCE_ID,
    FLERBOSTADSHUS_COLOR,
  );
  addOverviewCircleLayer(
    map,
    FLERBOSTADSHUS_NEW_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_NEW_POINTS_SOURCE_ID,
    FLERBOSTADSHUS_NEW_COLOR,
  );

  // Base extrusion layers — zoom-based opacity, fade in as circles fade out.
  addExtrusionLayer(map, SMAHUS_LAYER_ID, SMAHUS_SOURCE_ID, SMAHUS_COLOR);
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    FLERBOSTADSHUS_SOURCE_ID,
    FLERBOSTADSHUS_COLOR,
  );
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_NEW_LAYER_ID,
    FLERBOSTADSHUS_NEW_SOURCE_ID,
    FLERBOSTADSHUS_NEW_COLOR,
  );

  // Highlight layers — same sources, rendered on top at full opacity.
  addExtrusionLayer(map, SMAHUS_HIGHLIGHT_ID, SMAHUS_SOURCE_ID, SMAHUS_COLOR);
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID,
    FLERBOSTADSHUS_SOURCE_ID,
    FLERBOSTADSHUS_COLOR,
  );
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_NEW_HIGHLIGHT_ID,
    FLERBOSTADSHUS_NEW_SOURCE_ID,
    FLERBOSTADSHUS_NEW_COLOR,
  );
}

// Show all municipalities at uniform opacity — used in overview mode.
export function showAllHousingLayers(map: mapboxgl.Map, view: HousingView) {
  if (!layersReady(map)) return;

  const newVisible = view === 'planned' ? 'visible' : 'none';

  // Circle overview layers: zoom-based opacity is baked in; just set visibility.
  map.setLayoutProperty(SMAHUS_OVERVIEW_CIRCLE_ID, 'visibility', 'visible');
  map.setLayoutProperty(FLERBOSTADSHUS_CURRENT_OVERVIEW_CIRCLE_ID, 'visibility', 'visible');
  map.setLayoutProperty(FLERBOSTADSHUS_NEW_OVERVIEW_CIRCLE_ID, 'visibility', newVisible);

  // Base extrusion layers: no filter, zoom-based opacity.
  for (const id of [SMAHUS_LAYER_ID, FLERBOSTADSHUS_CURRENT_LAYER_ID]) {
    map.setFilter(id, null);
    map.setPaintProperty(id, 'fill-extrusion-opacity', OVERVIEW_OPACITY_EXPR);
    map.setLayoutProperty(id, 'visibility', 'visible');
  }
  map.setFilter(FLERBOSTADSHUS_NEW_LAYER_ID, null);
  map.setPaintProperty(
    FLERBOSTADSHUS_NEW_LAYER_ID,
    'fill-extrusion-opacity',
    OVERVIEW_OPACITY_EXPR,
  );
  map.setLayoutProperty(FLERBOSTADSHUS_NEW_LAYER_ID, 'visibility', newVisible);

  // Highlight layers: hide in overview.
  for (const id of [
    SMAHUS_HIGHLIGHT_ID,
    FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID,
    FLERBOSTADSHUS_NEW_HIGHLIGHT_ID,
  ]) {
    map.setLayoutProperty(id, 'visibility', 'none');
  }
}

// Dim all non-selected buildings; show selected municipality at full opacity via highlight layers.
export function showHousingForMunicipality(
  map: mapboxgl.Map,
  municipality: string,
  view: HousingView = 'current',
) {
  if (!layersReady(map)) return;

  const dimFilter = ['!=', ['get', 'municipality'], municipality] as mapboxgl.FilterSpecification;
  const hlFilter = ['==', ['get', 'municipality'], municipality] as mapboxgl.FilterSpecification;
  const newVisible = view === 'planned' ? 'visible' : 'none';

  // Hide circle overview layers — not needed in detail view.
  for (const id of [
    SMAHUS_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_CURRENT_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_NEW_OVERVIEW_CIRCLE_ID,
  ]) {
    map.setLayoutProperty(id, 'visibility', 'none');
  }

  // Base extrusion layers: filter to non-selected, dim opacity.
  for (const id of [SMAHUS_LAYER_ID, FLERBOSTADSHUS_CURRENT_LAYER_ID]) {
    map.setFilter(id, dimFilter);
    map.setPaintProperty(id, 'fill-extrusion-opacity', DIM_OPACITY);
    map.setLayoutProperty(id, 'visibility', 'visible');
  }
  map.setFilter(FLERBOSTADSHUS_NEW_LAYER_ID, dimFilter);
  map.setPaintProperty(FLERBOSTADSHUS_NEW_LAYER_ID, 'fill-extrusion-opacity', DIM_OPACITY);
  map.setLayoutProperty(FLERBOSTADSHUS_NEW_LAYER_ID, 'visibility', newVisible);

  // Highlight layers: filter to selected, full opacity.
  for (const id of [SMAHUS_HIGHLIGHT_ID, FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID]) {
    map.setFilter(id, hlFilter);
    map.setPaintProperty(id, 'fill-extrusion-opacity', FULL_OPACITY);
    map.setLayoutProperty(id, 'visibility', 'visible');
  }
  map.setFilter(FLERBOSTADSHUS_NEW_HIGHLIGHT_ID, hlFilter);
  map.setPaintProperty(FLERBOSTADSHUS_NEW_HIGHLIGHT_ID, 'fill-extrusion-opacity', FULL_OPACITY);
  map.setLayoutProperty(FLERBOSTADSHUS_NEW_HIGHLIGHT_ID, 'visibility', newVisible);
}

// Toggle new-apartment layer visibility without touching opacity or filters.
export function setLayerView(map: mapboxgl.Map, view: HousingView) {
  const newVisible = view === 'planned' ? 'visible' : 'none';
  for (const id of [
    FLERBOSTADSHUS_NEW_OVERVIEW_CIRCLE_ID,
    FLERBOSTADSHUS_NEW_LAYER_ID,
    FLERBOSTADSHUS_NEW_HIGHLIGHT_ID,
  ]) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', newVisible);
  }
}
