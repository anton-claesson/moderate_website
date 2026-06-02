type FlockVariant = 'hero' | 'info' | 'contact' | 'between';

interface BirdFlockProps {
  /**
   * Unique id for this instance's SVG filter. Each rendered flock needs its own
   * id — duplicate ids would make every `url(#…)` reference resolve to the first.
   */
  filterId: string;
  /** Which arrangement of birds to draw (each has a different count/spread). */
  variant?: FlockVariant;
  /** Positioning + sizing utilities, e.g. "right-4 top-10 w-52 sm:w-80". */
  className?: string;
}

/** Each bird is the same chevron path, placed via translate + scale (viewBox 200×120). */
type Bird = { x: number; y: number; scale: number };

const FLOCKS: Record<FlockVariant, Bird[]> = {
  hero: [
    { x: 6, y: 12, scale: 1.1 },
    { x: 62, y: 2, scale: 0.8 },
    { x: 126, y: 22, scale: 1.3 },
    { x: 40, y: 44, scale: 0.7 },
    { x: 150, y: 58, scale: 0.95 },
  ],
  info: [
    { x: 14, y: 8, scale: 0.9 },
    { x: 78, y: 26, scale: 1.25 },
    { x: 140, y: 6, scale: 0.7 },
    { x: 168, y: 38, scale: 1.05 },
  ],
  contact: [
    { x: 4, y: 30, scale: 1.0 },
    { x: 38, y: 8, scale: 0.75 },
    { x: 74, y: 34, scale: 1.3 },
    { x: 104, y: 14, scale: 0.9 },
    { x: 138, y: 44, scale: 1.1 },
    { x: 160, y: 18, scale: 0.7 },
    { x: 28, y: 60, scale: 0.85 },
  ],
  between: [
    { x: 10, y: 30, scale: 0.6 },
    { x: 40, y: 14, scale: 0.7 },
    { x: 66, y: 40, scale: 0.55 },
    { x: 92, y: 20, scale: 0.75 },
    { x: 118, y: 42, scale: 0.6 },
    { x: 144, y: 16, scale: 0.7 },
    { x: 170, y: 34, scale: 0.5 },
    { x: 80, y: 62, scale: 0.65 },
  ],
};

/**
 * Decorative bird silhouettes (Chunk 11). Absolutely positioned, sits behind a
 * section's content (place it as the section's first child) and above the grain.
 * `position` is set inline because the unlayered `.textured-canvas > *` rule
 * would otherwise force `position: relative` over Tailwind's `absolute` utility.
 * Angular wings + a turbulence displacement give the distressed look.
 */
export default function BirdFlock({ filterId, variant = 'hero', className }: BirdFlockProps) {
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
        {FLOCKS[variant].map((bird, i) => (
          <path
            key={i}
            d="M0 8 L5 2 L8 6 L11 2 L16 8"
            transform={`translate(${bird.x} ${bird.y}) scale(${bird.scale})`}
          />
        ))}
      </g>
    </svg>
  );
}
