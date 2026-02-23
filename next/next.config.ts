import type { NextConfig } from 'next';
import redirects from './strapi4-redirects.json' with { type: 'json' };

const strapi: URL = new URL(process.env.NEXT_PUBLIC_STRAPI_BASE_URL!);

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // https://github.com/vercel/next.js/blob/77bb08d129a46eae14cd73c8f6286741153755f3/packages/next/src/server/config-shared.ts#L1534
  cacheMaxMemorySize: 500 * 1024 * 1024 /* 500 mb (x10 of default) */,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      {
        protocol: strapi.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapi.hostname,
        port: strapi.port || undefined,
        pathname: '/uploads/**',
      },
    ],
    qualities: [75, 100],
    formats: ['image/avif', 'image/webp'],
  },
  redirects: async () =>
    Object.entries(redirects).map(([id, slug]) => ({
      source: `/:lang*/events/${id}`,
      destination: `/:lang*/events/${slug}`,
      permanent: true,
    })),
};

export default nextConfig;
