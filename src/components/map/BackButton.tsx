interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="min-h-[44px] px-4 rounded-lg shadow-lg bg-header-bg text-text-on-dark/80 hover:text-text-on-dark text-sm font-medium border border-white/10 transition-colors"
    >
      ← Alla kommuner
    </button>
  );
}
