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
  DESKTOP_MAP_PADDING,
  MOBILE_MAP_PADDING,
  DESKTOP_BREAKPOINT,
} from '@/lib/mapConfig';
import MunicipalityCard from '@/components/map/MunicipalityCard';

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
  const housingReadyPromiseRef = useRef<Promise<void> | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const municipalityFeaturesRef = useRef<Map<string, MunicipalityFeature>>(new Map());
  const paddingCleanupRef = useRef<(() => void) | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<HousingView>('current');
  const [housingReady, setHousingReady] = useState(false);
  const [hoveredMunicipality, setHoveredMunicipality] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/municipalities.geojson')
      .then((r) => r.json())
      .then((data: FeatureCollection<Polygon, { kom_namn: string }>) => {
        for (const feature of data.features as MunicipalityFeature[]) {
          municipalityFeaturesRef.current.set(feature.properties.kom_namn, feature);
        }
      });
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Clean up resize listener on unmount
  useEffect(() => {
    return () => {
      paddingCleanupRef.current?.();
    };
  }, []);

  async function ensureHousingReady(map: MapboxMap) {
    if (!housingReadyPromiseRef.current) {
      housingReadyPromiseRef.current = (async () => {
        const data = await fetchHousingData();
        housingDataRef.current = data;
        initHousingLayers(map, ...data);
        setHousingReady(true);
      })();
    }
    await housingReadyPromiseRef.current;
  }

  const selectMunicipality = useCallback(async (name: string) => {
    const map = mapRef.current;
    if (!map) return;
    if (!MUNICIPALITY_CENTROIDS[name]) return;

    setSelected(name);
    setView('current');
    setHoveredMunicipality(null);

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
    setHoveredMunicipality(null);
    hideHousingLayers(map);

    map.setLayoutProperty(MUNICIPALITY_HOVER_LAYER, 'visibility', 'visible');

    map.fitBounds(STOCKHOLM_BOUNDS, {
      padding: 20,
      pitch: OVERVIEW_PITCH,
      bearing: OVERVIEW_BEARING,
      duration: 1200,
    });
  }, []);

  const handleListHover = useCallback((name: string | null) => {
    if (selectedRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    hoveredRef.current = name;
    setHoveredMunicipality(name);
    map.setFilter(MUNICIPALITY_HOVER_LAYER, [
      '==',
      ['get', 'kom_namn'],
      name ?? '',
    ] as mapboxgl.FilterSpecification);
    map.getCanvas().style.cursor = name ? 'pointer' : '';
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

      // Apply camera padding so the region sits left-of-center on desktop
      const updatePadding = () => {
        map.setPadding(
          window.innerWidth >= DESKTOP_BREAKPOINT ? DESKTOP_MAP_PADDING : MOBILE_MAP_PADDING,
        );
      };
      updatePadding();
      window.addEventListener('resize', updatePadding);
      paddingCleanupRef.current = () => window.removeEventListener('resize', updatePadding);

      map.fitBounds(STOCKHOLM_BOUNDS, { padding: 20, duration: 0 });

      map.addSource(MUNICIPALITY_SOURCE, {
        type: 'geojson',
        data: '/data/municipalities.geojson',
      });

      map.addLayer({
        id: MUNICIPALITY_FILL_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
      });

      map.addLayer({
        id: MUNICIPALITY_OUTLINE_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        paint: { 'line-color': '#888888', 'line-width': 1, 'line-opacity': 0.6 },
      });

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
          setHoveredMunicipality(name);
          map.setFilter(MUNICIPALITY_HOVER_LAYER, ['==', ['get', 'kom_namn'], name]);
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', MUNICIPALITY_FILL_LAYER, () => {
        if (selectedRef.current) return;
        hoveredRef.current = null;
        setHoveredMunicipality(null);
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
    <section id={id} className="bg-map-bg">
      {/* Mobile card — stacked above map */}
      <div className="md:hidden">
        <MunicipalityCard
          isMobile={true}
          municipalities={SORTED_MUNICIPALITIES}
          selected={selected}
          view={view}
          hoveredMunicipality={hoveredMunicipality}
          onSelect={selectMunicipality}
          onBack={returnToOverview}
          onViewChange={setView}
          onHoverMunicipality={handleListHover}
        />
      </div>

      {/* Map */}
      <div className="relative h-[70vh] md:h-[80vh]">
        <MapCanvas onMapReady={handleMapReady} />

        {/* Desktop card — floating over ocean area on right */}
        <div className="hidden md:flex absolute top-0 right-6 h-full items-center z-10 pointer-events-none">
          <div className="pointer-events-auto w-[280px]">
            <MunicipalityCard
              isMobile={false}
              municipalities={SORTED_MUNICIPALITIES}
              selected={selected}
              view={view}
              hoveredMunicipality={hoveredMunicipality}
              onSelect={selectMunicipality}
              onBack={returnToOverview}
              onViewChange={setView}
              onHoverMunicipality={handleListHover}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
