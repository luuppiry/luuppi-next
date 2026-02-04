/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns:
      // FIXME: REMOVE
      process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'http',
              hostname: '**',
            },
            {
              protocol: 'https',
              hostname: '**',
            },
          ]
        : [
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
};

export default nextConfig;
