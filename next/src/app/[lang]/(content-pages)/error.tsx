'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import roboSvg from '../../../../public/robo_500.svg';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Try to get /en or /fi from params
  const paramLanguage = window.location.pathname.split('/')?.[1];

  // Get the language from the browser
  const browserLang = navigator.language.split('-')[0].toLowerCase();

  // If params language is not 'en' or 'fi', use the browser language as a fallback
  const lang =
    paramLanguage === 'en' || paramLanguage === 'fi'
      ? paramLanguage
      : browserLang;

  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex items-center justify-between gap-12 max-lg:flex-col max-md:items-start">
      <div className="flex flex-col gap-4">
        <h1>{lang === 'en' ? 'Unexpected error' : 'Odottamaton virhe'}</h1>
        <p className="max-w-xl text-lg max-md:text-base">
          {lang === 'en'
            ? 'An unexpected error occurred. This should not happen, so to fix the problem, it is recommended to contact the WWW/IT responsible by email: webmaster@luuppi.fi'
            : 'Odottamaton virhe tapahtui. Tätä ei pitäisi tapahtua, joten ongelman korjaamiseksi on suositeltavaa ottaa yhteyttä WWW/IT-vastaaviin sähköpostitse: webmaster@luuppi.fi'}
        </p>
        <div>
          <button
            className="btn btn-primary btn-sm text-lg"
            onClick={() => reset()}
          >
            {lang === 'en' ? 'Try again' : 'Yritä uudelleen'}
          </button>
        </div>
      </div>
      <div>
        <Image alt="404" height={550} src={roboSvg} width={550} />
      </div>
      <div className="luuppi-pattern absolute -left-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
    </div>
  );
}
