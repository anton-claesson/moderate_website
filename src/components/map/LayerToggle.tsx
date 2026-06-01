import type { HousingView } from '@/types/housing';

interface LayerToggleProps {
  view: HousingView;
  onChange: (view: HousingView) => void;
  className?: string;
  variant?: 'card' | 'map';
}

const VIEWS: HousingView[] = ['current', 'planned'];
const LABEL: Record<HousingView, string> = { current: 'IDAG', planned: 'PLANERAT' };

export default function LayerToggle({
  view,
  onChange,
  className = '',
  variant = 'card',
}: LayerToggleProps) {
  const isMap = variant === 'map';

  // Shared affordance: a segmented control where both segments read as pressable.
  // The active segment is filled red; the inactive segment keeps a visible track,
  // higher-contrast text, and a clear hover so users grasp it's an interactive toggle.
  const track = isMap
    ? 'inline-flex p-1 gap-1 rounded-full bg-canvas/80 backdrop-blur-sm border border-on-canvas/15 shadow-lg'
    : 'flex w-full p-1 gap-1 rounded-2xl bg-on-canvas/10 border border-on-canvas/15 shadow-lg';

  const segment = isMap
    ? 'px-7 py-2.5 text-xl rounded-full'
    : 'flex-1 py-3 px-6 text-xl rounded-xl';

  return (
    <div
      role="group"
      aria-label="Visa bostäder idag eller planerade"
      className={`${track} ${className}`}
    >
      {VIEWS.map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={active}
            className={`font-ui ${segment} min-h-[44px] font-bold uppercase tracking-widest text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
              active
                ? 'bg-accent text-white shadow-md'
                : 'bg-on-canvas/10 text-on-canvas/85 hover:bg-on-canvas/20 hover:text-on-canvas'
            }`}
          >
            {LABEL[v]}
          </button>
        );
      })}
    </div>
  );
}
