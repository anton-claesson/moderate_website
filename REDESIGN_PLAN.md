# Redesign Implementation Plan

Working plan for the redesign pass requested by the client. Each **Chunk** is sized to
fit a single working session: pick the next unchecked chunk, implement it, run the
checks, commit, and end the session.

## How to use this document

1. Open the next chunk that isn't checked off in the **Progress tracker** below.
2. Implement only that chunk (CLAUDE.md §1: strict scoping — no extra "nice-to-haves").
3. Before committing, run the gates:
   ```bash
   npm run format:check   # MUST pass (memory: formatting rule)
   npm run lint
   npm run build
   ```
4. Commit with the conventional message suggested in the chunk.
5. Tick the box here, then end the session.

**Branch / merge protocol:** Continue on the existing `redesign` branch (matches the
current commit history). Commit atomically per chunk. Do **not** merge — once all
chunks are done, prepare a PR into `main` and wait for explicit approval (CLAUDE.md §4).

## Progress tracker

Features first, then design.

**Features**

- [x] Chunk 1 — Stats panel data update
- [x] Chunk 2 — Map camera focuses on planned (red) buildings
- [x] Chunk 3 — Map UX: toggle + "Alla kommuner" button
- [x] Chunk 4 — Visualizer left-align + video quote styling
- [x] Chunk 5 — News assets: fetch OG images + outlet logos
- [x] Chunk 6 — News cards redesign (image-filled, logo overlay)

**Design**

- [x] Chunk 7 — Design-system foundation (fonts, palette, textured background)
- [x] Chunk 8 — Apply palette + texture + fonts to content sections
- [ ] Chunk 9 — Map restyle to match the site
- [ ] Chunk 10 — Homogenize sizing + responsive QA

---

## Design decisions (locked with the client)

These answers govern the design chunks; feature chunks reference existing tokens and
will inherit the new look automatically.

| Topic           | Decision                                                                                                                                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fonts**       | Exactly two sans-serifs. **Headline:** a heavy/condensed grotesque echoing the OG poster lettering (candidates: Anton, Archivo Black, Oswald 700). **Body/UI:** a clean neutral sans (Inter or DM Sans). The serif fonts (DM Serif Display, Lora) are removed. "Texture" = a subtle CSS grain/distress **overlay on headlines**, glyphs stay crisp. |
| **Lightness**   | Move away from flat black toward a **dark blue-gray cement** surface, keeping the light text. **Do not use `Background.png`.** Texture must be built creatively (layered seamless texture + noise), **not** a smooth gradient — gradients read as too smooth.                                                                                       |
| **Map**         | Match the site palette and **keep the current structure/interaction**. Render the map **slightly lighter than the page** so it stands out against the darker surroundings. 3D building colors stay untouched.                                                                                                                                       |
| **News assets** | Fetch automatically: pull each article's `og:image` from its URL and source the outlet logos (SVT, Aftonbladet) as SVGs.                                                                                                                                                                                                                            |

### Note on ordering (recommendation)

The brief asked for **features first, then design**, so this plan keeps functional work
(Chunks 1–6) ahead of the visual system (Chunks 7–10). Feature chunks reference the
existing font/color tokens, so when Chunk 7 swaps those tokens the feature work re-skins
automatically — no throwaway work. **If you'd rather avoid seeing two visual states**,
Chunk 7 (foundation) can safely be pulled to the front; nothing in Chunks 1–6 depends on
the old fonts/colors specifically. Flagging the trade-off per CLAUDE.md §1 — default is to
follow the requested order.

---

# FEATURES

## Chunk 1 — Stats panel data update

**Goal:** Update the four numbers in the stats panel. The 3D houses on the map must stay
exactly as they are (data files and map layers untouched).

**Target stats (per the brief):**
| Cell | Definition | Source |
| --- | --- | --- |
| Småhus idag | unchanged | `smahusCurrent` |
| Lägenheter idag | unchanged | `flerboCurrent` |
| Bostäder 2060 | småhus idag + lägenheter idag + tillskott | `smahusCurrent + flerbo2060` |
| Förtätning | % increase of Bostäder 2060 vs (småhus idag + lägenheter idag) | `(smahusCurrent + flerbo2060 − base) / base × 100`, where `base = smahusCurrent + flerboCurrent` |

`tillskott = flerbo2060 − flerboCurrent` (the existing `flerbo2060` field already equals
"lägenheter idag + tillskott"). All four values derive from existing fields — **no data
migration needed.**

