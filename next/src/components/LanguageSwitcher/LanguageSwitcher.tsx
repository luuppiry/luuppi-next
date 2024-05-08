'use client';
import { Locale } from '@/i18n-config';
import { usePathname, useRouter } from 'next/navigation';
import { BsGlobe } from 'react-icons/bs';

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
    document.cookie = `lang=${locale}; path=/; max-age=31536000`;
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <>
      <div className="dropdown dropdown-end">
        <div
          className="btn btn-circle btn-ghost m-1 bg-primary-600 max-lg:bg-secondary-400"
          role="button"
          tabIndex={0}
        >
          <BsGlobe color="white" size={32} />
        </div>
        <ul
          className="menu dropdown-content z-[1] w-52 gap-2 rounded-box bg-base-100 p-2 font-bold text-base-content shadow"
          tabIndex={0}
        >
          <li
            className={currentLocale === 'en' ? 'rounded-lg bg-base-300' : ''}
          >
            <button onClick={() => switchLocale('en')}>English</button>
          </li>
          <li
            className={currentLocale === 'fi' ? 'rounded-lg bg-base-300' : ''}
          >
            <button onClick={() => switchLocale('fi')}>Suomi</button>
          </li>
        </ul>
      </div>
    </>
  );
}
