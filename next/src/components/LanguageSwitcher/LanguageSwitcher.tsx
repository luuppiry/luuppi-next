'use client';
import { Locale } from '@/i18n-config';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import fiSvg from '../../../public/locale-icons/fi.svg';
import enSvg from '../../../public/locale-icons/us.svg';

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
      className="group btn btn-circle btn-ghost bg-primary-600 max-lg:bg-secondary-400"
      onClick={() => switchLocale(currentLocale === 'fi' ? 'en' : 'fi')}
    >
      {currentLocale === 'fi' ? (
        <Image
          alt="Suomi"
          draggable={false}
          height={38}
          src={fiSvg}
          width={38}
        />
      ) : (
        <Image
          alt="English"
          draggable={false}
          height={38}
          src={enSvg}
          width={38}
        />
      )}
    </button>
  );
}
