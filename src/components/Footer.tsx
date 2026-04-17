export default function Footer() {
  return (
    <footer className="w-full bg-primary-dark border-t border-primary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-text-on-dark">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-on-dark/50">
              Projekt
            </span>
            <span className="font-medium">Stockholm Housing Stock Visualizer</span>
            <span className="text-text-on-dark/60 text-xs">
              Visualisering av bostadsbeståndet i Stockholmsregionen.
            </span>
          </div>

          {/* Data sources */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-on-dark/50">
              Datakällor
            </span>
            <a
              href="https://www.lantmateriet.se/sv/geodata/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-on-dark/80 hover:text-text-on-dark transition-colors"
            >
              Lantmäteriet
            </a>
            <a
              href="https://www.scb.se/hitta-statistik/statistik-efter-amne/boende-byggande-och-bebyggelse/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-on-dark/80 hover:text-text-on-dark transition-colors"
            >
              SCB — Statistiska centralbyrån
            </a>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-on-dark/50">
              Kontakt
            </span>
            <a
              href="mailto:kontakt@example.se"
              className="text-text-on-dark/80 hover:text-text-on-dark transition-colors"
            >
              kontakt@example.se
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/20 text-xs text-text-on-dark/40 flex flex-col sm:flex-row justify-between gap-1">
          <span>© {new Date().getFullYear()} Stockholm Housing Stock Visualizer</span>
          <span>All data for informational purposes only.</span>
        </div>
      </div>
    </footer>
  );
}
