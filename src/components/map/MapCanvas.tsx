'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  STOCKHOLM_CENTER,
  STOCKHOLM_BOUNDS,
  OVERVIEW_PITCH,
  OVERVIEW_BEARING,
} from '@/lib/mapConfig';

interface MapCanvasProps {
  style?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export default function MapCanvas({
  style = '/map-style/monochrome-map-style.json',
  onMapReady,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center: STOCKHOLM_CENTER,
      zoom: 8,
      pitch: OVERVIEW_PITCH,
      bearing: OVERVIEW_BEARING,
      maxBounds: STOCKHOLM_BOUNDS,
    });

    mapRef.current = map;

    map.on('load', () => {
      onMapReady?.(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [style, onMapReady]);

  return <div ref={containerRef} className="w-full h-full" />;
}
