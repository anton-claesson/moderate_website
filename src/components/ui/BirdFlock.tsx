interface BirdFlockProps {
  /**
   * Unique id for this instance's SVG filter. Each rendered flock needs its own
   * id — duplicate ids would make every `url(#…)` reference resolve to the first.
   */
  filterId: string;
  /** Positioning + sizing utilities, e.g. "right-4 top-10 w-40 sm:w-64". */
  className?: string;
}

/**
 * Decorative bird silhouettes (Chunk 11). Absolutely positioned, sits behind a
 * section's content (place it as the section's first child) and above the grain.
 * `position` is set inline because the unlayered `.textured-canvas > *` rule
 * would otherwise force `position: relative` over Tailwind's `absolute` utility.
 * Angular wings + a turbulence displacement give the distressed look.
 */
export default function BirdFlock({ filterId, className }: BirdFlockProps) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute' }}
      className={`pointer-events-none text-black/50 ${className ?? ''}`}
      viewBox="0 0 200 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(6 12) scale(1.1)" />
        <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(62 2) scale(0.8)" />
        <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(126 22) scale(1.3)" />
        <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(40 44) scale(0.7)" />
        <path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(150 58) scale(0.95)" />
      </g>
    </svg>
  );
}
