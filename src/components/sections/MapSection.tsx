'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Map as MapboxMap, MapMouseEvent } from 'mapbox-gl';
import type { HousingCollection, HousingView } from '@/types/housing';
import { MUNICIPALITY_CENTROIDS } from '@/data/municipalityCentroids';
import {
  initHousingLayers,
  showHousingForMunicipality,
  hideHousingLayers,
  setLayerView,
} from '@/lib/housingLayers';
import {
  STOCKHOLM_CENTER,
  OVERVIEW_ZOOM,
  OVERVIEW_PITCH,
  OVERVIEW_BEARING,
  DETAIL_ZOOM,
  DEFAULT_PITCH,
  DEFAULT_BEARING,
} from '@/lib/mapConfig';
import LayerToggle from '@/components/map/LayerToggle';
import BackButton from '@/components/map/BackButton';
import MunicipalityList from '@/components/map/MunicipalityList';

const MapCanvas = dynamic(() => import('@/components/map/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-text-on-dark/40 text-sm">Loading map…</span>
    </div>
  ),
});

interface MapSectionProps {
  id: string;
}

const MUNICIPALITY_FILL_LAYER = 'municipalities-fill';
const MUNICIPALITY_OUTLINE_LAYER = 'municipalities-outline';
const MUNICIPALITY_HOVER_LAYER = 'municipalities-hover';
const MUNICIPALITY_SOURCE = 'municipalities';

const SORTED_MUNICIPALITIES = Object.keys(MUNICIPALITY_CENTROIDS).sort();

async function fetchHousingData(): Promise<
  [HousingCollection, HousingCollection, HousingCollection]
> {
  const [smahus, current, future] = await Promise.all([
    fetch('/data/housing-smahus.geojson').then((r) => r.json()),
    fetch('/data/housing-flerbostadshus.geojson').then((r) => r.json()),
    fetch('/data/housing-flerbostadshus-2060.geojson').then((r) => r.json()),
  ]);
  return [smahus as HousingCollection, current as HousingCollection, future as HousingCollection];
}

export default function MapSection({ id }: MapSectionProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const housingDataRef = useRef<[HousingCollection, HousingCollection, HousingCollection] | null>(
    null,
  );
  const housingInitRef = useRef(false);
  const hoveredRef = useRef<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<HousingView>('current');
  const [housingReady, setHousingReady] = useState(false);

  // Load housing data once, lazily, on first municipality selection
  async function ensureHousingReady(map: MapboxMap) {
    if (housingInitRef.current) return;
    housingInitRef.current = true;
    const data = await fetchHousingData();
    housingDataRef.current = data;
    initHousingLayers(map, ...data);
    setHousingReady(true);
  }

  const selectMunicipality = useCallback(async (name: string) => {
    const map = mapRef.current;
    if (!map) return;

    const centroid = MUNICIPALITY_CENTROIDS[name];
    if (!centroid) return;

    setSelected(name);
    setView('current');

    await ensureHousingReady(map);
    showHousingForMunicipality(map, name);

    map.flyTo({
      center: centroid,
      zoom: DETAIL_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 1400,
    });
  }, []);

  const returnToOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    hideHousingLayers(map);
    map.flyTo({
      center: STOCKHOLM_CENTER,
      zoom: OVERVIEW_ZOOM,
      pitch: OVERVIEW_PITCH,
      bearing: OVERVIEW_BEARING,
      duration: 1200,
    });
  }, []);

  // Sync toggle view → map layer visibility (only once layers are initialized)
  useEffect(() => {
    if (mapRef.current && selected && housingReady) {
      setLayerView(mapRef.current, view);
    }
  }, [view, selected, housingReady]);

  const handleMapReady = useCallback(
    (map: MapboxMap) => {
      mapRef.current = map;

      // Disable all user interactions — overview is non-interactive
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();

      // Add municipality boundary source + layers
      map.addSource(MUNICIPALITY_SOURCE, {
        type: 'geojson',
        data: '/data/municipalities.geojson',
      });

      // Transparent fill for click / hover hit area
      map.addLayer({
        id: MUNICIPALITY_FILL_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
      });

      // Visible outline
      map.addLayer({
        id: MUNICIPALITY_OUTLINE_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        paint: { 'line-color': '#5C8B5A', 'line-width': 1.5, 'line-opacity': 0.7 },
      });

      // Hover highlight layer
      map.addLayer({
        id: MUNICIPALITY_HOVER_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#5C8B5A', 'fill-opacity': 0.15 },
        filter: ['==', ['get', 'kom_namn'], ''],
      });

      // Hover: highlight municipality under cursor
      map.on('mousemove', MUNICIPALITY_FILL_LAYER, (e: MapMouseEvent) => {
        const name = e.features?.[0]?.properties?.['kom_namn'] as string | undefined;
        if (name && name !== hoveredRef.current) {
          hoveredRef.current = name;
          map.setFilter(MUNICIPALITY_HOVER_LAYER, ['==', ['get', 'kom_namn'], name]);
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', MUNICIPALITY_FILL_LAYER, () => {
        hoveredRef.current = null;
        map.setFilter(MUNICIPALITY_HOVER_LAYER, ['==', ['get', 'kom_namn'], '']);
        map.getCanvas().style.cursor = '';
      });

      // Click: select municipality
      map.on('click', MUNICIPALITY_FILL_LAYER, (e: MapMouseEvent) => {
        const name = e.features?.[0]?.properties?.['kom_namn'] as string | undefined;
        if (name) selectMunicipality(name);
      });
    },
    [selectMunicipality],
  );

  return (
    <section id={id} className="min-h-[80vh] bg-map-bg">
      <div className="relative w-full h-[80vh]">
        <MapCanvas onMapReady={handleMapReady} />

        {/* Municipality list — always visible */}
        <div className="absolute top-3 right-3 z-10">
          <MunicipalityList
            municipalities={SORTED_MUNICIPALITIES}
            selected={selected}
            onSelect={selectMunicipality}
          />
        </div>

        {/* Controls visible only in detail view */}
        {selected && (
          <div className="absolute bottom-6 left-3 z-10 flex gap-2">
            <BackButton onClick={returnToOverview} />
            <LayerToggle view={view} onChange={setView} />
          </div>
        )}
      </div>
    </section>
  );
}