**Worked example (Botkyrka):** smahus 12 540, lägenheter 22 861, flerbo2060 39 861 →
Bostäder 2060 = **52 401**, base = 35 401, Förtätning = 17 000 / 35 401 = **48 %**.
(The stored `fortattning: 74` is the old definition — recompute in-component, do not trust it.)

**Files:**

- `src/components/map/StatsPanel.tsx` — change the `Bostäder 2060` cell to `fmt(stats.smahusCurrent + stats.flerbo2060)` and compute Förtätning locally instead of reading `stats.fortattning`.
- `src/data/housingStats.ts` — optional cleanup: the `fortattning` field is now unused. Either remove the field + interface property (touches all 26 entries) or leave it with a `// deprecated` comment. Prefer removing for clarity; keep `flerbo2060` (still used by the map + the new computation).
- The `view`/`isPlanned` branching in `StatsPanel` no longer changes the four headline numbers — simplify if it leaves dead code, but keep the (hidden) bar markup behavior intact unless trivially removable.

**Tests:** Add/extend a unit test for the stats computation (CLAUDE.md §3). Assert
Botkyrka → Bostäder 2060 = 52 401 and Förtätning = 48. If no test exists for this file,
add `StatsPanel` computation coverage or a small pure helper that's unit-testable.

**Done when:** Panel shows the four values correctly for a couple of spot-checked
municipalities; map buildings visually unchanged; tests pass.

**Commit:** `feat(map): update stats panel to Bostäder 2060 + förtätning definition`

---

## Chunk 2 — Map camera focuses on planned (red) buildings

**Goal:** When a kommun is clicked, the camera should frame the **red (planned)**
buildings more tightly than today.

**Context:** `selectMunicipality` in `MapSection.tsx` already computes the centroid of the
red features (`housingDataRef.current[2]`, filtered by `municipality === name`) and mixes
it with the bbox center via `centerMix`. The zoom is `camera.zoom + zoomDelta`.

**Files:** `src/components/sections/MapSection.tsx` (the `selectMunicipality` camera block,
roughly lines 310–397).

**Steps:**

- Bias the framing harder toward the red centroid: raise `centerMix` toward the red cluster (less bbox blending) so the camera sits over the planned buildings, not the municipality midpoint.
- Increase the zoom bias (`zoomDelta`) so the red cluster fills more of the frame, while keeping the cluster on-screen given the pitch (the existing southward `latSpan` shift compensates for pitch — re-tune if you zoom in further).
- Optionally compute a tight bounds of just the red features and `cameraForBounds` on those (with the same right-side panel padding) instead of the municipality bbox, falling back to the current behavior when a municipality has no/few red features.
- Keep the desktop right-panel padding (`{ top, bottom, left, right: 400 }`) and mobile uniform padding.

**Tests:** This is camera tuning — primarily manual. Verify across a large municipality
(Stockholm), a medium one (Nacka), and a small one (Vaxholm/Salem) that the red cluster is
centered and comfortably framed, and the polygon isn't pushed off-screen. Use the `verify`
or `run` skill to drive the app and eyeball it.

**Done when:** Clicking a kommun lands with the red planned buildings centered and filling
a clearly larger share of the viewport than before, at all three size tiers, mobile + desktop.

**Commit:** `feat(map): tighten kommun camera onto planned buildings`

---

## Chunk 3 — Map UX: toggle + "Alla kommuner" button

**Goal:** (a) The Idag↔Planerad toggle should read unmistakably as an interactive control.
(b) On desktop the "Alla kommuner" back-to-overview button should be bigger and clearly visible.

**Files:**

- `src/components/map/LayerToggle.tsx` — make the toggle obviously a button/switch: stronger affordance (clear track + thumb or clearly raised segmented buttons), higher contrast on the inactive segment (currently `text-white/50` is faint), visible hover/focus states, and a label so users grasp it's a toggle. Keep both `map` and `card` variants in sync.
- `src/components/map/BackButton.tsx` — used inside the detail list card.
- `src/components/map/StatsCard.tsx` — has its own inline "Alla kommuner" button (the `hidden md:flex` block, lines 15–34). This is the **desktop** back affordance that needs to be bigger/clearer.
- `src/components/sections/MapSection.tsx` — `toggleLeft` / overlay positioning may need adjustment if the toggle grows.

**Steps:**

