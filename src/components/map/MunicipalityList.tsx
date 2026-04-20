interface MunicipalityListProps {
  municipalities: string[];
  hoveredMunicipality?: string | null;
  onSelect: (name: string) => void;
  onHoverMunicipality?: (name: string | null) => void;
}

export default function MunicipalityList({
  municipalities,
  hoveredMunicipality,
  onSelect,
  onHoverMunicipality,
}: MunicipalityListProps) {
  return (
    <ul>
      {municipalities.map((name) => (
        <li key={name}>
          <button
            onClick={() => onSelect(name)}
            onMouseEnter={onHoverMunicipality ? () => onHoverMunicipality(name) : undefined}
            onMouseLeave={onHoverMunicipality ? () => onHoverMunicipality(null) : undefined}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              hoveredMunicipality === name
                ? 'bg-white/10 text-text-on-dark'
                : 'text-text-on-dark/70 hover:bg-white/5 hover:text-text-on-dark'
            }`}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}
