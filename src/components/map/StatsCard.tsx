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
    <div className="bg-canvas/80 backdrop-blur-md rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col">
      <div className="hidden md:flex px-4 pt-3 pb-2 border-b border-white/[0.07] items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-on-canvas/50 hover:text-on-canvas text-sm font-ui font-bold transition-colors duration-150"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Alla kommuner
        </button>
      </div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-on-canvas font-ui font-black text-2xl leading-tight uppercase tracking-wide">
          {selected}
        </h2>
      </div>
      <div className="pb-2">
        <StatsPanel stats={stats} view={view} />
      </div>
    </div>
  );
}
