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
      className="relative min-h-[80vh] w-full flex flex-col bg-canvas overflow-hidden"
    >
      {/* Grain texture */}
      <div className="hero-grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-10 flex flex-col flex-1 justify-center py-10 sm:py-20">
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
          Stoppa de nya
          <br />
          <span className="text-accent">miljonprogrammen!</span>
        </h1>

        {/* Red rule */}
        <div
          className="animate-fade-up w-20 h-px bg-accent mb-6"
          style={{ animationDelay: '200ms' }}
        />

        {/* Subheading */}
        <p
          className="animate-fade-up font-heading uppercase tracking-wide text-xl sm:text-2xl mb-6 max-w-3xl"
          style={{ color: 'rgba(242,240,235,0.75)', animationDelay: '280ms' }}
        >
          <span className="text-accent">Beslutat:</span> 577 000 nya lägenheter i Region Stockholm.
          <br />
          Nya miljonprogram – i parken, vid torget och där du bor.
        </p>

        {/* Body text */}
        <div
          className="animate-fade-up max-w-2xl space-y-3 mb-8"
          style={{ animationDelay: '360ms' }}
        >
          <p className="sm:text-lg leading-relaxed" style={{ color: 'rgba(242,240,235,0.55)' }}>
            Planen drivs av Socialdemokraterna Stockholms Regionen och har klubbats igenom av
            ordförande Aida Hadzialic (S). I en bilaga målas kommun efter kommun upp för snabb,
            genomgripande förändring – med tät, storskalig bebyggelse.
          </p>
          <p className="sm:text-lg leading-relaxed" style={{ color: 'rgba(242,240,235,0.55)' }}>
            Riv upp bilagan. Ställ de ansvariga till svars.
          </p>
        </div>

        {/* Fakta accordion */}
        <div className="animate-fade-up mb-10 max-w-2xl" style={{ animationDelay: '440ms' }}>
          <button
            onClick={() => setFaktaOpen((o) => !o)}
            className="text-sm sm:text-base font-semibold underline underline-offset-4 transition-colors duration-150 focus:outline-none"
            style={{ color: 'rgba(242,240,235,0.45)' }}
          >
            {faktaOpen ? 'Dölj fakta' : 'Läs fakta om planen'}
          </button>
          {faktaOpen && (
            <div className="mt-3 border-l-2 border-accent/20 pl-4">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(242,240,235,0.45)' }}>
                <strong style={{ color: 'rgba(242,240,235,0.7)' }}>Fakta: </strong>
                Socialdemokraterna, Vänsterpartiet, Miljöpartiet och Centerpartiet i Region
                Stockholm har beslutat om en ny regional utvecklingsplan. I planen ingår en bilaga
                som fastställer hur många bostäder varje kommun ska bygga – på begränsad yta. I
                praktiken innebär det att kommuner pressas att bygga högt och tätt i redan bebyggda
                områden för att nå målen. Konsekvensen är att grönytor, småhusområden och befintliga
                bostadsmiljöer tas i anspråk. Kommuner som inte följer planen hotas bli utan
                investeringar i kollektivtrafik, infrastruktur och vård.
              </p>
            </div>
          )}
        </div>

        {/* CTA row */}
        <div
          className="animate-fade-up flex items-center gap-3"
          style={{ color: 'rgba(242,240,235,0.7)', animationDelay: '520ms' }}
        >
          <div className="w-8 h-px bg-current flex-shrink-0" />
          <span className="font-heading uppercase text-sm sm:text-base tracking-[0.15em]">
            Se hur det påverkar din kommun
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
