'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

function ChevronDown() {
  return (
    <svg width="36" height="18" viewBox="0 0 36 18" fill="none" className="opacity-40">
      <path
        d="M2 2L18 16L34 2"
        stroke="#9ca3af"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  return (
    <div
      className={`flex flex-col overflow-hidden bg-canvas/80 backdrop-blur-md rounded-2xl border border-white/0 ${isMobile ? 'h-[30vh]' : 'h-full'}`}
    >
      {selected != null ? (
        <>
          <div className="px-4 pt-3 pb-2 border-b border-white/[0.07] flex-shrink-0">
            <BackButton onClick={onBack} />
          </div>
          <div className="px-4 py-3 flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
            <h2 className="text-on-canvas font-bold text-lg leading-tight">{selected}</h2>
            {stats && <StatsPanel stats={stats} view={view} />}
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-white/[0.07] flex-shrink-0">
            <LayerToggle view={view} onChange={onViewChange} />
          </div>
        </>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex-[4] min-h-0 overflow-y-scroll scrollbar-white"
          >
            <p className="px-4 pt-3 pb-3 text-xl font-bold text-on-canvas/70 border-b border-white/[0.07]">
              Välj kommun
            </p>
            <MunicipalityList
              municipalities={municipalities}
              hoveredMunicipality={hoveredMunicipality}
              onSelect={onSelect}
              onHoverMunicipality={isMobile ? undefined : onHoverMunicipality}
            />
          </div>
          <div className="flex-[0.2] flex items-start justify-center pt-5 pointer-events-none">
            {canScrollDown && <ChevronDown />}
          </div>
        </>
      )}
    </div>
  );
}
