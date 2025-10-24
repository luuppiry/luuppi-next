'use client';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

interface HideableLinkProps {
  sublink: {
    translation: string;
    href: string;
  };
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function HideableLink({
  sublink,
  dictionary,
  lang,
}: HideableLinkProps) {
  // TODO: Improve
  const hideAfterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const group = e.currentTarget.parentElement as HTMLElement;
    if (group) {
      group.style.display = 'none';
      setTimeout(() => {
        group.style.display = 'flex';
      }, 50);
    }
  };

  return (
    <Link
      key={sublink.translation}
      className={`${
        sublink.href === '/' ? 'disabled cursor-not-allowed opacity-50' : ''
      } truncate rounded-lg p-2 font-bold hover:bg-gray-200 dark:hover:bg-primary-300`} // TODO: Remove disabled links
      href={
        sublink.href.startsWith('/')
          ? `/${lang}${sublink.href as string}`
          : sublink.href
      }
      onClick={hideAfterClick}
    >
      {
        dictionary.navigation[
          sublink.translation as keyof typeof dictionary.navigation
        ]
      }
    </Link>
  );
}
