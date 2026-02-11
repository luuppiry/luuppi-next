/** @type {{[id: number]: string}} */
let redirects = {};

try {
  // FIXME: add directly to source control after redirects have been generated -- this solution is temporary
  redirects = await fetch(
    `${NEXT_PUBLIC_STRAPI_BASE_URL}/uploads/strapi4-redirects.json`,
  ).then((res) => res.json());
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SLUG_MIGRATION_DONE: Object.keys(redirects).length,
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
      source: `/events/${key}`,
      destination: `/events/${redirects[key]}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
