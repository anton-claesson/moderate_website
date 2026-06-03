import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stoppa (S) miljonprogram',
    short_name: 'Stoppa miljonprogram',
    description:
      'Alla Stockholms kommuner ska förtätas med storskalig höghusbebyggelse. Se hur din kommun påverkas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#2b3849',
    theme_color: '#2b3849',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
