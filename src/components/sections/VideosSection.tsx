interface VideosSectionProps {
  id: string;
}

const VIDEOS: { id: string; title: string }[] = [
  { id: 'y90h0n7vOrc', title: 'Video 1' },
  { id: 'qCSfy670df4', title: 'Video 2' },
];

export default function VideosSection({ id }: VideosSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-surface-muted">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Videos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VIDEOS.map((video) => (
            <div
              key={video.id}
              className="aspect-video rounded-lg overflow-hidden bg-surface shadow-sm"
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
