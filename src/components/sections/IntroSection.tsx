'use client';

import { useState } from 'react';

interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  const [faktaOpen, setFaktaOpen] = useState(false);

  return (
    <section id={id} className="textured-canvas relative w-full flex flex-col overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-10 flex flex-col flex-1 justify-center pb-10 pt-10 sm:py-20">
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
          className="animate-fade-up font-body font-bold uppercase tracking-wide text-xl sm:text-2xl mb-6 max-w-5xl text-on-canvas/75"
          style={{ animationDelay: '280ms' }}
        >
          <span className="text-accent">Beslutat:</span> 580 000 nya bostäder i Stockholmsregionen.
          <br />
          Förtätningar och försämringar i din trädgård och på ditt torg.
        </p>

        {/* Body text */}
        <div
          className="animate-fade-up max-w-4xl space-y-3 mb-8"
          style={{ animationDelay: '360ms' }}
        >
          <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75">
            Socialdemokraterna, med regionstyrelsens ordförande Aida Hadžialić i spetsen, har drivit
            igenom en ny bostadspolitik i Region Stockholm. Alla Stockholms kommuner ska förtätas
            med storskalig höghusbebyggelse.
          </p>
          <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75">
            Stoppa miljonprogramsplanerna.{' '}
            <span className="text-accent font-bold">
              Rösta bort Socialdemokraterna den 13 september.
            </span>
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
              <p className="font-body text-sm leading-relaxed text-on-canvas/45">
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
          className="animate-fade-up flex items-center gap-3 text-on-canvas/70"
          style={{ animationDelay: '520ms' }}
        >
          <div className="w-8 h-px bg-current flex-shrink-0" />
          <span className="font-body font-bold uppercase text-sm sm:text-lg tracking-[0.15em]">
            Se hur din kommun påverkas
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </section>
  );
}
