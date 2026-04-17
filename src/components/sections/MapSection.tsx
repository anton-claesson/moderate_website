interface MapSectionProps {
  id: string;
}

export default function MapSection({ id }: MapSectionProps) {
  return (
    <section id={id} className="min-h-[80vh] bg-map-bg">
      <div className="h-full min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium text-text-on-dark/60 uppercase tracking-widest">Map</p>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-[70vh] rounded-lg bg-map-bg/50 border border-dashed border-border-strong flex items-center justify-center">
            <span className="text-text-on-dark/60 text-sm">
              Interactive 3D map — coming in F2.1
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
