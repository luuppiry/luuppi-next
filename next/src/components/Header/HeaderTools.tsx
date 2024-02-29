import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { signIn, signOut } from 'next-auth/react';
import { RiLoginCircleLine } from 'react-icons/ri';
import MobileHamburger from '../MobileHamburger/MobileHamburger';
import UserDropdown from '../UserDropdown/UserDropdown';

interface HeaderToolsProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default async function HeaderTools({
  dictionary,
  lang,
}: HeaderToolsProps) {
  const session = await auth();

  const primise10sec = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve('resolved');
      }, 10000);
    });

  await primise10sec();

  return (
    <>
      {session && session.user ? (
        <>
          <div className="flex items-center justify-center max-lg:hidden">
            <UserDropdown dictionary={dictionary} lang={lang} />
          </div>
        </>
      ) : (
        <form
          action={async () => {
            'use server';
            await signIn('azure-ad-b2c');
          }}
        >
          <button
            className={
              'custom-scroll-text btn btn-ghost flex items-center rounded-lg bg-primary-600 px-4 py-2 text-lg font-bold transition-all max-xl:text-base max-lg:hidden'
            }
            type="submit"
          >
            {dictionary.general.login}
            <RiLoginCircleLine className="ml-2 inline-block" size={24} />
          </button>{' '}
        </form>
      )}
      <MobileHamburger
        dictionary={dictionary}
        isLogged={session && session.user ? true : false}
        lang={lang}
        signIn={async () => {
          'use server';
          await signIn('azure-ad-b2c');
        }}
        signOut={async () => {
          'use server';
          await signOut();
        }}
      />
    </>
  );
}
