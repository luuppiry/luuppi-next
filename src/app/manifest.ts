import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luuppi ry',
    short_name: 'Luuppi',
    description:
      'Luuppi ry is subject assosiation for students of mathematics, statistical data analysis and computer science at Tampere University.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon1.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon2.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
