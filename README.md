# Stockholm Housing Stock Visualizer

A static, mobile-first web application visualizing current and planned housing construction across the Stockholm Region.

Built with Next.js, Mapbox GL JS, and static GeoJSON. Deployed on Vercel.

---

## Local Development

**Prerequisites:** Node.js 24, npm

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in the required values (see Environment Variables below)

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other useful commands:

```bash
npm run lint          # ESLint
npm run format        # Prettier (writes)
npm run format:check  # Prettier (check only)
npm run build         # Production build
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.local`.

| Variable                   | Required  | Description                                                                              |
| -------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | From F2.1 | Mapbox GL JS access token — get one at [account.mapbox.com](https://account.mapbox.com/) |

When deploying, add these variables in the Vercel project dashboard under **Settings → Environment Variables**.

---

## Deployment

The project is deployed on Vercel.

- **Production:** Merging to `main` triggers an automatic production deploy.
- **Preview:** Every pull request gets an isolated preview URL via Vercel's GitHub integration.
- **CI gate:** GitHub Actions runs lint, format check, and `next build` on every push and PR. Merging is blocked until all checks pass.

### First-time Vercel setup (one-time)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `jonahaag/moderate_website`
2. Framework is auto-detected as Next.js — keep defaults
3. Add `NEXT_PUBLIC_MAPBOX_TOKEN` under Environment Variables (can be empty initially)
4. Deploy

---

## Project Structure

```
src/
  app/          # Next.js App Router (pages, layouts)
  components/   # React components
  data/         # Data utilities
  lib/          # Shared utilities
  styles/       # Additional stylesheets
public/
  data/         # Static GeoJSON files (added in Phase 3)
```

---

## Tech Stack

| Layer     | Choice               |
| --------- | -------------------- |
| Framework | Next.js (App Router) |
| Map       | Mapbox GL JS         |
| Data      | Static GeoJSON       |
| Styling   | Tailwind CSS         |
| Hosting   | Vercel               |
