# Phase 5 — Contact / Newsletter: Implementation Plan

> Phase 5 — Contact / Newsletter. Features F5.1, F5.2, F5.3. **Complete — merged in #9.**
> Branch: `feature/contact-form` (delete after merge).

---

## Context

Phases 0–4 deliver the full interactive map experience. Phase 5 converts visitors into leads by adding a contact/newsletter signup form. The stakeholder hasn't finalized a long-term email platform, so the implementation uses **Formspree** as a thin, easily-swappable layer — no new npm dependencies, just a `fetch` POST. A future review (F8.5) will evaluate migrating to a dedicated newsletter tool once subscriber volumes and requirements are clearer.

---

## Decisions Resolved This Phase

| ID | Decision | Resolution |
|----|----------|-----------|
| D6 | Form backend provider | **Formspree.** EU data storage, GDPR-ready, AJAX mode, free tier ~50 submissions/month. No new npm dependencies. Swap cost = one env var change. Platform review deferred to F8.5. |

---

## Fields

| Field | Type | Required |
|---|---|---|
| Namn | `text` | Yes |
| E-post | `email` | Yes |
| Telefon | `tel` | No |
| Postnummer / Kommun | `text` | No |

---

## Files Changed

| File | Change |
|---|---|
| `src/components/contact/ContactForm.tsx` | New — form component with all state and submission logic |
| `src/components/sections/ContactSection.tsx` | Replaced stub with section heading + `<ContactForm />` |
| `.env.example` | Added `NEXT_PUBLIC_FORMSPREE_URL` with setup instructions |
| `project_plan.md` | F5.1–F5.3 marked done; D6 resolved; F8.5 added to Phase 8 |

---

## Architecture

`ContactSection` is a thin layout wrapper (section heading + copy). All form logic lives in the extracted `ContactForm` component so it can be tested and swapped independently.

### Form states

```
idle → submitting → success (form replaced by thank-you)
                 ↘ error   (inline banner, form re-enabled)
```

### Submission flow

```ts
fetch(process.env.NEXT_PUBLIC_FORMSPREE_URL!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ Namn, 'E-post', Telefon?, 'Postnummer/Kommun'? }),
})
```

Optional fields are omitted from the payload when empty (sent as `undefined`).

### Validation

- Client-side only (no server round-trip for validation errors)
- Namn: non-empty trim check
- E-post: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- GDPR checkbox: `required` attribute + submit button disabled until checked

### GDPR consent

Required checkbox with inline Swedish privacy copy — no separate privacy policy page at this stage. Copy states: data stored on Formspree EU servers, used only for project updates, deletable on request via email.

---

## Styling

Follows existing design tokens throughout:

| Element | Classes |
|---|---|
| Section background | `bg-primary-light` |
| Form card | `rounded-xl bg-surface border border-border p-6 sm:p-8` |
| Inputs | `rounded-md border border-border bg-surface px-3 py-2 text-sm` + `focus:ring-2 focus:ring-primary` |
| Submit button | `bg-accent text-white rounded-md` (amber CTA, matches site pattern) |
| Error banner | `text-red-600 bg-red-50 border border-red-200 rounded-md` |
| Labels | `text-sm text-text-muted` |
| Section eyebrow | `text-sm font-medium text-text-muted uppercase tracking-widest` |

Layout: single-column on mobile → 2-column grid on `md+` for the four fields.

---

## Formspree Setup (one-time)

1. Create account at [formspree.io](https://formspree.io)
2. New form → enable **EU data storage** and **AJAX mode**
3. Copy endpoint URL → add to `.env.local`:
   ```
   NEXT_PUBLIC_FORMSPREE_URL=https://formspree.io/f/<your-form-id>
   ```

---

---

## F5.4 — Aesthetic Refinements (2026-04-21)

Post-launch polish pass to move away from a generic out-of-the-box look.

### Files Changed

| File | Change |
|---|---|
| `src/app/layout.tsx` | Font switched from Geist to Space Grotesk via `next/font/google` |
| `src/components/sections/IntroSection.tsx` | Headline scaled to `text-5xl sm:text-7xl` with `leading-[1.1]`; first body paragraph bumped to `text-xl` |
| `src/components/sections/VideosSection.tsx` | Eyebrow "Videos" label removed; `border-t border-border` divider added; centered placeholder text above video grid |
| `src/components/sections/ContactSection.tsx` | Eyebrow label removed (already done); `border-t border-border` removed |
| `src/components/contact/ContactForm.tsx` | Card wrapper removed; inputs switched to bottom-border-only style (`border-b`, `bg-transparent`); submit button changed to pill (`rounded-full px-8`); success state simplified to plain text |
| `src/components/Footer.tsx` | Reduced to single slim bar on `bg-primary-light`; only copyright, data note, and email retained |
| `project_plan.md` | F5.4 added and marked done; change log entry added |

---

## Verification Checklist

- [ ] Submit with all fields filled → Formspree dashboard shows all 4 fields
- [ ] Submit without Namn or E-post → client validation blocks, error message shown
- [ ] Submit with invalid email format → error message shown
- [ ] Submit without GDPR checkbox → button remains disabled
- [ ] Simulate Formspree failure (wrong URL) → error state renders, form re-enabled
- [ ] Mobile 375px — single-column layout, no overflow, all fields accessible
- [ ] `npm run lint && npm run format:check` — both pass
