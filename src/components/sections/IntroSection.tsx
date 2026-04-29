'use client';

import { useState } from 'react';

interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  const [faktaOpen, setFaktaOpen] = useState(false);

  return (
    <section
      id={id}
      className="min-h-[10vh] w-full flex flex-col items-center center bg-primary-light"
    >
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 pt-5 sm:pt-10 sm:pb-6">
        <h2
          className="font-bold text-center leading-[1.1] mb-8 mt-5 sm:mt-5 sm:mb-10 uppercase w-full"
          style={{ fontSize: 'min(7.5vw, 5rem)', fontFamily: 'var(--font-oswald)' }}
        >
          Stoppa <span className="text-red-700">Miljonprogrammen </span>
          <br className="sm:hidden" /> – Riv Bilagan!
        </h2>
        <div className="mx-auto max-w-5xl sm:px-13 text-slate-900 space-y-2 sm:space-y-5">
          <p
            className="text-lg sm:text-3xl font-bold leading-snug uppercase tracking-wide mb-4"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            <span className="text-red-700">Beslutat: </span>
            577 000 nya lägenheter i Region Stockholm. Nya miljonprogram – i parken, vid torget och
            där du bor.
          </p>

          <p className="text-sm sm:text-xl leading-relaxed">
            Planen drivs av Socialdemokraterna i Region Stockholm och har klubbats igenom av
            ordförande Aida Hadzialic (S). I en bilaga målas kommun efter kommun upp för snabb,
            genomgripande förändring – med tät, storskalig bebyggelse.
          </p>

          <p className="text-sm sm:text-xl leading-relaxed">
            Riv upp bilagan. Ställ de ansvariga till svars.
          </p>

          <div>
            <button
              onClick={() => setFaktaOpen((o) => !o)}
              className="text-sm sm:text-xl font-semibold text-text-muted underline underline-offset-2 focus:outline-none"
            >
              {faktaOpen ? 'Dölj fakta' : 'Läs fakta om planen'}
            </button>
            {faktaOpen && (
              <p className="mt-2 text-sm sm:text-xl sm:text-base text-text-muted leading-relaxed">
                <strong>Fakta: </strong>
                Socialdemokraterna, Vänsterpartiet, Miljöpartiet och Centerpartiet i Region
                Stockholm har beslutat om en ny regional utvecklingsplan. I planen ingår en bilaga
                som fastställer hur många bostäder varje kommun ska bygga – på begränsad yta. I
                praktiken innebär det att kommuner pressas att bygga högt och tätt i redan bebyggda
                områden för att nå målen. Konsekvensen är att grönytor, småhusområden och befintliga
                bostadsmiljöer tas i anspråk. Kommuner som inte följer planen hotas bli utan
                investeringar i kollektivtrafik, infrastruktur och vård.
              </p>
            )}
          </div>

          <p
            className="sm:text-3xl mt-5 font-bold leading-snug uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            <span className="inline-block text-red-700">⬇</span>
            Se hur de nya miljonprogrammen påverkar din hemkommun
            <span className="inline-block text-red-700">⬇</span>
          </p>
        </div>
      </div>
    </section>
  );
}
