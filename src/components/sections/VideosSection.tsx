interface VideosSectionProps {
  id: string;
}

export default function VideosSection({ id }: VideosSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-surface-muted">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">Videos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="aspect-video rounded-lg bg-surface border border-dashed border-border flex items-center justify-center"
            >
              <span className="text-text-muted text-sm">Video embed {n} — coming in F1.3</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
