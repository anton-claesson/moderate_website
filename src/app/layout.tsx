import type { Metadata } from 'next';
import { Inter, Geist_Mono, DM_Serif_Display, Lora, DM_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '600'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['500', '700'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${inter.variable} ${geistMono.variable} ${dmSerifDisplay.variable} ${lora.variable} ${dmSans.variable} h-full w-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <link rel="dns-prefetch" href="https://tiles.mapbox.com" />
      </head>
      <body className="min-h-full w-full flex flex-col">{children}</body>
    </html>
  );
}