- Redesign the toggle so the selected/unselected state is obvious at a glance; ensure tap target ≥44px and visible focus ring (a11y).
- Enlarge and strengthen the desktop "Alla kommuner" button (size, contrast, an obvious back arrow); make sure it doesn't collide with the stats heading.
- Re-check overlay anchoring (`toggleLeft`, `infoLeft`) so nothing overlaps after resizing.

**Tests:** Manual across desktop + mobile. Confirm toggle switches map view, focus/hover
states work, and the desktop back button returns to the overview.

**Done when:** A first-time user would intuitively use the toggle, and the desktop
"Alla kommuner" button is prominent. No overlap/clipping at common widths.

**Commit:** `feat(map): clearer view toggle and desktop back button`

---

## Chunk 4 — Visualizer left-align + video quote styling

Two small, independent content tweaks bundled into one session.

**Goal A — Visualizer left-aligned:** the cropped before/after visualizer image block is
currently centered (`max-w-4xl mx-auto`). Left-align it to match the section's text column.

- File: `src/components/sections/VisualizerSection.tsx` — remove `mx-auto` on the image
  wrapper (line ~32) so it left-aligns; align its left edge/padding with the heading and
  body copy (which use `pl-8`). Keep it responsive and within `max-w-7xl`.

**Goal B — Video quote matches the main headline:** in the video section the pull-quote
should use the **same font and red color as the main (intro) headline**.

- File: `src/components/sections/VideosSection.tsx` — the `<blockquote>` (lines ~23–28)
  currently uses `font-display ... italic` in off-white. Change it to the headline font
  (the same token the intro `<h1>` uses — `font-display` today, which becomes the heavy
  grotesque after Chunk 7) and the accent red (`text-accent`). Drop the italic if the
  intro headline isn't italic, to truly match.

**Tests:** Manual visual check on mobile + desktop.

**Done when:** Visualizer image block is left-aligned with the copy; the video quote
visually matches the intro headline's font + red color.

**Commit:** `feat(sections): left-align visualizer and restyle video quote`

---

## Chunk 5 — News assets: fetch OG images + outlet logos

**Goal:** Gather the assets the redesigned news cards need, automatically. Asset-only
chunk so Chunk 6 is pure layout.

**Articles (from `NewsSection.tsx`):**

1. Aftonbladet — `aftonbladet.se/nyheter/a/Eyrlwa/s-mal-blanda-befolkningen`
2. SVT — `svt.se/.../m-om-regionens-framtidsplan-socialdemokratisk-tvangsblandning`
3. SVT — `svt.se/.../socialdemokraterna-vill-blanda-befolkningen-men-ingen-ska-flytta`

**Steps:**

- For each article URL, fetch the page HTML and extract the `og:image` (fall back to `twitter:image`). Use `WebFetch` per URL, or a small Node script run once.
- Download each image into `public/news/` with stable, descriptive filenames (e.g. `aftonbladet-blanda.jpg`, `svt-tvangsblandning.jpg`, `svt-ingen-ska-flytta.jpg`). Optimize/resize to a sensible card size (≤~1200px wide, compressed) — these load on the page, performance matters (CLAUDE.md §2).
- Source outlet logos as SVG (SVT, Aftonbladet) into `public/news/logos/` (e.g. `svt.svg`, `aftonbladet.svg`). Editorial/attribution use.
- Record the filename→article mapping in the `articles` array in `NewsSection.tsx` (add `image` and `logo` fields to each entry) so Chunk 6 just consumes them.

**Tests:** N/A (assets). Verify files exist, open correctly, and are reasonably sized.

**Done when:** `public/news/` holds one image per article + outlet logo SVGs, and the
`articles` data carries `image` + `logo` paths.

**Commit:** `chore(news): add article OG images and outlet logos`

---

## Chunk 6 — News cards redesign (image-filled, logo overlay)

**Goal:** Replace the horizontal sliding menu with cards that **fill the container width**,
**no section title**, each card **filled with the article's OG image**, the **headline on
top**, and the **outlet logo overlaid** (logo SVG instead of the "SVT"/"Aftonbladet" text).

**Files:** `src/components/sections/NewsSection.tsx`.

**Steps:**

