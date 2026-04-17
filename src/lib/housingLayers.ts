import type mapboxgl from 'mapbox-gl';
import type { HousingCollection } from '@/types/housing';
import type { HousingView } from '@/types/housing';
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

function addExtrusionLayer(
  map: mapboxgl.Map,
  layerId: string,
  sourceId: string,
  color: string,
  height: number,
  visible: boolean,
) {
  map.addLayer({
    id: layerId,
    type: 'fill-extrusion',
    source: sourceId,
    paint: {
      'fill-extrusion-color': color,
      'fill-extrusion-height': height,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85,
    },
    layout: {
      visibility: visible ? 'visible' : 'none',
    },
  });
}

export function addAllLayers(
  map: mapboxgl.Map,
  smahusData: HousingCollection,
  currentData: HousingCollection,
  futureData: HousingCollection,
) {
  map.addSource(SMAHUS_SOURCE_ID, { type: 'geojson', data: smahusData });
  map.addSource(FLERBOSTADSHUS_SOURCE_ID, { type: 'geojson', data: currentData });
  map.addSource(FLERBOSTADSHUS_2060_SOURCE_ID, { type: 'geojson', data: futureData });

  addExtrusionLayer(map, SMAHUS_LAYER_ID, SMAHUS_SOURCE_ID, SMAHUS_COLOR, SMAHUS_HEIGHT_M, true);
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_CURRENT_LAYER_ID,
    FLERBOSTADSHUS_SOURCE_ID,
    FLERBOSTADSHUS_COLOR,
    FLERBOSTADSHUS_HEIGHT_M,
    true,
  );
  addExtrusionLayer(
    map,
    FLERBOSTADSHUS_2060_LAYER_ID,
    FLERBOSTADSHUS_2060_SOURCE_ID,
    FLERBOSTADSHUS_2060_COLOR,
    FLERBOSTADSHUS_HEIGHT_M,
    false,
  );
}

export function setLayerVisibility(map: mapboxgl.Map, view: HousingView) {
  const currentVisible = view === 'current' ? 'visible' : 'none';
  const futureVisible = view === '2060' ? 'visible' : 'none';
  map.setLayoutProperty(FLERBOSTADSHUS_CURRENT_LAYER_ID, 'visibility', currentVisible);
  map.setLayoutProperty(FLERBOSTADSHUS_2060_LAYER_ID, 'visibility', futureVisible);
}
