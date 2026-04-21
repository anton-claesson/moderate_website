export default function Footer() {
  return (
    <footer className="w-full bg-primary-light border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs text-text-muted/60">
          <span>© {new Date().getFullYear()} Stockholm Housing Stock Visualizer</span>
          <span>All data for informational purposes only.</span>
          <a href="mailto:kontakt@example.se" className="hover:text-text-muted transition-colors">
            kontakt@example.se
          </a>
        </div>
      </div>
    </footer>
  );
}
