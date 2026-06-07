import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moderate-website.vercel.app';

// Stable last-content-update date. Bump this only when the page content
// meaningfully changes. Using a fixed date (instead of `new Date()`) avoids
// stamping a fresh `lastmod` on every deploy, which made Google show a
// recent "X days ago" date in the search snippet.
const LAST_CONTENT_UPDATE = new Date('2026-06-03');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
