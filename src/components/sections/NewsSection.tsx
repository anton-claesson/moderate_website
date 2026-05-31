interface NewsSectionProps {
  id: string;
}

const articles = [
  {
    source: 'Aftonbladet',
    headline: 'S-toppen: Vi behöver blanda befolkningen',
    href: 'https://www.aftonbladet.se/nyheter/a/Eyrlwa/s-mal-blanda-befolkningen',
    image: '/news/aftonbladet-blanda.jpg',
    logo: '/news/logos/aftonbladet.svg',
  },
  {
    source: 'SVT',
    headline: 'M om regionens framtidsplan: “Socialdemokratisk tvångsblandning”',
    href: 'https://www.svt.se/nyheter/lokalt/stockholm/m-om-regionens-framtidsplan-socialdemokratisk-tvangsblandning',
    image: '/news/svt-tvangsblandning.jpg',
    logo: '/news/logos/svt.svg',
  },
  {
    source: 'SVT',
    headline: 'Socialdemokraterna vill blanda befolkningen – men ingen ska flytta',
    href: 'https://www.svt.se/nyheter/inrikes/socialdemokraterna-vill-blanda-befolkningen-men-ingen-ska-flytta',
    image: '/news/svt-ingen-ska-flytta.jpg',
    logo: '/news/logos/svt.svg',
  },
];

export default function NewsSection({ id }: NewsSectionProps) {
  return (
    <section id={id} className="bg-canvas">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-16 sm:py-24 space-y-10">
        {/* Section header */}
        <div className="border-l-2 border-accent pl-8 space-y-3">
          <h2
            className="font-display text-3xl sm:text-4xl leading-snug"
            style={{ color: 'rgba(242,240,235,0.9)' }}
          >
            I media
          </h2>
          <p className="font-body text-base sm:text-lg" style={{ color: 'rgba(242,240,235,0.55)' }}>
            Vad skriver pressen om förtätningsplanerna?
          </p>
        </div>

        {/* Cards: scroll-snap on mobile, 3-col grid on desktop */}
        <div className="-mx-4 px-4 sm:-mx-10 sm:px-10 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-dark">
          {articles.map((article) => (
            <a
              key={article.href}
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start flex-shrink-0 w-[88%] sm:w-[62%] lg:w-[48%] block p-10 sm:p-14 rounded-xl border border-white/15 bg-white/[0.03] hover:border-accent/40 transition-colors duration-200 space-y-8 group"
            >
              {/* Source badge */}
              <span className="font-ui text-sm uppercase tracking-widest text-accent">
                {article.source}
              </span>

              {/* Headline */}
              <h3
                className="font-display text-3xl sm:text-4xl leading-snug"
                style={{ color: 'rgba(242,240,235,0.9)' }}
              >
                {article.headline}
              </h3>

              {/* Read link */}
              <div
                className="flex items-center gap-2 pt-2"
                style={{ color: 'rgba(242,240,235,0.45)' }}
              >
                <span className="font-body text-sm underline underline-offset-4 group-hover:text-on-canvas/70 transition-colors duration-150">
                  Läs artikel
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
