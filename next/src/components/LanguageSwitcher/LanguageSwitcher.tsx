'use client';
import { Locale } from '@/i18n-config';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathName = usePathname();
  const router = useRouter();
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/';
    const segments = pathName.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  const currentLocale = pathName?.split('/')[1] as Locale;

  const switchLocale = (locale: Locale) => {
    router.push(redirectedPathName(locale));
  };

  return (
    <button
      className="btn btn-ghost btn-square group rounded-full bg-primary-600 p-1 max-lg:hidden"
      onClick={() => switchLocale(currentLocale === 'fi' ? 'en' : 'fi')}
    >
      {currentLocale === 'fi' ? (
        <Image
          alt="Suomi"
          draggable={false}
          height={38}
          src={'/locale-icons/fi.svg'}
          width={38}
        />
      ) : (
        <Image
          alt="English"
          draggable={false}
          height={38}
          src={'/locale-icons/us.svg'}
          width={38}
        />
      )}
    </button>
  );
}
