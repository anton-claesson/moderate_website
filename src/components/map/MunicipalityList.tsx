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
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListHovering = useRef(false);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!hoveredMunicipality || isListHovering.current) return;
    itemRefs.current
      .get(hoveredMunicipality)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [hoveredMunicipality]);

  const handleMouseEnter = (name: string) => {
    if (leaveTimer.current !== null) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    isListHovering.current = true;
    onHoverMunicipality?.(name);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => {
      isListHovering.current = false;
      onHoverMunicipality?.(null);
      leaveTimer.current = null;
    }, 0);
  };

  return (
    <ul className="pr-3">
      {municipalities.map((name) => (
        <li key={name} className="flex justify-end">
          <button
            ref={(el) => {
              if (el) itemRefs.current.set(name, el);
              else itemRefs.current.delete(name);
            }}
            onClick={() => onSelect(name)}
            onMouseEnter={onHoverMunicipality ? () => handleMouseEnter(name) : undefined}
            onMouseLeave={onHoverMunicipality ? handleMouseLeave : undefined}
            className={`w-full text-right px-3 py-2 uppercase tracking-wide transition-all duration-150 ${
              hoveredMunicipality === name
                ? 'font-black text-2xl text-white bg-accent'
                : 'font-bold text-2xl text-on-canvas/60 hover:text-on-canvas/90'
            }`}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  );
}
