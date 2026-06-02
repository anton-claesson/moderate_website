'use client';

import { useState } from 'react';
import BirdFlock from '@/components/ui/BirdFlock';

interface IntroInfoSectionProps {
  id: string;
}

export default function IntroInfoSection({ id }: IntroInfoSectionProps) {
  const [faktaOpen, setFaktaOpen] = useState(false);

  return (
    <section id={id} className="textured-canvas cv-section overflow-hidden">
      <BirdFlock
        filterId="birds-info"
        variant="info"
        className="right-2 sm:right-10 top-6 w-44 sm:w-72"
      />
      <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-10 py-8 sm:py-12">
        {/* Body text */}
        <div className="max-w-5xl space-y-3 mb-8">
          <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
            Socialdemokraterna, med regionstyrelsens ordförande Aida Hadžialić i spetsen, har drivit
            igenom en ny bostadspolitik i Region Stockholm. Alla Stockholms kommuner ska förtätas
            med storskalig höghusbebyggelse.
          </p>
        </div>

        {/* Fakta accordion */}
        <div className="max-w-5xl">
          <button
            onClick={() => setFaktaOpen((o) => !o)}
            className="font-body text-base sm:text-lg font-semibold underline underline-offset-4 transition-colors duration-150 focus:outline-none text-on-canvas/45"
          >
            {faktaOpen ? 'Dölj fakta' : 'Fakta om planen'}
          </button>
          {faktaOpen && (
            <div className="mt-3 border-l-2 border-on-canvas/15 pl-4">
              <p className="font-body text-sm sm:text-base leading-relaxed text-on-canvas/45 hyphens-auto">
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
      </div>
    </section>
  );
}
