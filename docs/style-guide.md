# Style Guide — Stockholm Housing Stock Visualizer

> Living reference for the visual language of the site. Aesthetic target: "Google Maps × The Sims" — playful and colorful, not gamified.
>
> All tokens are defined in `src/app/globals.css` inside the `:root` block. To update the palette, edit that file only — changes propagate everywhere automatically.

---

## Color Palette

### Brand colors

| Token                   | Tailwind class                | Hex       | Usage                                                        |
| ----------------------- | ----------------------------- | --------- | ------------------------------------------------------------ |
| `--color-primary`       | `bg-primary` / `text-primary` | `#5C8B5A` | Sage green — primary brand color                             |
| `--color-primary-light` | `bg-primary-light`            | `#EDF4EC` | Very light green wash — section backgrounds (Intro, Contact) |
| `--color-primary-dark`  | `bg-primary-dark`             | `#3A5C39` | Deep green — Header, Footer, hover states                    |
| `--color-accent`        | `bg-accent` / `text-accent`   | `#E8A838` | Warm amber — CTAs, interactive highlights                    |
| `--color-accent-light`  | `bg-accent-light`             | `#FDF3DC` | Light amber wash — accent section backgrounds                |

### Surface colors

| Token                   | Tailwind class     | Hex       | Usage                                                           |
| ----------------------- | ------------------ | --------- | --------------------------------------------------------------- |
| `--color-surface`       | `bg-surface`       | `#FAFAF7` | Warm off-white — default page/section background                |
| `--color-surface-muted` | `bg-surface-muted` | `#F0F0EA` | Slightly darker — alternating sections (Videos)                 |
| `--color-map-bg`        | `bg-map-bg`        | `#2C3E2D` | Dark green — Map section; high contrast, stands out from chrome |

### Text colors

| Token                  | Tailwind class      | Hex       | Usage                                                  |
| ---------------------- | ------------------- | --------- | ------------------------------------------------------ |
| `--color-text`         | `text-text`         | `#1C2B1C` | Near-black with green tint — primary body text         |
| `--color-text-muted`   | `text-text-muted`   | `#5A6B5A` | Muted — labels, captions, secondary text               |
| `--color-text-on-dark` | `text-text-on-dark` | `#F0F4EF` | Light — text on dark backgrounds (Header, Footer, Map) |

### Border colors

| Token                   | Tailwind class         | Hex       | Usage                                       |
| ----------------------- | ---------------------- | --------- | ------------------------------------------- |
| `--color-border`        | `border-border`        | `#D4DDD3` | Default subtle border                       |
| `--color-border-strong` | `border-border-strong` | `#8FAD8E` | Stronger border — emphasis, map placeholder |

---

## Section Color Map

| Section | Background         | Notes                                         |
| ------- | ------------------ | --------------------------------------------- |
| Header  | `bg-primary-dark`  | Dark green; text `text-text-on-dark`          |
| Intro   | `bg-surface`       | Warm off-white                                |
| Map     | `bg-map-bg`        | Darkest section — intentionally high contrast |
| Videos  | `bg-surface-muted` | Slightly tinted off-white                     |
| Contact | `bg-primary-light` | Light green wash                              |
| Footer  | `bg-primary-dark`  | Matches header                                |

---

## Typography

**Font family:** Geist Sans (loaded via `next/font/google`). Falls back to `system-ui, sans-serif`.

The type scale uses Tailwind's built-in utilities (`text-xs` through `text-4xl`). No custom size overrides.

| Tailwind class | Size | Usage                               |
| -------------- | ---- | ----------------------------------- |
| `text-xs`      | 12px | Labels, legal text                  |
| `text-sm`      | 14px | Nav links, captions, secondary body |
| `text-base`    | 16px | Body text                           |
| `text-lg`      | 18px | Lead / intro paragraph              |
| `text-2xl`     | 24px | Sub-headings                        |
| `text-3xl`     | 30px | Section headings                    |
| `text-4xl`     | 36px | Hero / page title                   |

---

## Border Radius

| Token         | Value     | Tailwind equivalent |
| ------------- | --------- | ------------------- |
| `--radius-sm` | `0.25rem` | `rounded-sm`        |
| `--radius-md` | `0.5rem`  | `rounded-md`        |
| `--radius-lg` | `0.75rem` | `rounded-lg`        |
| `--radius-xl` | `1rem`    | `rounded-xl`        |

---

## Dark Mode

Dark mode is applied automatically via `@media (prefers-color-scheme: dark)`. Only surface and text tokens are overridden — brand colors remain the same.

| Token                   | Light     | Dark      |
| ----------------------- | --------- | --------- |
| `--color-surface`       | `#FAFAF7` | `#0F1A0F` |
| `--color-surface-muted` | `#F0F0EA` | `#1A2B1A` |
| `--color-text`          | `#1C2B1C` | `#E8F0E8` |
| `--color-text-muted`    | `#5A6B5A` | `#9AB09A` |
| `--color-border`        | `#D4DDD3` | `#2E422E` |

---

## How to Update the Palette

1. Open `src/app/globals.css`
2. Find the `:root` block at the top
3. Change the hex values of the tokens you want to update
4. Save — all components update automatically (no component files need editing)

For dark mode adjustments, update the matching entries inside the `@media (prefers-color-scheme: dark)` block in the same file.
