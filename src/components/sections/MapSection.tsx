'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Map as MapboxMap } from 'mapbox-gl';

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

export default function MapSection({ id }: MapSectionProps) {
  const mapRef = useRef<MapboxMap | null>(null);

  function handleMapReady(map: MapboxMap) {
    mapRef.current = map;
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
  }

  return (
    <section id={id} className="min-h-[80vh] bg-map-bg">
      <div className="relative w-full h-[80vh]">
        <MapCanvas onMapReady={handleMapReady} />
      </div>
    </section>
  );
}
