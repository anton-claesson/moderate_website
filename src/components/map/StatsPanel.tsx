import type { ReactNode } from 'react';
import type { MunicipalityStats } from '@/data/housingStats';
import { SMAHUS_COLOR, FLERBOSTADSHUS_COLOR, FLERBOSTADSHUS_NEW_COLOR } from '@/lib/mapConfig';

interface StatsPanelProps {
  stats: MunicipalityStats;
  view: string;
}

function fmt(n: number): string {
  return n.toLocaleString('sv-SE');
}

function HouseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 9L9 2L16 9V16H12V11H6V16H2V9Z" fill={SMAHUS_COLOR} />
    </svg>
  );
}

function BuildingIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" aria-hidden="true">
      <rect x="0" y="2" width="15" height="16" rx="0.5" fill={color} />
      <rect x="2" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
      <rect x="6" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
      <rect x="10" y="5" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
      <rect x="2" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
      <rect x="6" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
      <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.55" />
    </svg>
  );
}

function StatCell({
  value,
  label,
  icon,
  borderRight,
  borderBottom,
}: {
  value: string;
  label: string;
  icon?: ReactNode;
  borderRight?: boolean;
  borderBottom?: boolean;
}) {
  return (
    <div
      className={`p-3 flex flex-col ${borderRight ? 'border-r border-white/[0.07]' : ''} ${borderBottom ? 'border-b border-white/[0.07]' : ''}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-on-canvas font-black text-2xl tabular-nums leading-none">
          {value}
        </span>
        {icon && <div className="mt-0.5 flex-shrink-0">{icon}</div>}
      </div>
      <span className="text-on-canvas/50 text-xs uppercase tracking-wide mt-1.5 leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function StatsPanel({ stats, view }: StatsPanelProps) {
  const isPlanned = view !== 'current';

  const total = isPlanned
    ? stats.smahusCurrent + stats.flerbo2060
    : stats.smahusCurrent + stats.flerboCurrent;

  const smahus = (stats.smahusCurrent / total) * 100;
  const flerbo = (stats.flerboCurrent / total) * 100;
  const flerboNew = isPlanned ? ((stats.flerbo2060 - stats.flerboCurrent) / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2">
        <StatCell
          value={fmt(stats.smahusCurrent)}
          label="Småhus idag"
          icon={<HouseIcon />}
          borderRight
          borderBottom
        />
        <StatCell
          value={fmt(stats.flerboCurrent)}
          label="Lägenheter idag"
          icon={<BuildingIcon color={FLERBOSTADSHUS_COLOR} />}
          borderBottom
        />
        <StatCell
          value={fmt(stats.flerbo2060)}
          label="Lgh 2060"
          icon={<BuildingIcon color={FLERBOSTADSHUS_NEW_COLOR} />}
          borderRight
        />
        <StatCell value={`${stats.fortattning}%`} label="Förtätning" />
      </div>

      <div className="hidden">
        <span className="text-[#AAC0AA] text-[10px] uppercase tracking-widest">Bostadsmix</span>
        <div className="h-6 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-[width] duration-300 ease-in-out"
            style={{ width: `${smahus}%`, backgroundColor: SMAHUS_COLOR }}
          />
          <div
            className="h-full transition-[width] duration-300 ease-in-out"
            style={{ width: `${flerbo}%`, backgroundColor: FLERBOSTADSHUS_COLOR }}
          />
          <div
            className="h-full transition-[width] duration-300 ease-in-out"
            style={{ width: `${flerboNew}%`, backgroundColor: FLERBOSTADSHUS_NEW_COLOR }}
          />
        </div>
      </div>
    </div>
  );
}
