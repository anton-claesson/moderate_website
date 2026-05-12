export default function Footer() {
  return (
    <footer className="w-full bg-canvas" style={{ borderTop: '1px solid rgba(242,240,235,0.08)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="font-ui flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
          <span className="text-on-canvas/40">
            Det här är en kampanj från Moderaterna i Region Stockholm
          </span>
          <span className="hidden sm:inline text-on-canvas/20">·</span>
          <a
            href="mailto:caroline.hellstrom@moderaterna.se"
            className="font-medium text-on-canvas/40 hover:text-on-canvas/80 transition-colors duration-150 underline underline-offset-4"
          >
            Kontakta oss
          </a>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/moderaternaSLL?locale=sv_SE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-on-canvas/40 hover:text-on-canvas/80 transition-colors duration-150"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
