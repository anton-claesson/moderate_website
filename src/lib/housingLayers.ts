import type mapboxgl from 'mapbox-gl';
import type { HousingCollection, HousingView } from '@/types/housing';
import {
  SMAHUS_LAYER_ID,
  FLERBOSTADSHUS_CURRENT_LAYER_ID,
  FLERBOSTADSHUS_2060_LAYER_ID,
  SMAHUS_COLOR,
  FLERBOSTADSHUS_COLOR,
  FLERBOSTADSHUS_2060_COLOR,
  SMAHUS_HEIGHT_M,
  FLERBOSTADSHUS_HEIGHT_M,
} from './mapConfig';

const SMAHUS_SOURCE_ID = 'housing-smahus';
const FLERBOSTADSHUS_SOURCE_ID = 'housing-flerbostadshus';
const FLERBOSTADSHUS_2060_SOURCE_ID = 'housing-flerbostadshus-2060';

const municipalityFilter = (name: string): mapboxgl.FilterSpecification => [
  '==',
  ['get', 'municipality'],
  name,
];

function addExtrusionLayer(
  map: mapboxgl.Map,
  layerId: string,
  sourceId: string,
  color: string,
  height: number,
) {
  map.addLayer({
    id: layerId,
    type: 'fill-extrusion',
    source: sourceId,
    filter: ['==', ['get', 'municipality'], ''] as mapboxgl.FilterSpecification,
    paint: {
      'fill-extrusion-color': color,
      'fill-extrusion-height': height,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85,
    },
    layout: { visibility: 'none' },
  });
}

// Call once when housing data is first fetched. Layers start hidden with an empty filter.
export function initHousingLayers(
  map: mapboxgl.Map,
  smahusData: HousingCollection,
  currentData: HousingCollection,
  futureData: HousingCollection,
) {
  map.addSource(SMAHUS_SOURCE_ID, { type: 'geojson', data: smahusData });
  map.addSource(FLERBOSTADSHUS_SOURCE_ID, { type: 'geojson', data: currentData });
  map.addSource(FLERBOSTADSHUS_2060_SOURCE_ID, { type: 'geojson', data: futureData });

  addExtrusionLayer(map, SMAHUS_LAYER_ID, SMAHUS_SOURCE_ID, SMAHUS_COLOR, SMAHUS_HEIGHT_M);
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    FLERBOSTADSHUS_SOURCE_ID,
    FLERBOSTADSHUS_COLOR,
    FLERBOSTADSHUS_HEIGHT_M,
  );
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_2060_LAYER_ID,
    FLERBOSTADSHUS_2060_SOURCE_ID,
    FLERBOSTADSHUS_2060_COLOR,
    FLERBOSTADSHUS_HEIGHT_M,
  );
}

// Show housing extrusions for a single municipality.
export function showHousingForMunicipality(map: mapboxgl.Map, municipality: string) {
  const filter = municipalityFilter(municipality);
  map.setFilter(SMAHUS_LAYER_ID, filter);
  map.setFilter(FLERBOSTADSHUS_CURRENT_LAYER_ID, filter);
  map.setFilter(FLERBOSTADSHUS_2060_LAYER_ID, filter);
  map.setLayoutProperty(SMAHUS_LAYER_ID, 'visibility', 'visible');
  map.setLayoutProperty(FLERBOSTADSHUS_CURRENT_LAYER_ID, 'visibility', 'visible');
  map.setLayoutProperty(FLERBOSTADSHUS_2060_LAYER_ID, 'visibility', 'none');
}

// Hide all housing layers (when returning to overview).
export function hideHousingLayers(map: mapboxgl.Map) {
  map.setLayoutProperty(SMAHUS_LAYER_ID, 'visibility', 'none');
  map.setLayoutProperty(FLERBOSTADSHUS_CURRENT_LAYER_ID, 'visibility', 'none');
  map.setLayoutProperty(FLERBOSTADSHUS_2060_LAYER_ID, 'visibility', 'none');
}

// Switch the apartment layer between current and 2060.
export function setLayerView(map: mapboxgl.Map, view: HousingView) {
  map.setLayoutProperty(
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    'visibility',
    view === 'current' ? 'visible' : 'none',
  );
  map.setLayoutProperty(
    FLERBOSTADSHUS_2060_LAYER_ID,
    'visibility',
    view === '2060' ? 'visible' : 'none',
  );
}
