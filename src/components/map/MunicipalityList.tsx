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
  const containerRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!hoveredMunicipality) return;
    const container = containerRef.current;
    const item = itemRefs.current.get(hoveredMunicipality);
    if (!container || !item) return;
    const targetScrollTop =
      item.offsetTop - container.clientHeight / 2 + item.offsetHeight / 2;
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  }, [hoveredMunicipality]);

  return (
    <ul ref={containerRef}>
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
            className={`w-full text-right px-3 py-2 uppercase tracking-wide transition-all duration-150 origin-right text-white ${
              hoveredMunicipality === name
                ? 'font-black scale-[1.15] text-base'
                : 'font-bold text-sm'
            }`}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}
