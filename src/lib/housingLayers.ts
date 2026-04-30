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

// Highlight layers — same sources, rendered on top; filtered to selected municipality.
const SMAHUS_HIGHLIGHT_ID = 'smahus-highlight';
const FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID = 'flerbostadshus-current-highlight';
const FLERBOSTADSHUS_NEW_HIGHLIGHT_ID = 'flerbostadshus-new-highlight';

const DIM_OPACITY = 0.15;
const FULL_OPACITY = 0.9;

function addExtrusionLayer(
  map: mapboxgl.Map,
  layerId: string,
  sourceId: string,
  color: string,
  opacity = FULL_OPACITY,
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
  map.addSource(SMAHUS_SOURCE_ID, { type: 'geojson', data: smahusData });
  map.addSource(FLERBOSTADSHUS_SOURCE_ID, { type: 'geojson', data: currentData });
  map.addSource(FLERBOSTADSHUS_NEW_SOURCE_ID, { type: 'geojson', data: newData });

  // Base layers — used for overview (full opacity) and as dim backdrop when selected.
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

  // Base layers: no filter, full opacity, new apartments respect view toggle.
  for (const id of [SMAHUS_LAYER_ID, FLERBOSTADSHUS_CURRENT_LAYER_ID]) {
    map.setFilter(id, null);
    map.setPaintProperty(id, 'fill-extrusion-opacity', FULL_OPACITY);
    map.setLayoutProperty(id, 'visibility', 'visible');
  }
  map.setFilter(FLERBOSTADSHUS_NEW_LAYER_ID, null);
  map.setPaintProperty(FLERBOSTADSHUS_NEW_LAYER_ID, 'fill-extrusion-opacity', FULL_OPACITY);
  map.setLayoutProperty(
    FLERBOSTADSHUS_NEW_LAYER_ID,
    'visibility',
    view === 'planned' ? 'visible' : 'none',
  );

  // Highlight layers: hide in overview.
  for (const id of [
    SMAHUS_HIGHLIGHT_ID,
    FLERBOSTADSHUS_CURRENT_HIGHLIGHT_ID,
    FLERBOSTADSHUS_NEW_HIGHLIGHT_ID,
  ]) {
    map.setLayoutProperty(id, 'visibility', 'none');
  }
}

// Dim all non-selected buildings to 0.2; show selected municipality at full opacity via highlight layers.
export function showHousingForMunicipality(
  map: mapboxgl.Map,
  municipality: string,
  view: HousingView = 'current',
) {
  if (!layersReady(map)) return;

  const dimFilter = ['!=', ['get', 'municipality'], municipality] as mapboxgl.FilterSpecification;
  const hlFilter = ['==', ['get', 'municipality'], municipality] as mapboxgl.FilterSpecification;
  const newVisible = view === 'planned' ? 'visible' : 'none';

  // Base layers: filter to non-selected, dim opacity.
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
  for (const id of [FLERBOSTADSHUS_NEW_LAYER_ID, FLERBOSTADSHUS_NEW_HIGHLIGHT_ID]) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', newVisible);
  }
}
