import type { HousingView } from '@/types/housing';

interface LayerToggleProps {
  view: HousingView;
  onChange: (view: HousingView) => void;
  className?: string;
}

export default function LayerToggle({ view, onChange, className = '' }: LayerToggleProps) {
  return (
    <div className={`flex w-full p-1 rounded-2xl bg-gray-100 shadow-xl ${className}`}>
      {(['current', 'planned'] as HousingView[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 py-4 px-6 text-xl font-bold tracking-wide text-center rounded-xl transition-all duration-150 ${
            view === v
              ? 'bg-[#b91c1c] text-white shadow-md'
              : 'text-[#111111]/40 hover:text-[#111111]/70'
          }`}
        >
          {v === 'current' ? 'IDAG' : 'PLANERAD'}
        </button>
      ))}
    </div>
  );
}
