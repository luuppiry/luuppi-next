'use client';
import { signOut } from '@/actions/auth';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useSession } from 'next-auth/react';
import { BiLogOutCircle } from 'react-icons/bi';
import { RiUser3Fill } from 'react-icons/ri';
import CloseableLink from './CloseableLink/CloseableLink';

interface UserDropdownProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function UserDropdown({ dictionary, lang }: UserDropdownProps) {
  const { data } = useSession();
  const session = data;
  if (!session) return null;

  return (
    <div className="dropdown dropdown-end text-white">
      <div
        aria-label={`${dictionary.general.open} ${dictionary.general.menu.toLowerCase()}`}
        className="btn btn-circle btn-ghost m-1 bg-primary-600 max-lg:bg-secondary-400"
        role="button"
        tabIndex={0}
      >
        <div className="avatar p-1">
          <div className="rounded-full">
            <RiUser3Fill size={24} />
          </div>
        </div>
      </div>
      <div
        className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 text-black shadow"
        tabIndex={0}
      >
        <div className="mb-2 flex max-w-full flex-col p-2">
          <span className="truncate font-bold" title={session.user?.name ?? ''}>
            {session.user?.name}
          </span>
          <span className="truncate text-sm" title={session.user?.email ?? ''}>
            {session.user?.email}
          </span>
        </div>
        <CloseableLink dictionary={dictionary} lang={lang} />
        <div className="divider my-1" />
        <form action={async () => await signOut()}>
          <button
            className="btn btn-error btn-sm w-full justify-start text-white"
            type="submit"
          >
            <BiLogOutCircle size={22} />
            {dictionary.general.logout}
          </button>
        </form>
      </div>
    </div>
  );
}
