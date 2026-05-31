interface VisualizerSectionProps {
  id: string;
}

const PDF_HREF =
  'https://www.hyresgastforeningen.se/globalassets/bostadsfakta/rapporter/2025/sveriges-basta-villaomraden/sveriges-basta-villaomraden.pdf?cb_vid=963';

// Image is 1820×1778 — each crop is 1820×889 (aspect ratio ≈ 2.047:1)
const CROP_RATIO = 1820 / 889;

export default function VisualizerSection({ id }: VisualizerSectionProps) {
  return (
    <section id={id} className="bg-canvas border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-16 sm:py-24 space-y-10">
        {/* Top text — right-aligned with right accent border */}
        <div className="text-left border-l-2 border-accent pl-8 md:pr-10 space-y-3">
          <h2
            className="font-display text-3xl sm:text-4xl leading-snug"
            style={{ color: 'rgba(242,240,235,0.9)' }}
          >
            Hur ser förtätning ut i praktiken?
          </h2>
          <p
            className="font-body text-base sm:text-lg leading-snug"
            style={{ color: 'rgba(242,240,235,0.75)' }}
          >
            Såhär vill Hyresgästföreningen förtäta Stockholms villaområden:
          </p>
        </div>

        {/* Two cropped images — left-aligned with the copy column, single background, clickable */}
        <div className="max-w-4xl pl-8">
          <a
            href={PDF_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-[#1c1c1c] p-4 sm:p-4 border-2 border-white/25 transition-opacity hover:opacity-90"
          >
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              {/* Upper half of image */}
              <div
                className="flex-1 overflow-hidden rounded-lg"
                style={{ aspectRatio: CROP_RATIO, position: 'relative' }}
              >
                <img
                  src="/rufs_visualizer.png"
                  alt="Villaområde – före förtätning"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto' }}
                />
              </div>

              {/* Lower half of image */}
              <div
                className="flex-1 overflow-hidden rounded-lg"
                style={{ aspectRatio: CROP_RATIO, position: 'relative' }}
              >
                <img
                  src="/rufs_visualizer.png"
                  alt="Trädgårdsstad – efter förtätning"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          </a>
        </div>

        {/* Bottom text */}
        <div className="space-y-4">
          <p
            className="max-w-4xl pl-8 font-body text-base sm:text-lg leading-relaxed"
            style={{ color: 'rgba(242,240,235,0.75)' }}
          >
            Socialdemokraterna och Hyresgästföreningen krokar åter arm, denna gång i frågan om
            miljonprogram. På Lidingö vill de riva var femte villa och bygga hyreshus på var tredje
            villatomt.
          </p>
          <p
            className="font-body pl-8 text-base sm:text-lg leading-relaxed"
            style={{ color: 'rgba(242,240,235,0.75)' }}
          >
            Ovan är ett visuellt exempel på hur Hyresgästföreningen vill förtäta Lidingö.
          </p>
        </div>
      </div>
    </section>
  );
}
