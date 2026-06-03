import { ImageResponse } from 'next/og';

// iOS home-screen icon. Full-bleed blue square (iOS masks the corners itself),
// reusing the same bird-flock motif as icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Square (non-rounded) variant of the favicon — same flock, full-bleed background.
const flockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" fill="#2b3849"/><g stroke="#f2f0eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(12 21) scale(1.5)"/><path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(7 15) scale(0.9)"/><path d="M0 8 L5 2 L8 6 L11 2 L16 8" transform="translate(27 17) scale(1)"/></g></svg>`;

export default function AppleIcon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(flockSvg).toString('base64')}`;

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <img width={size.width} height={size.height} src={src} alt="" />
    </div>,
    size,
  );
}
