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
  MUNICIPALITY_OUTLINE_HOVER_LAYER,
  MUNICIPALITY_DIM_LAYER,
  MUNICIPALITY_LABELS_ALL_LAYER,
  MUNICIPALITY_LABELS_SELECTED_LAYER,
} from '@/lib/mapConfig';
import MunicipalityCard from '@/components/map/MunicipalityCard';
import StatsCard from '@/components/map/StatsCard';
import { HOUSING_STATS } from '@/data/housingStats';
import type { MunicipalityStats } from '@/data/housingStats';

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

const OVERVIEW_PADDING_DESKTOP = { top: 20, bottom: 20, left: 20, right: 220 };

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

  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<HousingView>('current');
  const stats = selected != null ? (HOUSING_STATS[selected] ?? null) : null;

  // Retains the last selected municipality's data so StatsCard stays mounted
  // during the fade-out transition when returning to the list view.
  const [displayStats, setDisplayStats] = useState<{
    name: string;
    stats: MunicipalityStats;
  } | null>(null);
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

  async function ensureHousingReady(map: MapboxMap) {
    if (!housingReadyPromiseRef.current) {
      housingReadyPromiseRef.current = (async () => {
        const data = await fetchHousingData();
        housingDataRef.current = data;
        initHousingLayers(map, ...data);
        // Extrusion layers are added below the existing label layers in the stack —
        // move labels back to the top so they render above buildings.
        if (map.getLayer(MUNICIPALITY_LABELS_ALL_LAYER))
          map.moveLayer(MUNICIPALITY_LABELS_ALL_LAYER);
        if (map.getLayer(MUNICIPALITY_LABELS_SELECTED_LAYER))
          map.moveLayer(MUNICIPALITY_LABELS_SELECTED_LAYER);
        setHousingReady(true);
      })();
    }
    await housingReadyPromiseRef.current;
  }

  function setHighlight(map: MapboxMap, name: string | null) {
    if (!map.isStyleLoaded() || !map.getLayer(MUNICIPALITY_HOVER_LAYER)) return;
    const filter = ['==', ['get', 'kom_namn'], name ?? ''] as mapboxgl.FilterSpecification;
    map.setFilter(MUNICIPALITY_HOVER_LAYER, filter);
    map.setFilter(MUNICIPALITY_OUTLINE_HOVER_LAYER, filter);
  }

  const selectMunicipality = useCallback(async (name: string) => {
    const map = mapRef.current;
    if (!map) return;
    if (!MUNICIPALITY_CENTROIDS[name]) return;

    setSelected(name);
    setView('current');
    setHoveredMunicipality(null);
    const municipalityStats = HOUSING_STATS[name];
    if (municipalityStats) setDisplayStats({ name, stats: municipalityStats });

    setHighlight(map, name);

    map.setFilter(MUNICIPALITY_DIM_LAYER, [
      '!=',
      ['get', 'kom_namn'],
      name,
    ] as mapboxgl.FilterSpecification);
    map.setLayoutProperty(MUNICIPALITY_DIM_LAYER, 'visibility', 'visible');

    // Show labels in detail view — exclude selected name from all-layer so it only renders once
    if (map.getLayer(MUNICIPALITY_LABELS_ALL_LAYER)) {
      map.setFilter(MUNICIPALITY_LABELS_ALL_LAYER, [
        '!=',
        ['get', 'kom_namn'],
        name,
      ] as mapboxgl.FilterSpecification);
      map.setLayoutProperty(MUNICIPALITY_LABELS_ALL_LAYER, 'visibility', 'visible');
    }
    if (map.getLayer(MUNICIPALITY_LABELS_SELECTED_LAYER)) {
      map.setFilter(MUNICIPALITY_LABELS_SELECTED_LAYER, [
        '==',
        ['get', 'kom_namn'],
        name,
      ] as mapboxgl.FilterSpecification);
    }

    await ensureHousingReady(map);
    showHousingForMunicipality(map, name);

    const feature = municipalityFeaturesRef.current.get(name);
    if (feature) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const bounds = computeBounds(feature);
      const padding = isMobile ? 20 : { top: 40, bottom: 40, left: 60, right: 400 };

      const camera = map.cameraForBounds(bounds as mapboxgl.LngLatBoundsLike, {
        padding,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
      });

      if (camera && camera.zoom !== undefined && camera.center) {
        // Shift the center south (lower latitude) proportionally to the bounds
        // This ensures the bottom of the municipality stays visible when zooming in tighter,
        // while allowing the top to crop out, which also compensates for the 55° pitch.
        const b = bounds as [[number, number], [number, number]];
        const latSpan = b[1][1] - b[0][1];

        // Calculate the geographic center manually to avoid Mapbox LngLat struct ambiguities
        const centerLng = (b[0][0] + b[1][0]) / 2;
        const centerLat = (b[0][1] + b[1][1]) / 2;

        const newCenter = {
          lng: centerLng,
          lat: centerLat - latSpan * 0.25,
        };

        map.flyTo({
          ...camera,
          center: newCenter,
          zoom: camera.zoom + 1.3, // Zoom tighter to focus on housing
          duration: 1200,
          essential: true,
        });
      } else {
        map.fitBounds(bounds, {
          padding,
          pitch: DEFAULT_PITCH,
          bearing: DEFAULT_BEARING,
          duration: 1200,
        });
      }
    }
  }, []);

  const returnToOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    setHoveredMunicipality(null);
    hideHousingLayers(map);

    setHighlight(map, null);
    map.setLayoutProperty(MUNICIPALITY_DIM_LAYER, 'visibility', 'none');

    // Hide labels in overview and reset filter
    if (map.getLayer(MUNICIPALITY_LABELS_ALL_LAYER)) {
      map.setFilter(MUNICIPALITY_LABELS_ALL_LAYER, null);
      map.setLayoutProperty(MUNICIPALITY_LABELS_ALL_LAYER, 'visibility', 'none');
    }
    if (map.getLayer(MUNICIPALITY_LABELS_SELECTED_LAYER)) {
      map.setFilter(MUNICIPALITY_LABELS_SELECTED_LAYER, [
        '==',
        ['get', 'kom_namn'],
        '',
      ] as mapboxgl.FilterSpecification);
    }

    const isMobileOverview = typeof window !== 'undefined' && window.innerWidth < 768;
    map.fitBounds(STOCKHOLM_BOUNDS, {
      padding: isMobileOverview ? 20 : OVERVIEW_PADDING_DESKTOP,
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
    setHighlight(map, name);
    const canvas = map.getCanvas();
    if (canvas) canvas.style.cursor = name ? 'pointer' : '';
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

      const isMobileInit = typeof window !== 'undefined' && window.innerWidth < 768;
      map.fitBounds(STOCKHOLM_BOUNDS, {
        padding: isMobileInit ? 20 : OVERVIEW_PADDING_DESKTOP,
        duration: 0,
      });

      map.addSource(MUNICIPALITY_SOURCE, {
        type: 'geojson',
        data: '/data/municipalities.geojson',
      });

      // Point source for labels — one point per municipality to prevent tile-boundary duplicates
      map.addSource('municipality-labels', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: Object.entries(MUNICIPALITY_CENTROIDS).map(([name, coords]) => ({
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: coords },
            properties: { kom_namn: name },
          })),
        },
      });

      // Neighboring regions (Uppsala, Västmanland, Södermanland) — muted, non-interactive
      map.addSource('neighboring-regions', {
        type: 'geojson',
        data: '/data/neighboring-regions.geojson',
      });
      map.addLayer({
        id: 'neighboring-regions-fill',
        type: 'fill',
        source: 'neighboring-regions',
        paint: { 'fill-color': '#f0f0ea', 'fill-opacity': 0.9 }, // Muted surface color, less yellow
      });

      // Transparent hit area
      map.addLayer({
        id: MUNICIPALITY_FILL_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#edf4ec', 'fill-opacity': 0.8 }, // Primary light
      });

      // Base boundary outlines
      map.addLayer({
        id: MUNICIPALITY_OUTLINE_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#8fad8e', 'line-width': 2.5, 'line-opacity': 0.9 }, // Border strong
      });

      // Hover/selected fill highlight
      map.addLayer({
        id: MUNICIPALITY_HOVER_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#5c8b5a', 'fill-opacity': 0.4 }, // Primary color tint
        filter: ['==', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
      });

      // Bright outline on hover or selection
      map.addLayer({
        id: MUNICIPALITY_OUTLINE_HOVER_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#e8a838', 'line-width': 4, 'line-opacity': 1.0 }, // Accent
        filter: ['==', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
      });

      // Dark overlay to dim surrounding municipalities in detail view
      map.addLayer({
        id: MUNICIPALITY_DIM_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#edf4ec', 'fill-opacity': 0.8 },
        filter: ['!=', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
        layout: { visibility: 'none' },
      });

      // All municipality labels — hidden in overview, shown in detail view
      map.addLayer({
        id: MUNICIPALITY_LABELS_ALL_LAYER,
        type: 'symbol',
        source: 'municipality-labels',
        layout: {
          'text-field': ['get', 'kom_namn'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 13,
          'text-anchor': 'center',
          'text-max-width': 8,
          'text-allow-overlap': false,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
          visibility: 'none',
        },
        paint: {
          'text-color': '#3a5c39', // Primary dark
          'text-opacity': 0.8,
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      });

      // Selected municipality label (prominent, always on top)
      map.addLayer({
        id: MUNICIPALITY_LABELS_SELECTED_LAYER,
        type: 'symbol',
        source: 'municipality-labels',
        filter: ['==', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
        layout: {
          'text-field': ['get', 'kom_namn'],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 24,
          'text-anchor': 'center',
          'text-max-width': 8,
          'text-allow-overlap': true,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.15,
        },
        paint: {
          'text-color': '#3a5c39',
          'text-opacity': 1.0,
          'text-halo-color': '#ffffff',
          'text-halo-width': 4,
        },
      });

      map.on('mousemove', MUNICIPALITY_FILL_LAYER, (e: MapMouseEvent) => {
        if (selectedRef.current) return;
        const name = e.features?.[0]?.properties?.['kom_namn'] as string | undefined;
        if (name && name !== hoveredRef.current) {
          hoveredRef.current = name;
          setHoveredMunicipality(name);
          setHighlight(map, name);
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', MUNICIPALITY_FILL_LAYER, () => {
        if (selectedRef.current) return;
        hoveredRef.current = null;
        setHoveredMunicipality(null);
        setHighlight(map, null);
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
    <section id={id} className="bg-primary-light py-6 px-4 md:px-44 lg:px-60 md:py-8">
      {/* Mobile list card — above map, hidden when a municipality is selected */}
      {!selected && (
        <div className="md:hidden mb-2">
          <MunicipalityCard
            isMobile={true}
            municipalities={SORTED_MUNICIPALITIES}
            selected={null}
            view={view}
            hoveredMunicipality={hoveredMunicipality}
            onSelect={selectMunicipality}
            onBack={returnToOverview}
            onViewChange={setView}
            onHoverMunicipality={handleListHover}
          />
        </div>
      )}

      {/* Map — floating box with rounded corners */}
      <div className="relative h-[70vh] md:h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-black/10">
        <MapCanvas onMapReady={handleMapReady} />

        {/* Desktop list card — always mounted for crossfade; fades out when selected */}
        <div
          className={`hidden md:block absolute top-4 right-4 z-10 w-[260px] h-[calc(100%-3rem)] transition-opacity duration-300 ease-in-out ${
            selected ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
        >
          <MunicipalityCard
            isMobile={false}
            municipalities={SORTED_MUNICIPALITIES}
            selected={null}
            view={view}
            hoveredMunicipality={hoveredMunicipality}
            onSelect={selectMunicipality}
            onBack={returnToOverview}
            onViewChange={setView}
            onHoverMunicipality={handleListHover}
          />
        </div>

        {/* Stats card — always mounted with last-known data for smooth crossfade */}
        <div
          className={`absolute top-3 right-3 md:top-4 md:right-4 z-20 w-[220px] md:w-[260px] transition-opacity duration-300 ease-in-out ${
            selected && stats ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {displayStats && (
            <StatsCard
              selected={displayStats.name}
              stats={displayStats.stats}
              view={view}
              onBack={returnToOverview}
              onViewChange={setView}
            />
          )}
        </div>
      </div>
    </section>
  );
}
