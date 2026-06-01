import Image from 'next/image';

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
    <section id={id} className="textured-canvas">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-12 sm:py-16">
        {/* Image-filled cards: 1 col mobile → 3 cols desktop, filling the container width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <a
              key={article.href}
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-white/[0.04] border border-white/10 hover:border-accent/50 transition-colors duration-200"
            >
              {/* OG image fill */}
              {article.image && (
                <Image
                  src={article.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* Legibility scrim */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
              />

              {/* Outlet logo — Aftonbladet in its black-on-yellow brand mark, others white */}
              {article.source === 'Aftonbladet' ? (
                <span className="absolute top-4 left-4 inline-flex items-center rounded bg-[#FFE600] px-2 py-1.5 shadow">
                  <img
                    src={article.logo}
                    alt={article.source}
                    className="h-3.5 w-auto max-w-[110px] object-contain"
                  />
                </span>
              ) : (
                <img
                  src={article.logo}
                  alt={article.source}
                  className="absolute top-4 left-4 h-6 w-auto max-w-[120px] object-contain object-left brightness-0 invert drop-shadow"
                />
              )}

              {/* Headline on top, bottom-anchored */}
              <h3
                className="absolute inset-x-0 bottom-0 p-5 sm:p-6 font-display text-2xl leading-snug text-white"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
              >
                {article.headline}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
