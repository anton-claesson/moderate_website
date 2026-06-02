interface VideosSectionProps {
  id: string;
}

export default function VideosSection({ id }: VideosSectionProps) {
  return (
    <section id={id} className="textured-canvas cv-section border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-8 sm:py-12">
        <p className="font-body font-bold tracking-wide text-lg sm:text-xl leading-snug text-on-canvas/75 hyphens-auto mb-8">
          Socialdemokraternas svar till stockholmare som inte vill ha ett miljonprogram i
          trädgården:
        </p>
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          {/* Left: text column */}
          <div className="w-full md:w-3/5 space-y-8">
            <blockquote className="font-display text-3xl sm:text-4xl leading-tight text-on-canvas uppercase">
              &ldquo;Vill de inte bo där så är de välkomna att{' '}
              <span className="text-accent">flytta</span>.&rdquo;
            </blockquote>
            <div className="space-y-4">
              <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
                Det sade en socialdemokratisk gruppledare under Stockholms regionfullmäktige den 11
                november 2025, när den regionala utvecklingsplanen och den nya inriktningen för
                bostadsbyggandet i länet debatterades.
              </p>
              <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
                När stockholmarna ber om ett äppelträd i bakgården placerar Socialdemokraterna där i
                stället ett regionalt miljonprogram — och de drar sig inte för att berätta om det.
              </p>
            </div>
          </div>

          {/* Right: video sticker, vertically centered */}
          <div className="w-full md:w-42/100 flex-shrink-0">
            <video
              controls
              playsInline
              preload="metadata"
              className="sticker block rounded-lg w-full h-auto bg-map-bg"
            >
              <source src="/regionfullmaktige-2025.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
