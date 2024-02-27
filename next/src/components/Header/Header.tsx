import { auth, signIn, signOut } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import { RiArrowDropDownLine, RiLoginCircleLine } from 'react-icons/ri';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import MobileHamburger from '../MobileHamburger/MobileHamburger';
import UserDropdown from '../UserDropdown/UserDropdown';
import HideableLink from './HideableLink';
import ScrollListener from './ScrollListener';
import { navLinks } from './navLinks';

interface HeaderProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default async function Header({ dictionary, lang }: HeaderProps) {
  const session = await auth();
  return (
    <div>
      <ScrollListener />
      <div className="h-36 bg-primary-800 max-lg:h-16" />
      <header className={'fixed top-0 z-50 w-full bg-primary-800 text-white'}>
        <nav
          className={
            'custom-scroll-nav h-24 bg-primary-500 px-4 transition-all duration-300 max-lg:h-16 max-lg:shadow-md'
          }
        >
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
            <Link
              className={
                'custom-scroll-nav-image btn btn-link relative h-full w-36 transition-all duration-300 max-lg:w-24'
              }
              href={`/${lang}`}
            >
              <Image
                alt="Luuppi logo"
                className={'object-contain'}
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={'/luuppi.svg'}
                fill
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center max-lg:hidden">
                <LanguageSwitcher />
              </div>

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
                      'custom-scroll-text btn btn-ghost flex items-center rounded-lg bg-primary-600 px-4 py-2 text-lg font-bold transition-all max-lg:hidden'
                    }
                    type="submit"
                  >
                    {dictionary.general.login}
                    <RiLoginCircleLine
                      className="ml-2 inline-block"
                      size={24}
                    />
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
            </div>
          </div>
        </nav>
        <ul className="mx-auto flex max-w-[1200px] justify-center gap-1 px-4 max-lg:hidden">
          {navLinks
            .filter((link) => !link?.mobileOnly)
            .map((link) => (
              <li
                key={link.translation}
                className="group relative cursor-pointer"
              >
                {link.sublinks && link.sublinks.length > 0 ? (
                  <div
                    className={
                      'custom-scroll-text flex h-full items-center justify-center p-2 text-lg font-bold transition-all duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200'
                    }
                  >
                    <span>
                      {
                        dictionary.navigation[
                          link.translation as keyof typeof dictionary.navigation
                        ]
                      }
                    </span>
                    {link.sublinks && link.sublinks.length > 0 && (
                      <div className="w-6">
                        <RiArrowDropDownLine
                          className="transition-transform duration-300 group-hover:rotate-180"
                          size={32}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    className={
                      'custom-scroll-text flex h-full items-center justify-center p-2 text-lg font-bold transition-all duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200'
                    }
                    href={`/${lang}${link.href as string}`}
                  >
                    <span>
                      {
                        dictionary.navigation[
                          link.translation as keyof typeof dictionary.navigation
                        ]
                      }
                    </span>
                    {link.sublinks && link.sublinks.length > 0 && (
                      <div className="w-6">
                        <RiArrowDropDownLine
                          className="transition-transform duration-300 group-hover:rotate-180"
                          size={32}
                        />
                      </div>
                    )}
                  </Link>
                )}
                {link.sublinks && link.sublinks.length > 0 && (
                  <div className="invisible absolute z-50 flex min-w-full flex-col bg-gray-100 px-2 py-4 text-gray-800 shadow-xl group-hover:visible">
                    {link.sublinks.map((sublink) => (
                      <HideableLink
                        key={sublink.translation}
                        dictionary={dictionary}
                        lang={lang}
                        sublink={sublink}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
        </ul>
      </header>
    </div>
  );
}
