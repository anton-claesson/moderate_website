import BirdFlock from '@/components/ui/BirdFlock';

interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section id={id} className="textured-canvas relative w-full flex flex-col overflow-hidden">
      <BirdFlock filterId="birds-hero" variant="hero" className="right-4 top-10 w-52 sm:w-120" />
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-10 flex flex-col flex-1 justify-center pt-10 pb-6 sm:pt-20 sm:pb-10">
        {/* Red bar above title */}
        <div
          className="animate-fade-up w-16 h-px bg-accent mb-6"
          style={{ animationDelay: '0ms' }}
        />

        {/* Main headline */}
        <h1
          className="animate-fade-up font-display text-on-canvas leading-[0.95] mb-8"
          style={{ fontSize: 'min(10vw, 6.5rem)', animationDelay: '80ms' }}
        >
          STOPPA (S) NYA
          <br />
          <span className="text-accent">MILJONPROGRAM</span>
        </h1>

        {/* Red rule */}
        <div
          className="animate-fade-up w-20 h-px bg-accent mb-6"
          style={{ animationDelay: '200ms' }}
        />

        {/* CTA row — lead-in to the map below */}
        <div
          className="animate-fade-up flex items-center gap-3 text-on-canvas/90"
          style={{ animationDelay: '360ms' }}
        >
          <span className="font-display uppercase text-3xl sm:text-4xl leading-snug">
            Se hur <span className="text-accent">din kommun</span> påverkas
          </span>
        </div>
      </div>
    </section>
  );
}
