export default function Footer() {
  return (
    <footer className="w-full bg-zinc-100 border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <span>© {new Date().getFullYear()} Stockholm Housing Stock Visualizer</span>
        <span>Data: Lantmäteriet / SCB</span>
        <span>kontakt@example.se</span>
      </div>
    </footer>
  );
}
