import { auth, signOut } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { BiLogOutCircle } from 'react-icons/bi';
import { RiUser3Fill } from 'react-icons/ri';
import CloseableLink from './CloseableClient';

interface UserDropdownProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default async function UserDropdown({
  dictionary,
  lang,
}: UserDropdownProps) {
  const session = await auth();
  if (!session?.user) return null;

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
          <span className="truncate font-bold" title={session.user?.name ?? ''}>
            {session.user?.name}
          </span>
          <span className="truncate text-sm" title={session.user?.email ?? ''}>
            {session.user?.email}
          </span>
        </div>
        <CloseableLink dictionary={dictionary} lang={lang} />
        <div className="divider my-1" />
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
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
