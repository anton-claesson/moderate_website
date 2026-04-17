export default function Footer() {
  return (
    <footer className="w-full bg-primary-dark border-t border-primary-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-on-dark/70">
        <span>© {new Date().getFullYear()} Stockholm Housing Stock Visualizer</span>
        <span>Data: Lantmäteriet / SCB</span>
        <span>kontakt@example.se</span>
      </div>
    </footer>
  );
}
