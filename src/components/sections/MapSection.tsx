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
  SMAHUS_COLOR,
  FLERBOSTADSHUS_COLOR,
  FLERBOSTADSHUS_NEW_COLOR,
} from '@/lib/mapConfig';
import MunicipalityCard from '@/components/map/MunicipalityCard';
import StatsCard from '@/components/map/StatsCard';
import LayerToggle from '@/components/map/LayerToggle';
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
  initialMunicipality?: string;
}

const OVERVIEW_PADDING_DESKTOP = { top: 20, bottom: 20, left: 20, right: 220 };
const OVERVIEW_PADDING_MOBILE = { top: 20, bottom: 20, left: 0, right: 60 };

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

function setHighlight(map: MapboxMap, name: string | null) {
  if (!map.isStyleLoaded()) {
    map.once('idle', () => setHighlight(map, name));
    return;
  }
  if (map.getLayer(MUNICIPALITY_HOVER_LAYER)) {
    const filter = ['==', ['get', 'kom_namn'], name ?? ''] as mapboxgl.FilterSpecification;
    map.setFilter(MUNICIPALITY_HOVER_LAYER, filter);
    map.setFilter(MUNICIPALITY_OUTLINE_HOVER_LAYER, filter);
  }
}

export default function MapSection({ id, initialMunicipality }: MapSectionProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const housingDataRef = useRef<[HousingCollection, HousingCollection, HousingCollection] | null>(
    null,
  );
  const housingReadyPromiseRef = useRef<Promise<void> | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const municipalityFeaturesRef = useRef<Map<string, MunicipalityFeature>>(new Map());

  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<HousingView>('planned');
  const [infoOpen, setInfoOpen] = useState(false);
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

  const selectMunicipality = useCallback(async (name: string) => {
    const map = mapRef.current;
    if (!map) return;
    if (!MUNICIPALITY_CENTROIDS[name]) return;

    selectedRef.current = name;
    setSelected(name);
    setView('planned');
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
    if (selectedRef.current !== name) return; // User navigated away before loading finished
    showHousingForMunicipality(map, name, 'planned');

    const feature = municipalityFeaturesRef.current.get(name);
    if (feature) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const bounds = computeBounds(feature);
      // Desktop: reserve right side for the 260px stats panel (+140px buffer).
      // Mobile: stats panel is below the map, so uniform padding.
      const padding = isMobile ? 20 : { top: 40, bottom: 40, left: 60, right: 400 };

      const camera = map.cameraForBounds(bounds as mapboxgl.LngLatBoundsLike, {
        padding,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
      });

      if (camera && camera.zoom !== undefined && camera.center) {
        const b = bounds as [[number, number], [number, number]];
        const latSpan = b[1][1] - b[0][1];
        const centerLng = (b[0][0] + b[1][0]) / 2;
        const centerLat = (b[0][1] + b[1][1]) / 2;

        // Compute the centroid of planned (red) buildings for this municipality so the
        // camera centers on the cluster rather than the municipality bounding-box midpoint.
        // Falls back to the bbox midpoint when no red buildings exist.
        let targetLng = centerLng;
        let targetLat = centerLat;
        const housingNew = housingDataRef.current?.[2];
        if (housingNew) {
          const redFeatures = housingNew.features.filter((f) => f.properties.municipality === name);
          if (redFeatures.length > 0) {
            let sumLng = 0;
            let sumLat = 0;
            for (const f of redFeatures) {
              const ring = f.geometry.coordinates[0]!;
              const n = ring.length - 1;
              let rLng = 0;
              let rLat = 0;
              for (let i = 0; i < n; i++) {
                rLng += ring[i]![0] ?? 0;
                rLat += ring[i]![1] ?? 0;
              }
              sumLng += rLng / n;
              sumLat += rLat / n;
            }
            targetLng = sumLng / redFeatures.length;
            targetLat = sumLat / redFeatures.length;
          }
        }

        // Dynamic adjustments based on municipality size (base camera.zoom)
        // Smaller camera zoom = larger municipality (e.g. ~7.5).
        // Larger camera zoom = smaller municipality (e.g. ~10.5).
        const maxZoomDelta = isMobile ? 0.65 : 0.7;
        const minZoomDelta = isMobile ? 1.1 : 1.1;

        const zoomProgress = Math.max(0, Math.min(1, (camera.zoom - 7.5) / 3.0));
        const zoomDelta = minZoomDelta + zoomProgress * (maxZoomDelta - minZoomDelta);

        // Pitch adjustment: steeper pitch for large municipalities to make buildings pop more.
        const dynamicPitch = Math.max(DEFAULT_PITCH, Math.min(68, 68 - (camera.zoom - 8.5) * 6));

        // Interpolate target center to prevent pushing the polygon off-screen in large municipalities.
        const centerMix = Math.max(0.4, Math.min(1.0, (camera.zoom - 8.5) * 0.2 + 0.4));
        const finalTargetLng = targetLng * centerMix + centerLng * (1 - centerMix);
        const finalTargetLat = targetLat * centerMix + centerLat * (1 - centerMix);

        // Shift south so pitch compensation puts the cluster at the visual centre of the viewport.
        const newCenter = {
          lng: finalTargetLng,
          lat: finalTargetLat - latSpan * (0.1 * centerMix),
        };

        map.flyTo({
          ...camera,
          center: newCenter,
          zoom: camera.zoom + zoomDelta,
          pitch: dynamicPitch,
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

    selectedRef.current = null;
    setSelected(null);
    setView('planned');
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
      padding: isMobileOverview ? OVERVIEW_PADDING_MOBILE : OVERVIEW_PADDING_DESKTOP,
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
        padding: isMobileInit ? OVERVIEW_PADDING_MOBILE : OVERVIEW_PADDING_DESKTOP,
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
        paint: { 'fill-color': '#e8e4de', 'fill-opacity': 0.85 },
      });

      // Transparent hit area
      map.addLayer({
        id: MUNICIPALITY_FILL_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#f0ece6', 'fill-opacity': 0.75 },
      });

      // Base boundary outlines
      map.addLayer({
        id: MUNICIPALITY_OUTLINE_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#555555', 'line-width': 1.5, 'line-opacity': 0.8 },
      });

      // Hover/selected fill highlight
      map.addLayer({
        id: MUNICIPALITY_HOVER_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#1a1a1a', 'fill-opacity': 0.25 },
        filter: ['==', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
      });

      // Bright outline on hover or selection
      map.addLayer({
        id: MUNICIPALITY_OUTLINE_HOVER_LAYER,
        type: 'line',
        source: MUNICIPALITY_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#b91c1c', 'line-width': 3, 'line-opacity': 1.0 },
        filter: ['==', ['get', 'kom_namn'], ''] as mapboxgl.FilterSpecification,
      });

      const isMobileMap = typeof window !== 'undefined' && window.innerWidth < 768;

      // Dark overlay to dim surrounding municipalities in detail view
      map.addLayer({
        id: MUNICIPALITY_DIM_LAYER,
        type: 'fill',
        source: MUNICIPALITY_SOURCE,
        paint: { 'fill-color': '#f0ece6', 'fill-opacity': 0.7 },
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
          'text-size': isMobileMap ? 10 : 13,
          'text-anchor': 'center',
          'text-max-width': 8,
          'text-allow-overlap': false,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
          visibility: 'none',
        },
        paint: {
          'text-color': '#555555',
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
          'text-size': isMobileMap ? 14 : 20,
          'text-anchor': 'center',
          'text-max-width': 8,
          'text-allow-overlap': true,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.15,
        },
        paint: {
          'text-color': '#555555',
          'text-opacity': 1.0,
          'text-halo-color': '#ffffff',
          'text-halo-width': isMobileMap ? 2 : 4,
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

      // Handle gestures (trackpad pinch/scroll out, mobile pinch out) to return to overview
      const container = map.getContainer();
      let initialPinchDistance: number | null = null;
      let isReturning = false;

      const handleWheel = (e: WheelEvent) => {
        // Trackpad pinch-to-zoom sets ctrlKey=true. Ignore normal scroll.
        if (e.ctrlKey) {
          e.preventDefault(); // Stop full-page browser zoom
          // deltaY > 0 means pinching fingers together (zooming out)
          if (selectedRef.current && Number(e.deltaY) > 5 && !isReturning) {
            isReturning = true;
            returnToOverview();
            setTimeout(() => {
              isReturning = false;
            }, 1000);
          }
        }
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2 && e.touches[0] && e.touches[1] && selectedRef.current) {
          initialPinchDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY,
          );
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (
          e.touches.length === 2 &&
          e.touches[0] &&
          e.touches[1] &&
          initialPinchDistance !== null &&
          selectedRef.current
        ) {
          const currentDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY,
          );
          // Distance decreasing means zooming out (pinching fingers together)
          if (initialPinchDistance - currentDistance > 30) {
            if (!isReturning) {
              isReturning = true;
              returnToOverview();
              setTimeout(() => {
                isReturning = false;
              }, 1000);
            }
            initialPinchDistance = null;
          }
        }
      };

      const handleTouchEnd = () => {
        initialPinchDistance = null;
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });

      // Handle deep linking on init
      if (initialMunicipality && initialMunicipality in MUNICIPALITY_CENTROIDS) {
        selectMunicipality(initialMunicipality);
      }
    },
    [selectMunicipality, initialMunicipality, returnToOverview],
  );

  return (
    <section id={id} className="bg-primary-light py-6 px-4 md:px-48 lg:px-70 md:py-8">
      {/* Mobile list card — above map, dropdown selector replaces list */}
      <div className="md:hidden mb-4 relative">
        <select
          value={selected || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val) selectMunicipality(val);
            else returnToOverview();
          }}
          className="w-full p-4 pr-10 rounded-2xl bg-white shadow-xl font-bold tracking-wide text-xl text-[#111111] appearance-none focus:outline-none focus:ring-2 focus:ring-black/20 border-0"
        >
          <option value="">Välj kommun...</option>
          {SORTED_MUNICIPALITIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="24" height="12" viewBox="0 0 36 18" fill="none" className="opacity-50">
            <path
              d="M2 2L18 16L34 2"
              stroke="#9ca3af"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Map — floating box with rounded corners */}
      <div className="relative h-[60vh] md:h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-black/10">
        <MapCanvas onMapReady={handleMapReady} />

        {/* Transparent overlay to block Mapbox attribution clicks, sits behind info button */}
        <div className="absolute bottom-0 left-0 w-72 h-10 z-[9] bg-transparent" />

        {/* Desktop toggle — top-left of map, always visible */}
        <div className="hidden md:block absolute top-4 left-4 z-10 w-80">
          <LayerToggle view={view} onChange={setView} />
        </div>

        {/* Info button + panel — bottom left */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col items-start gap-2">
          {infoOpen && (
            <div className="bg-white rounded-xl shadow-lg p-3 w-64 text-xs text-[#111111]">
              <p className="font-bold uppercase tracking-wide text-[10px] text-gray-400 mb-2">
                Teckenförklaring
              </p>
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M2 9L9 2L16 9V16H12V11H6V16H2V9Z" fill={SMAHUS_COLOR} />
                  </svg>
                  <span>= 100 småhus</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="15" height="18" viewBox="0 0 15 18" fill="none" aria-hidden="true">
                    <rect x="0" y="2" width="15" height="16" rx="0.5" fill={FLERBOSTADSHUS_COLOR} />
                    <rect x="2" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="6" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="10" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="2" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="6" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                  </svg>
                  <span>= 1 000 lägenheter (idag)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="15" height="18" viewBox="0 0 15 18" fill="none" aria-hidden="true">
                    <rect
                      x="0"
                      y="2"
                      width="15"
                      height="16"
                      rx="0.5"
                      fill={FLERBOSTADSHUS_NEW_COLOR}
                    />
                    <rect x="2" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="6" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="10" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="2" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="6" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
                  </svg>
                  <span>= 1 000 lägenheter (planerade)</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-2 text-gray-500 leading-relaxed">
                Enheterna är representativa och visar inte exakta adresser för befintliga bostäder.
                Planerad nybyggnation baseras på RUFS Bebyggelsestruktur.
              </div>
            </div>
          )}
          <button
            onClick={() => setInfoOpen((o) => !o)}
            aria-label="Visa information om kartan"
            className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#555555] hover:bg-white transition-colors"
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </button>
        </div>

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

        {/* Desktop Stats card — hidden on mobile */}
        <div
          className={`hidden md:block absolute top-4 right-4 z-20 w-[260px] transition-opacity duration-300 ease-in-out ${
            selected && stats ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {displayStats && (
            <StatsCard
              selected={displayStats.name}
              stats={displayStats.stats}
              view={view}
              onBack={returnToOverview}
            />
          )}
        </div>
      </div>

      {/* Mobile toggle — always visible below map, full width to match the dropdown above */}
      <div className="md:hidden mt-3">
        <LayerToggle view={view} onChange={setView} className="w-full" />
      </div>

      {/* Mobile Stats panel — below map */}
      {selected && stats && displayStats && (
        <div className="md:hidden mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <StatsCard
            selected={displayStats.name}
            stats={displayStats.stats}
            view={view}
            onBack={returnToOverview}
          />
        </div>
      )}
    </section>
  );
}
