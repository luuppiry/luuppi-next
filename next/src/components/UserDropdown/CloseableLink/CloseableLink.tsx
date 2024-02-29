'use client';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { RiUser3Fill } from 'react-icons/ri';

interface CloseableLinkProps {
  lang: SupportedLanguage;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function CloseableLink({
  lang,
  dictionary,
}: CloseableLinkProps) {
  const handleClick = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem?.blur();
    }
  };

  return (
    <Link
      className="btn btn-ghost btn-sm justify-start"
      href={`/${lang}/profile`}
      onClick={handleClick}
    >
      <RiUser3Fill size={22} />
      {dictionary.navigation.profile}
    </Link>
  );
}
