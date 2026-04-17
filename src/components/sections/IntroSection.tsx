interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-surface">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">Intro</p>
        <div className="h-32 rounded-lg bg-primary-light border border-dashed border-border flex items-center justify-center">
          <span className="text-text-muted text-sm">Project description — coming in F1.2</span>
        </div>
      </div>
    </section>
  );
}
