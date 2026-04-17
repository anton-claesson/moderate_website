interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-white">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">Intro</p>
        <div className="h-32 rounded-lg bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center">
          <span className="text-zinc-400 text-sm">Project description — coming in F1.2</span>
        </div>
      </div>
    </section>
  );
}
