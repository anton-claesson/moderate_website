import type { MunicipalityStats } from '@/data/housingStats';
import type { HousingView } from '@/types/housing';
import StatsPanel from './StatsPanel';

interface StatsCardProps {
  selected: string;
  stats: MunicipalityStats;
  view: HousingView;
  onBack: () => void;
}

export default function StatsCard({ selected, stats, view, onBack }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="hidden md:flex px-4 pt-3 pb-2 border-b border-gray-100 items-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors"
        >
          ← Alla kommuner
        </button>
      </div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-[#111111] font-black text-xl leading-tight">{selected}</h2>
      </div>
      <div className="pb-2">
        <StatsPanel stats={stats} view={view} />
      </div>
    </div>
  );
}
