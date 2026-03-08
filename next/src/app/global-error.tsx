'use client';
import { reloadIfStale } from '@/libs/utils/stale-deployment';
import { useEffect } from 'react';
import Robo from '../../public/robo_500.svg';

import '@/app/[lang]/globals.css';
import Image from 'next/image';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (reloadIfStale(error)) return;
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="fi">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center font-sans text-base-content">
        <Image alt="" className="mb-20" src={Robo} />

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Odottamaton virhe / Unexpected error
        </h1>
        <p className="text-base-content/60">
          Ongelman korjaamiseksi ota yhteyttä WWW/IT-vastaaviin:{' '}
          <a className="link" href="mailto:webmaster@luuppi.fi">
            webmaster@luuppi.fi
          </a>
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Lataa uudelleen / Reload
        </button>
      </body>
    </html>
  );
}
