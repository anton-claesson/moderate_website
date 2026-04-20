'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Map as MapboxMap, MapMouseEvent, LngLatBoundsLike } from 'mapbox-gl';
import type { Feature, Polygon, FeatureCollection } from 'geojson';
import type { HousingCollection, HousingView } from '@/types/housing';
import { MUNICIPALITY_CENTROIDS } from '@/data/municipalityCentroids';
import {
  initHousingLayers,
  showHousingForMunicipality,
  hideHousingLayers,
  setLayerView,
} from '@/lib/housingLayers';
import {
  STOCKHOLM_BOUNDS,
  OVERVIEW_PITCH,
  OVERVIEW_BEARING,
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

type MunicipalityFeature = Feature<Polygon, { kom_namn: string }>;

function computeBounds(feature: MunicipalityFeature): LngLatBoundsLike {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;
  for (const ring of feature.geometry.coordinates) {
    for (const coord of ring) {
      const lng = coord[0] ?? 0;
      const lat = coord[1] ?? 0;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

async function fetchHousingData(): Promise<
  [HousingCollection, HousingCollection, HousingCollection]
> {
  const [smahus, current, newApts] = await Promise.all([
    fetch('/data/housing-smahus.geojson').then((r) => r.json()),
    fetch('/data/housing-flerbostadshus.geojson').then((r) => r.json()),
    fetch('/data/housing-flerbostadshus-new.geojson').then((r) => r.json()),
  ]);
  return [smahus as HousingCollection, current as HousingCollection, newApts as HousingCollection];
}

export default function MapSection({ id }: MapSectionProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const housingDataRef = useRef<[HousingCollection, HousingCollection, HousingCollection] | null>(
    null,
  );
  const housingInitRef = useRef(false);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const municipalityFeaturesRef = useRef<Map<string, MunicipalityFeature>>(new Map());

  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<HousingView>('current');
  const [housingReady, setHousingReady] = useState(false);

  // Preload municipality polygons for bounds computation
  useEffect(() => {
    fetch('/data/municipalities.geojson')
      .then((r) => r.json())
      .then((data: FeatureCollection<Polygon, { kom_namn: string }>) => {
        for (const feature of data.features as MunicipalityFeature[]) {
          municipalityFeaturesRef.current.set(feature.properties.kom_namn, feature);
        }
      });
  }, []);

  // Keep selectedRef in sync for use inside map event handlers
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

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
    if (!MUNICIPALITY_CENTROIDS[name]) return;

    setSelected(name);
    setView('current');

    // Disable hover visuals in detail view
    map.setLayoutProperty(MUNICIPALITY_HOVER_LAYER, 'visibility', 'none');

    await ensureHousingReady(map);
    showHousingForMunicipality(map, name);

    const feature = municipalityFeaturesRef.current.get(name);
    if (feature) {
      map.fitBounds(computeBounds(feature), {
        padding: 60,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
        duration: 1400,
        maxZoom: 14,
      });
    }
  }, []);

  const returnToOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    hideHousingLayers(map);

    // Re-enable hover visuals
    map.setLayoutProperty(MUNICIPALITY_HOVER_LAYER, 'visibility', 'visible');

    map.fitBounds(STOCKHOLM_BOUNDS, {
      padding: 20,
      pitch: OVERVIEW_PITCH,
      bearing: OVERVIEW_BEARING,
      duration: 1200,
    });
  }, []);

  useEffect(() => {
    if (mapRef.current && selected && housingReady) {
      setLayerView(mapRef.current, view);
    }
  }, [view, selected, housingReady]);

  const handleMapReady = useCallback(
    (map: MapboxMap) => {
      mapRef.current = map;

      map.dragPan.disable();
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();

      // Fit full Stockholm Region immediately
      map.fitBounds(STOCKHOLM_BOUNDS, { padding: 20, duration: 0 });

      map.addSource(MUNICIPALITY_SOURCE, {
        type: 'geojson',
        data: '/data/municipalities.geojson',
      });

      // Transparent hit area
      map.addLayer({
        id: MUNICIPALITY_FILL_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
      });

      // Boundary outlines
      map.addLayer({
        id: MUNICIPALITY_OUTLINE_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        paint: { 'line-color': '#888888', 'line-width': 1, 'line-opacity': 0.6 },
      });

      // Hover fill highlight
      map.addLayer({
        id: MUNICIPALITY_HOVER_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#5C8B5A', 'fill-opacity': 0.18 },
        filter: ['==', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
      });

      map.on('mousemove', MUNICIPALITY_FILL_LAYER, (e: MapMouseEvent) => {
        if (selectedRef.current) return;
        const name = e.features?.[0]?.properties?.['kom_namn'] as string | undefined;
        if (name && name !== hoveredRef.current) {
          hoveredRef.current = name;
          map.setFilter(MUNICIPALITY_HOVER_LAYER, ['==', ['get', 'kom_namn'], name]);
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', MUNICIPALITY_FILL_LAYER, () => {
        if (selectedRef.current) return;
        hoveredRef.current = null;
        map.setFilter(MUNICIPALITY_HOVER_LAYER, ['==', ['get', 'kom_namn'], '']);
        map.getCanvas().style.cursor = '';
      });

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

        <div className="absolute top-3 right-3 z-10">
          <MunicipalityList
            municipalities={SORTED_MUNICIPALITIES}
            selected={selected}
            onSelect={selectMunicipality}
          />
        </div>

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
