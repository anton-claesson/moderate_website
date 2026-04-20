import type { MunicipalityStats } from '@/data/housingStats';

interface StatsPanelProps {
  stats: MunicipalityStats;
}

function fmt(n: number): string {
  return n.toLocaleString('sv-SE');
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const rows = [
    { label: 'Småhus', value: fmt(stats.smahusCurrent) },
    { label: 'Lägenheter idag', value: fmt(stats.flerboCurrent) },
    { label: 'Lägenheter 2060', value: fmt(stats.flerbo2060) },
    { label: 'Tillväxt', value: `+${stats.growthPct}%` },
  ];

  return (
    <dl className="flex flex-col gap-2">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between items-baseline gap-2">
          <dt className="text-text-on-dark/60 text-sm">{label}</dt>
          <dd className="text-text-on-dark font-medium text-sm tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
