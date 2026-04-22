import type { HousingView } from '@/types/housing';

interface LayerToggleProps {
  view: HousingView;
  onChange: (view: HousingView) => void;
}

export default function LayerToggle({ view, onChange }: LayerToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-white/10">
      {(['current', 'planned'] as HousingView[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 min-h-[44px] px-4 text-sm font-medium transition-colors ${
            view === v
              ? 'bg-accent text-text-on-dark'
              : 'bg-header-bg text-text-on-dark/60 hover:text-text-on-dark'
          }`}
        >
          {v === 'current' ? 'Idag' : 'Planerad'}
        </button>
      ))}
    </div>
  );
}
