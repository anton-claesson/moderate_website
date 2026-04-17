interface VideosSectionProps {
  id: string;
}

export default function VideosSection({ id }: VideosSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-white">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">Videos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="aspect-video rounded-lg bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center"
            >
              <span className="text-zinc-400 text-sm">Video embed {n} — coming in F1.3</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
