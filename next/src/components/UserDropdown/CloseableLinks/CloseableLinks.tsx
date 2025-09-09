'use client';
import { Dictionary } from '@/models/locale';
import Link from 'next/link';
import { MdOutlineBackup } from 'react-icons/md';
import { RiAdminLine, RiCalendarEventLine, RiUser3Fill } from 'react-icons/ri';

interface CloseableLinkProps {
  lang: string;
  dictionary: Dictionary;
  isLuuppiHato?: boolean;
  isLuuppiMember?: boolean;
}

export default function CloseableLink({
  lang,
  dictionary,
  isLuuppiHato,
  isLuuppiMember,
}: CloseableLinkProps) {
  const handleClick = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem?.blur();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Link
        className="btn btn-ghost btn-sm justify-start"
        href={`/${lang}/profile`}
        onClick={handleClick}
      >
        <RiUser3Fill size={22} />
        {dictionary.navigation.profile}
      </Link>
      <Link
        className="btn btn-ghost btn-sm justify-start"
        href={`/${lang}/own-events`}
        onClick={handleClick}
      >
        <RiCalendarEventLine size={22} />
        {dictionary.navigation.own_events}
      </Link>
      {!isLuuppiMember && (
        <Link
          className="btn btn-ghost btn-sm w-full justify-start"
          href={`/${lang}/migrate-account`}
        >
          <MdOutlineBackup size={22} />
          {dictionary.navigation.migrate_account}
        </Link>
      )}
      {isLuuppiHato && (
        <Link
          className="btn btn-ghost btn-sm justify-start"
          href={`/${lang}/admin?mode=user`}
          onClick={handleClick}
        >
          <RiAdminLine size={22} />
          {dictionary.navigation.admin}
        </Link>
      )}
    </div>
  );
}
