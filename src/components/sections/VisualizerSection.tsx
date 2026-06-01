interface VisualizerSectionProps {
  id: string;
}

const PDF_HREF =
  'https://www.hyresgastforeningen.se/globalassets/bostadsfakta/rapporter/2025/sveriges-basta-villaomraden/sveriges-basta-villaomraden.pdf?cb_vid=963';

export default function VisualizerSection({ id }: VisualizerSectionProps) {
  return (
    <section id={id} className="textured-canvas border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-16 sm:py-24 space-y-10">
        {/* Top text — right-aligned with right accent border */}
        <div className="text-left border-l-2 border-accent pl-8 md:pr-10 space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl leading-snug text-on-canvas/90">
            Hur ser förtätning ut i praktiken?
          </h2>
          <p className="font-body text-base sm:text-lg leading-snug text-on-canvas/75">
            Såhär vill Hyresgästföreningen förtäta Stockholms villaområden:
          </p>
        </div>

        {/* Both island renders in one raised panel, split into labelled "before / after" halves */}
        <div className="max-w-6xl pl-8">
          <a
            href={PDF_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-map-bg p-3 sm:p-4 border border-white/10 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-black/30"
          >
            {/* Islands overlap (negative margin) and the right one staggers DOWN so each
                island's transparent corner nests into the other's, killing the centre gap.
                Labels stay top-aligned and centred over their own image. */}
            <div className="flex flex-col sm:flex-row sm:items-start">
              <figure className="relative z-10 min-w-0 flex-1">
                <figcaption className="mb-2 text-center font-display text-2xl sm:text-3xl uppercase tracking-wide text-on-canvas">
                  Idag
                </figcaption>
                <img
                  src="/rufs_before.png"
                  alt="Villaområde – före förtätning"
                  loading="lazy"
                  className="w-full h-auto"
                />
              </figure>
              <figure className="relative min-w-0 flex-1 mt-6 sm:mt-0 sm:-ml-24">
                <figcaption className="mb-2 text-center font-display text-2xl sm:text-3xl uppercase tracking-wide text-accent">
                  Planerat
                </figcaption>
                <img
                  src="/rufs_after.png"
                  alt="Trädgårdsstad – efter förtätning"
                  loading="lazy"
                  className="w-full h-auto"
                />
              </figure>
            </div>
          </a>
        </div>

        {/* Bottom text */}
        <div className="space-y-4">
          <p className="max-w-4xl pl-8 font-body text-base sm:text-lg leading-relaxed text-on-canvas/75">
            Socialdemokraterna och Hyresgästföreningen krokar åter arm, denna gång i frågan om
            miljonprogram. På Lidingö vill de riva var femte villa och bygga hyreshus på var tredje
            villatomt.
          </p>
          <p className="font-body pl-8 text-base sm:text-lg leading-relaxed text-on-canvas/75">
            Ovan är ett visuellt exempel på hur Hyresgästföreningen vill förtäta Lidingö.
          </p>
        </div>
      </div>
    </section>
  );
}
