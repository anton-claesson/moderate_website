'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapCanvasProps {
  style?: string | mapboxgl.Style;
}

export default function MapCanvas({
  style = 'mapbox://styles/mapbox/streets-v12',
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center: [18.05, 59.30],
      zoom: 9,
      maxBounds: [[17.5, 59.0], [18.6, 59.6]],
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [style]);

  return <div ref={containerRef} className="w-full h-full" />;
}
