import type { HousingView } from '@/types/housing';

interface LayerToggleProps {
  view: HousingView;
  onChange: (view: HousingView) => void;
  className?: string;
  variant?: 'card' | 'map';
}

export default function LayerToggle({
  view,
  onChange,
  className = '',
  variant = 'card',
}: LayerToggleProps) {
  if (variant === 'map') {
    return (
      <div
        className={`inline-flex p-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 shadow-lg ${className}`}
      >
        {(['current', 'planned'] as HousingView[]).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`font-ui px-8 py-2.5 text-xl font-bold uppercase tracking-widest rounded-full transition-all duration-200 ${
              view === v ? 'bg-accent text-white shadow-sm' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {v === 'current' ? 'IDAG' : 'PLANERAD'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex w-full p-1 rounded-2xl bg-gray-100 shadow-xl ${className}`}>
      {(['current', 'planned'] as HousingView[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`font-ui flex-1 py-4 px-6 text-xl font-bold tracking-wide text-center rounded-xl transition-all duration-200 ${
            view === v ? 'bg-accent text-white shadow-md' : 'text-text-muted hover:text-primary'
          }`}
        >
          {v === 'current' ? 'IDAG' : 'PLANERAD'}
        </button>
      ))}
    </div>
  );
}
