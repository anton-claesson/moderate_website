import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // This will match /solna, /Nacka, /Upplands-Bro etc.
        source: '/:municipality',
        destination: '/?m=:municipality',
      },
    ];
  },
};

export default nextConfig;
