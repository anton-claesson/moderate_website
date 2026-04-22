import type { HousingView } from '@/types/housing';
import { HOUSING_STATS } from '@/data/housingStats';
import MunicipalityList from './MunicipalityList';
import LayerToggle from './LayerToggle';
import BackButton from './BackButton';
import StatsPanel from './StatsPanel';

interface MunicipalityCardProps {
  isMobile: boolean;
  municipalities: string[];
  selected: string | null;
  view: HousingView;
  hoveredMunicipality: string | null;
  onSelect: (name: string) => void;
  onBack: () => void;
  onViewChange: (view: HousingView) => void;
  onHoverMunicipality: (name: string | null) => void;
}

export default function MunicipalityCard({
  isMobile,
  municipalities,
  selected,
  view,
  hoveredMunicipality,
  onSelect,
  onBack,
  onViewChange,
  onHoverMunicipality,
}: MunicipalityCardProps) {
  const stats = selected != null ? (HOUSING_STATS[selected] ?? null) : null;

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        isMobile ? 'h-[30vh] rounded-none' : 'h-full'
      }`}
      style={{ backgroundColor: '#d3d3d3' }}
    >
      {selected != null ? (
        <>
          <div className="px-4 pt-3 pb-2 border-b border-white/10 flex-shrink-0">
            <BackButton onClick={onBack} />
          </div>
          <div className="px-4 py-3 flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
            <h2 className="text-text-on-dark font-bold text-lg leading-tight">{selected}</h2>
            {stats && <StatsPanel stats={stats} />}
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-white/10 flex-shrink-0">
            <LayerToggle view={view} onChange={onViewChange} />
          </div>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <div className="flex-[4] overflow-y-auto min-h-0">
            <MunicipalityList
              municipalities={municipalities}
              hoveredMunicipality={hoveredMunicipality}
              onSelect={onSelect}
              onHoverMunicipality={isMobile ? undefined : onHoverMunicipality}
            />
          </div>
          <div className="flex-1" />
        </>
      )}
    </div>
  );
}
