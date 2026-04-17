# Phase 1 — Static Content & Layout: Implementation Plan

> Phase 1 — Static Content & Layout. Features F1.1–F1.4. Source: `project_plan.md`.

---

## Context

Phase 0 delivered the project skeleton, CI/CD pipeline, responsive shell, and design token system. The site currently renders four stub sections with dashed placeholder boxes. Phase 1 ships all real static content and layout so the site looks finished (without the map). All four features share no external dependencies on each other and are shipped together on one branch.

**Decisions resolved:**
- D2: Video source → YouTube embeds (`youtube-nocookie.com`), 2 videos
- Header mobile nav → hamburger/drawer menu

---

## Branch

`feature/phase-1-static-content`

---

## Files modified

| File | Purpose |
|---|---|
| `src/components/Header.tsx` | Add mobile hamburger menu (`'use client'`) |
| `src/components/Footer.tsx` | Expand to structured 3-column layout with attribution |
| `src/components/sections/IntroSection.tsx` | Replace placeholder with real project copy |
| `src/components/sections/VideosSection.tsx` | Replace placeholders with YouTube iframes |
| `project_plan.md` | Mark F1.1–F1.4 done; resolve D2 |

---

## F1.1 — Header (mobile hamburger)

The existing `Header.tsx` has desktop nav hidden on mobile. Enhance with a client-side toggle.

**Changes:**
1. Add `'use client'` directive.
2. Add `useState<boolean>(false)` for `menuOpen`.
3. Add a `<button>` visible only on `md:hidden` — renders `☰` / `✕` based on state.
4. When `menuOpen`, render a vertical nav drawer below the header bar using `bg-primary-dark`.
5. Close menu on nav link click (`onClick={() => setMenuOpen(false)}`).
6. Add `aria-expanded` and `aria-label="Toggle navigation"` for accessibility.

**No new packages.** Pure React state + Tailwind.

---

## F1.2 — Intro textbox

Replace the dashed placeholder in `IntroSection.tsx` with structured copy.

**Layout:**
```
[Eyebrow: "Om projektet"]
[H2: "Stockholms bostadsbestånd, visualiserat i 3D"]
[Body: 2–3 sentences — what the tool shows, who it's for]
[Callout box: data sources / methodology note]
```

**Copy (Swedish, adjust before launch):**
- **Headline:** "Stockholms bostadsbestånd, visualiserat i 3D"
- **Body:** Existing and planned housing units across the Stockholm Region, rendered as 3D volumes on an interactive map. For the general public and journalists.
- **Data callout:** Data from Lantmäteriet and SCB. LOD1/LOD2 volumes are schematic — representative of density, not architectural accuracy.

**Styling:** Headline `text-text` large weight; body `text-text-muted`; callout in a subtle `bg-primary-light` bordered box.

---

## F1.3 — Videos section

Replace the two placeholder divs in `VideosSection.tsx` with YouTube embeds.

**Implementation:**
1. Typed config array at top of file:
   ```ts
   const VIDEOS: { id: string; title: string }[] = [
     { id: 'PLACEHOLDER_ID_1', title: 'Video 1' },
     { id: 'PLACEHOLDER_ID_2', title: 'Video 2' },
   ];
   ```
   User replaces the IDs before launch — no structural changes needed.
2. Each embed: `<div className="aspect-video ..."><iframe .../></div>`
3. Use `src="https://www.youtube-nocookie.com/embed/{id}"` — GDPR-friendly, no third-party cookies.
4. Set `loading="lazy"`, `allowFullScreen`, and `title` attribute for accessibility.
5. Keep the existing 2-column responsive grid (`grid-cols-1 sm:grid-cols-2`).

**No new packages.** Native iframes only.

---

## F1.4 — Footer

Expand `Footer.tsx` from a single sparse row to a structured 3-column layout.

**Layout:**
```
[ Brand / tagline ]    [ Data sources ]      [ Contact ]
Stockholm Housing      Lantmäteriet          kontakt@example.se
Stock Visualizer       SCB

© 2026 — All data for informational purposes only.
```

**Changes:**
- Three columns with small-caps heading labels (`text-text-on-dark/60`).
- Data sources: Lantmäteriet + SCB as `<a>` links to their open-data portals.
- Contact: `mailto:` link (placeholder until launch).
- Bottom bar: dynamic copyright year + disclaimer.
- Responsive: 3-col `sm:grid-cols-3`, single-col stacked on mobile.

---

## Commit sequence

| # | Scope | Message |
|---|---|---|
| 1 | Header | `feat(header): add mobile hamburger navigation menu` |
| 2 | Footer | `feat(footer): expand to structured 3-column layout with attribution` |
| 3 | Intro | `feat(intro): replace placeholder with project description copy` |
| 4 | Videos | `feat(videos): add YouTube nocookie embeds with lazy loading` |
| 5 | Docs | `docs: mark F1.1-F1.4 done, resolve D2 in project plan` |

---

## Verification

1. `npm run lint && npm run build` — must pass clean.
2. Resize to 375px: hamburger button appears; tap opens drawer; tap a link closes it.
3. Desktop (≥768px): hamburger hidden, horizontal nav visible.
4. Videos: iframes render at correct aspect ratio; no cookie banner (nocookie domain).
5. Footer: 3-column on desktop, stacked on mobile.
6. Intro: real copy renders, no dashed placeholder visible.
7. All anchor links (`#intro`, `#map`, `#videos`, `#contact`) scroll to correct sections.
