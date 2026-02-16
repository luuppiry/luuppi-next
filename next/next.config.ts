import type { NextConfig } from 'next';
import redirects from './strapi4-redirects.json' with { type: 'json' };

const strapi: URL = new URL(process.env.NEXT_PUBLIC_STRAPI_BASE_URL!);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  logging: { fetches: { fullUrl: true }, incomingRequests: true },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: strapi.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapi.hostname,
        pathname: '/uploads/**',
      },
    ],
  },
  redirects: async () => {
    return Object.entries(redirects).map(([id, slug]) => ({
      source: `/:lang*/events/${id}`,
      destination: `/:lang*/events/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
