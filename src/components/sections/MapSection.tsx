import MapCanvas from '@/components/map/MapCanvas';

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
