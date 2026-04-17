const navLinks = [
  { label: 'Intro', href: '#intro' },
  { label: 'Map', href: '#map' },
  { label: 'Videos', href: '#videos' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <span className="text-base font-semibold tracking-tight text-zinc-900">
          Stockholm Housing Visualizer
        </span>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
