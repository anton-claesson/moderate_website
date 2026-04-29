export default function Footer() {
  return (
    <footer className="w-full bg-primary-light border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between gap-1 text-m text-text-muted/60">
          <span>Det här är en kampanj från Moderaterna i Region Stockholm.</span>
          <a
            href="mailto:caroline.hellstrom@moderaterna.se"
            className="hover:text-text-muted transition-colors underline"
          >
            Kontakta oss
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/moderaternaSLL?locale=sv_SE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-text-muted transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-text-muted transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-text-muted transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