- Remove the section header block ("I media" + subtitle) — no title.
- Replace the `overflow-x-auto snap-x` scroller with a responsive layout that fills the container width: a grid (e.g. 1 col mobile → 3 cols desktop) or full-width stacked rows. No horizontal scroll.
- Each card: the article OG image as the (cover) background, a legibility scrim/overlay, the headline rendered on top, and the outlet logo SVG overlaid (corner). Remove the text source badge and the "Läs artikel" row, or keep a minimal affordance — keep scope tight; the headline + logo over the image is the requirement.
- Whole card stays a clickable link (`target="_blank" rel="noopener noreferrer"`).
- Use `next/image` for the OG images (perf + responsive `sizes`) if straightforward; otherwise `<img>` with explicit dimensions.
- Ensure headline contrast over varied images (scrim/gradient), and graceful behavior if an image is missing.

**Tests:** Manual across breakpoints; confirm cards fill width, no horizontal scroll,
logos render, links open.

**Done when:** News section is a title-less, full-width set of image-filled cards with
headline + outlet logo overlaid, links working, legible on all images.

**Commit:** `feat(news): image-filled article cards with logo overlay`

---

# DESIGN

## Chunk 7 — Design-system foundation (fonts, palette, textured background)

**Goal:** Establish the new visual tokens once, centrally, so the section chunks just
apply them. No per-section restyling here beyond what's needed to prove the tokens.

**Files:** `src/app/layout.tsx`, `src/app/globals.css`.

**Fonts:**

- In `layout.tsx`, remove DM Serif Display, Lora (and unused Inter/Geist/Oswald if truly unused) and load exactly two sans-serifs via `next/font/google`:
  - Headline: heavy grotesque — recommend **Anton** or **Archivo Black** (poster feel of the OG image). One weight.
  - Body/UI: **Inter** or **DM Sans**.
- In `globals.css` `@theme inline`, repoint `--font-display`/`--font-heading` → headline font and `--font-body`/`--font-ui` → body font, so existing `font-display`/`font-body`/`font-ui` class usages flip over without touching every component. (Keeps Chunks 1–6 work valid.)

**Palette (dark blue-gray cement):**

- Replace the flat-black canvas tokens. Set `--color-canvas` to a dark **blue-gray** (not pure black), keep `--color-on-canvas` as the existing light text, keep `--color-accent` red. Tune surface/border tokens to the blue-gray family.

**Textured background (must NOT be a smooth gradient; do NOT use `Background.png`):**

- Build a layered, reusable background treatment, e.g. a `.textured-canvas` utility composing:
  1. a dark blue-gray base color,
  2. the seamless cement texture (`public/Background_seemless.png`, light) tiled and blended over the dark base at low opacity via `mix-blend`/`background-blend-mode` (overlay/soft-light) so it darkens into the surface and reads as cement,
  3. a fine SVG fractal-noise grain (reuse/extend the existing `.hero-grain` turbulence) for tactile texture.
- Keep it performant: CSS/SVG-driven where possible; the existing `Background_seemless.png` is ~2.6 MB — if used as a tile, downsize/compress a dedicated tile asset rather than shipping the full image (CLAUDE.md §2).
- Add a headline grain/distress overlay utility (e.g. a pseudo-element with a noise texture + `mix-blend-mode`) to give headlines "some texture" while keeping glyphs crisp.

**Tests:** N/A (tokens). Sanity-check the app still builds and the home page renders with
the new fonts/background without layout breakage.

**Done when:** New fonts load, canvas is textured dark blue-gray (visibly not a gradient),
headline texture overlay utility exists, and the rest of the page still renders.

**Commit:** `feat(design): new font system, blue-gray palette, textured background`

**Docs:** Update `CLAUDE.md` / `README.md` and the memory typography note — the "final"
font stack changed (DM Serif/Lora → heavy grotesque + clean sans).

---

## Chunk 8 — Apply palette + texture + fonts to content sections

**Goal:** Roll the Chunk 7 tokens through every content section so the page reads as one
cohesive, textured, blue-gray design with the new headline/body fonts.

**Files:** `IntroSection.tsx`, `VideosSection.tsx`, `VisualizerSection.tsx`,
`NewsSection.tsx`, `ContactSection.tsx`, `Footer.tsx`, plus `contact/ContactForm.tsx`.

**Steps:**

- Apply the `.textured-canvas` background to the section wrappers (currently `bg-canvas`); ensure seamless texture continuity between stacked sections (no visible seams/tiling jumps).
- Replace hardcoded `rgba(242,240,235,…)` inline colors with the palette tokens where practical for consistency.
- Apply the headline texture overlay to the big headings (intro `<h1>`, section `<h2>`s).
- Re-check the red accent rules/borders against the new background contrast.
- Keep the "mixed-media" feel: consider the `Buildings.png` cutout as a collage element if it fits a section (only if it clearly improves cohesion — otherwise skip per strict scoping).

