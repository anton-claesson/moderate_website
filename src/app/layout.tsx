import type { Metadata, Viewport } from 'next';
import { Anton, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Headline: heavy condensed grotesque (poster lettering). Single weight.
const anton = Anton({
  variable: '--font-anton',
  subsets: ['latin'],
  weight: ['400'],
});

// Body / UI: clean neutral sans.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stoppa (S) miljonprogram',
  description:
    'Alla Stockholms kommuner ska förtätas med storskalig höghusbebyggelse. Se hur din kommun påverkas.',
  openGraph: {
    title: 'Stoppa (S) miljonprogram',
    description:
      'Alla Stockholms kommuner ska förtätas med storskalig höghusbebyggelse. Se hur din kommun påverkas.',
    images: ['/og_image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#2b3849',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${anton.variable} ${inter.variable} h-full w-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <link rel="dns-prefetch" href="https://tiles.mapbox.com" />
      </head>
      <body className="min-h-full w-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
