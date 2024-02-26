'use client';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

interface HideableLinkProps {
  sublink: {
    translation: string;
    href: string;
  };
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
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
      }, 0);
    }
  };

  return (
    <Link
      key={sublink.translation}
      className="truncate rounded-lg p-2 font-bold hover:bg-gray-200"
      href={`/${lang}${sublink.href as string}`}
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
