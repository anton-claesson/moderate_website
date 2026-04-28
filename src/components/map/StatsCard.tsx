import type { MunicipalityStats } from '@/data/housingStats';
import type { HousingView } from '@/types/housing';
import StatsPanel from './StatsPanel';

interface StatsCardProps {
  selected: string;
  stats: MunicipalityStats;
  view: HousingView;
  onBack: () => void;
  onViewChange: (view: HousingView) => void;
}

export default function StatsCard({ selected, stats, view, onBack, onViewChange }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center">
        <button
          onClick={onBack}
          className="text-[#5c8b5a] hover:text-[#3a5c39] text-sm font-bold transition-colors"
        >
          ← Alla kommuner
        </button>
      </div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-[#3a5c39] font-black text-xl leading-tight">{selected}</h2>
      </div>
      <div className="pb-2">
        <StatsPanel stats={stats} view={view} />
      </div>
      <div className="px-3 pb-3 pt-2 border-t border-gray-100">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(['current', 'planned'] as HousingView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`flex-1 min-h-[40px] px-3 text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-[#5c8b5a] text-white'
                  : 'bg-gray-50 text-[#5c8b5a]/60 hover:text-[#5c8b5a]'
              }`}
            >
              {v === 'current' ? 'Idag' : 'Planerad'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