**Tests:** Manual visual pass across all sections, mobile + desktop.

**Done when:** All content sections share the textured blue-gray surface, new fonts, and
consistent accent treatment; no flat-black areas remain (except intentionally the map, per Chunk 9).

**Commit:** `feat(design): apply textured palette and fonts across sections`

---

## Chunk 9 — Map restyle to match the site

**Goal:** Make the map feel part of the site — same palette and fonts — while rendering
**slightly lighter than the page** so it stands out. Keep structure/interaction and the
3D building colors unchanged.

**Files:** `src/components/map/MapCanvas.tsx` (+ `public/map-style/*.json`),
`src/components/sections/MapSection.tsx` (layer paint/labels + overlay panels),
`src/lib/mapConfig.ts` (label/outline colors), and the overlay components
(`MunicipalityCard.tsx`, `StatsCard.tsx`, `StatsPanel.tsx`, info panel markup in `MapSection`).

**Steps:**

- Choose/adjust the base style so the map canvas is a **slightly lighter** blue-gray than the page surface (a `minimal`/`monochrome`/`color` style already exists in `public/map-style/`; recolor or pick the one closest to the palette). The neighboring-regions fill (`#000000`) and municipality fill (`#787878`) should move into the palette.
- Recolor municipality outlines, dim overlay, hover fill, and labels to the palette; keep the red highlight (`#b91c1c`) for selection.
- Restyle overlay panels (list card, stats card, info popover, dropdown) and the toggle/back buttons to the new tokens/fonts (they reference `font-ui`/`bg-canvas` today, so much follows from Chunk 7 — verify contrast against the lighter map).
- **Do not change** the 3D extrusion colors (`SMAHUS_COLOR`, `FLERBOSTADSHUS_COLOR`, `FLERBOSTADSHUS_NEW_COLOR`) — houses stay untouched.
- Map labels use Mapbox font stacks (`DIN Pro …`) — leave those (they're glyph PBFs, not the web fonts); just ensure overlay HTML uses the new fonts.

**Tests:** Manual. Confirm the map is legibly lighter than surroundings, overlays match
the site, buildings unchanged, interactions still work, no canvas-edge artifacts.

**Done when:** The map matches the site palette/fonts, sits a touch lighter than the page,
and stands out cleanly; buildings and interactions unchanged.

**Commit:** `feat(map): restyle map and overlays to match site palette`

---

## Chunk 10 — Homogenize sizing + responsive QA

**Goal:** Fix the "weirdly sized and placed" elements: unify the type scale, spacing
rhythm, container widths, and section padding, and verify seamless behavior across screen
sizes. This is the polish/consistency pass.

**Files:** Cross-cutting — all sections + map overlays; primarily spacing/size utilities,
possibly small shared utilities in `globals.css`.

**Steps:**

- Audit heading sizes across sections (intro `min(10vw,6.5rem)`, section `text-3xl/4xl`, news/visualizer `text-3xl/4xl`, contact `text-3xl/5xl`) and define a consistent responsive scale.
- Unify section vertical padding (`py-16 sm:py-24` vs `py-12`), container widths (`max-w-7xl`), and the left-accent-border + `pl-8` pattern so sections align.
- Normalize the map overlay sizing (panel `260px`, toggle/info offsets `toggleLeft`/`infoLeft`) and confirm no overlap/clipping at 360/768/1024/1280/1440+ widths.
- Walk through breakpoints (mobile portrait, tablet, landscape tablet, desktop, wide) and fix any cramped/misaligned/overflowing elements.

**Tests:** Manual responsive QA at the breakpoints above (use `run`/`verify` skill). Run
`format:check`, `lint`, `build`.

**Done when:** Type scale and spacing are consistent section-to-section, the map overlays
sit correctly, and the page looks intentional and seamless at every common width.

**Commit:** `style: homogenize sizing, spacing, and responsive layout`

---

## After all chunks

- Run `npm run format:check`, `npm run lint`, `npm run build` one final time.
- Update `README.md` / `CLAUDE.md` for any architectural changes (fonts, background system, new `public/news/` assets).
- Prepare the PR from `redesign` → `main`. **Do not merge** — notify for approval (CLAUDE.md §4).
