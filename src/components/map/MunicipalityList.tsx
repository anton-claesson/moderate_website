interface MunicipalityListProps {
  municipalities: string[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export default function MunicipalityList({
  municipalities,
  selected,
  onSelect,
}: MunicipalityListProps) {
  return (
    <div className="bg-header-bg/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden w-44">
      <div className="px-3 py-2 text-xs font-semibold text-text-on-dark/50 uppercase tracking-wider border-b border-white/10">
        Kommuner
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {municipalities.map((name) => (
          <li key={name}>
            <button
              onClick={() => onSelect(name)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                selected === name
                  ? 'bg-accent/20 text-accent font-medium'
                  : 'text-text-on-dark/70 hover:bg-white/5 hover:text-text-on-dark'
              }`}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
