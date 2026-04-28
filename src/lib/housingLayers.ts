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

const municipalityFilter = (name: string): mapboxgl.FilterSpecification => [
  '==',
  ['get', 'municipality'],
  name,
];

function addExtrusionLayer(map: mapboxgl.Map, layerId: string, sourceId: string, color: string) {
  map.addLayer({
    id: layerId,
    type: 'fill-extrusion',
    source: sourceId,
    filter: ['==', ['get', 'municipality'], ''] as mapboxgl.FilterSpecification,
    paint: {
      'fill-extrusion-color': color,
      'fill-extrusion-height': ['get', 'height'] as unknown as number,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85,
    },
    layout: { visibility: 'none' },
  });
}

// Call once when housing data is first fetched. Layers start hidden.
export function initHousingLayers(
  map: mapboxgl.Map,
  smahusData: HousingCollection,
  currentData: HousingCollection,
  newData: HousingCollection,
) {
  map.addSource(SMAHUS_SOURCE_ID, { type: 'geojson', data: smahusData });
  map.addSource(FLERBOSTADSHUS_SOURCE_ID, { type: 'geojson', data: currentData });
  map.addSource(FLERBOSTADSHUS_NEW_SOURCE_ID, { type: 'geojson', data: newData });

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
}

// Show housing for a municipality; defaults to "current" view (new apartments hidden).
export function showHousingForMunicipality(
  map: mapboxgl.Map,
  municipality: string,
  view: HousingView = 'current',
) {
  for (const id of [
    SMAHUS_LAYER_ID,
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    FLERBOSTADSHUS_NEW_LAYER_ID,
  ]) {
    if (!map.getLayer(id)) return;
  }
  const filter = municipalityFilter(municipality);
  map.setFilter(SMAHUS_LAYER_ID, filter);
  map.setFilter(FLERBOSTADSHUS_CURRENT_LAYER_ID, filter);
  map.setFilter(FLERBOSTADSHUS_NEW_LAYER_ID, filter);
  map.setLayoutProperty(SMAHUS_LAYER_ID, 'visibility', 'visible');
  map.setLayoutProperty(FLERBOSTADSHUS_CURRENT_LAYER_ID, 'visibility', 'visible');
  map.setLayoutProperty(
    FLERBOSTADSHUS_NEW_LAYER_ID,
    'visibility',
    view === 'planned' ? 'visible' : 'none',
  );
}

// Hide all housing layers (when returning to overview).
// Guards against the race where the user navigates back before lazy init completes.
export function hideHousingLayers(map: mapboxgl.Map) {
  if (!map || !map.isStyleLoaded()) return;
  for (const id of [
    SMAHUS_LAYER_ID,
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    FLERBOSTADSHUS_NEW_LAYER_ID,
  ]) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
  }
}

// "Idag": current apartments visible, new hidden.
// "2060": current apartments stay visible + new apartments (amber) added.
export function setLayerView(map: mapboxgl.Map, view: HousingView) {
  if (!map.getLayer(FLERBOSTADSHUS_CURRENT_LAYER_ID)) return;
  map.setLayoutProperty(FLERBOSTADSHUS_CURRENT_LAYER_ID, 'visibility', 'visible');
  map.setLayoutProperty(
    FLERBOSTADSHUS_NEW_LAYER_ID,
    'visibility',
    view === 'planned' ? 'visible' : 'none',
  );
}
