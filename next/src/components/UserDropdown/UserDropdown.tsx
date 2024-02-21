'use client';
import { getDictionary } from '@/dictionaries';
import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { BiLogOutCircle } from 'react-icons/bi';
import { RiUser3Fill } from 'react-icons/ri';

interface UserDropdownProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function UserDropdown({ dictionary }: UserDropdownProps) {
  const { instance } = useMsal();
  const account = instance.getActiveAccount();

  const handleClose = () => {
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleLogout = async () => {
    handleClose();
    await instance.logout();
  };

  if (!account) return null;

  return (
    <div className="dropdown dropdown-end text-white">
      <div
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
        <div className="flex max-w-full flex-col p-2">
          <span className="truncate font-bold" title={account.name}>
            {account.name}
          </span>
          <span className="truncate text-sm" title={account.username}>
            {account.username}
          </span>
        </div>
        <Link
          className="btn btn-ghost btn-sm justify-start"
          href="/profile"
          onClick={handleClose}
        >
          <RiUser3Fill size={22} />
          {dictionary.navigation.profile}
        </Link>
        <div className="divider my-1" />
        <button
          className="btn btn-error btn-sm w-full justify-start text-white"
          onClick={handleLogout}
        >
          <BiLogOutCircle size={22} />
          {dictionary.general.logout}
        </button>
      </div>
    </div>
  );
}
