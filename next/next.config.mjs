import redirects from './strapi4-redirects.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_STRAPI_BASE_URL).hostname,
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
