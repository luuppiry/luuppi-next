import redirects from './strapi4-redirects.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SLUG_MIGRATION_DONE: 'true',
  },
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
        hostname: process.env.NEXT_PUBLIC_STRAPI_BASE_URL.replace(
          'https://',
          '',
        ),
        pathname: '/uploads/**',
      },
    ],
  },
  redirects: async () => {
    return Object.keys(redirects).map((key) => ({
      source: `/:lang*/events/${key}`,
      destination: `/:lang*/events/${redirects[key]}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
