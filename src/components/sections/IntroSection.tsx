'use client';

import { useState } from 'react';

interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  const [faktaOpen, setFaktaOpen] = useState(false);

  return (
    <section id={id} className="textured-canvas relative w-full flex flex-col overflow-hidden">
      {/* Decorative bird silhouettes — hero only (Chunk 11). Sits above the grain
          (::after, z-0) and below the content (z-10). `position` is set inline
          because the unlayered `.textured-canvas > *` rule would otherwise force
          `position: relative` over Tailwind's layered `absolute` utility. Angular
          wings (not round) + a turbulence displacement give a distressed look. */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute' }}
        className="pointer-events-none right-4 top-10 w-28 sm:w-44 text-black/50"
        viewBox="0 0 200 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <filter id="bird-distress">
            <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
          </filter>
        </defs>
        <g filter="url(#bird-distress)">
          <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(6 12) scale(1.1)" />
          <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(62 2) scale(0.8)" />
          <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(126 22) scale(1.3)" />
          <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(40 44) scale(0.7)" />
          <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(150 58) scale(0.95)" />
        </g>
      </svg>
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

        {/* Subheading */}
        <p
          className="animate-fade-up font-body font-bold uppercase tracking-wide text-lg sm:text-2xl mb-6 max-w-6xl text-on-canvas/75 hyphens-auto"
          style={{ animationDelay: '280ms' }}
        >
          Nya miljonprogram med 580 000 fler bostäder bara i Stockholmsregionen.
        </p>

        {/* Body text */}
        <div
          className="animate-fade-up max-w-4xl space-y-3 mb-8"
          style={{ animationDelay: '360ms' }}
        >
          <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
            Socialdemokraterna, med regionstyrelsens ordförande Aida Hadžialić i spetsen, har drivit
            igenom en ny bostadspolitik i Region Stockholm. Alla Stockholms kommuner ska förtätas
            med storskalig höghusbebyggelse.
          </p>
          <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
            Stoppa miljonprogramsplanerna.{' '}
            <span className="font-bold">Rösta bort Socialdemokraterna den 13 september.</span>
          </p>
        </div>

        {/* Fakta accordion */}
        <div className="animate-fade-up mb-10 max-w-3xl" style={{ animationDelay: '440ms' }}>
          <button
            onClick={() => setFaktaOpen((o) => !o)}
            className="font-body text-sm sm:text-base font-semibold underline underline-offset-4 transition-colors duration-150 focus:outline-none text-on-canvas/45"
          >
            {faktaOpen ? 'Dölj fakta' : 'Fakta om planen'}
          </button>
          {faktaOpen && (
            <div className="mt-3 border-l-2 border-on-canvas/15 pl-4">
              <p className="font-body text-sm leading-relaxed text-on-canvas/45 hyphens-auto">
                <strong className="text-on-canvas/70">Fakta: </strong>
                Socialdemokraterna, Vänsterpartiet, Miljöpartiet och Centerpartiet i Region
                Stockholm har beslutat om en ny regional utvecklingsplan. I planen fastställs hur
                många bostäder varje kommun ska bygga och på vilka ytor. I praktiken innebär detta
                att kommuner pressas att bygga högt och tätt i redan bebyggda områden för att leva
                upp till regionens krav. Konsekvensen är att grönområden och villaområden riskerar
                att tas i anspråk till förmån för nya, storskaliga bostadsområden. Planen är kopplad
                till regionala investeringar. Kommuner som motsätter sig inriktningen hotas med
                indragna satsningar på kollektivtrafik, infrastruktur och vård.
              </p>
            </div>
          )}
        </div>

        {/* CTA row */}
        <div
          className="animate-fade-up flex items-center gap-3 text-on-canvas/90"
          style={{ animationDelay: '520ms' }}
        >
          <span className="font-display uppercase text-3xl sm:text-4xl leading-snug">
            Se hur <span className="text-accent">din kommun</span> påverkas
          </span>
        </div>
      </div>
    </section>
  );
}
