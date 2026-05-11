import type { Metadata } from 'next';
import { Inter, Geist_Mono, Oswald, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['500', '700'],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Stoppa miljonprogrammen',
  description: 'Se hur de nya miljonprogrammen påverkar din hemkommun!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${inter.variable} ${geistMono.variable} ${oswald.variable} ${dmSerifDisplay.variable} h-full w-full antialiased`}
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
