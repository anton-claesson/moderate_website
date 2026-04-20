import { useEffect, useRef } from 'react';

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
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (hoveredMunicipality) {
      itemRefs.current
        .get(hoveredMunicipality)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [hoveredMunicipality]);

  return (
    <ul>
      {municipalities.map((name) => (
        <li key={name}>
          <button
            ref={(el) => {
              if (el) itemRefs.current.set(name, el);
              else itemRefs.current.delete(name);
            }}
            onClick={() => onSelect(name)}
            onMouseEnter={onHoverMunicipality ? () => onHoverMunicipality(name) : undefined}
            onMouseLeave={onHoverMunicipality ? () => onHoverMunicipality(null) : undefined}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              hoveredMunicipality === name
                ? 'bg-accent/20 text-accent font-semibold'
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
