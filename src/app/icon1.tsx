import { ImageResponse } from 'next/og';

// Raster (PNG) favicon for browsers that don't reliably render the SVG favicon
// in tab UI — notably Safari on iOS. Mirrors icon.svg (rounded blue tile, flock).
export const size = { width: 96, height: 96 };
export const contentType = 'image/png';

const flockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="10" fill="#2b3849"/><g stroke="#f2f0eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(12 21) scale(1.5)"/><path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(7 15) scale(0.9)"/><path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(27 17) scale(1)"/></g></svg>`;

export default function Icon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(flockSvg).toString('base64')}`;

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* next/image is unavailable inside ImageResponse (Satori); a raw <img> is required. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img width={size.width} height={size.height} src={src} alt="" />
    </div>,
    size,
  );
}
