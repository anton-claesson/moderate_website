'use client';

import dynamic from 'next/dynamic';

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
  return (
    <section id={id} className="min-h-[80vh] bg-map-bg">
      <div className="w-full h-[80vh]">
        <MapCanvas />
      </div>
    </section>
  );
}
