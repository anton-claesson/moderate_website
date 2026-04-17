interface MapSectionProps {
  id: string;
}

export default function MapSection({ id }: MapSectionProps) {
  return (
    <section id={id} className="min-h-[80vh] bg-zinc-100">
      <div className="h-full min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Map</p>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-[70vh] rounded-lg bg-zinc-200 border border-dashed border-zinc-400 flex items-center justify-center">
            <span className="text-zinc-500 text-sm">Interactive 3D map — coming in F2.1</span>
          </div>
        </div>
      </div>
    </section>
  );
}
