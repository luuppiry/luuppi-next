'use client';
import { signIn, signOut } from '@/actions/auth';
import { navLinksMobile } from '@/libs/constants';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { BiLogOutCircle } from 'react-icons/bi';
import { HiMenu } from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import { RiLoginCircleLine } from 'react-icons/ri';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './MobileHamburger.css';

const InstallPwaButton = dynamic(() => import('./InstallPwaButton'), {
  ssr: false,
});

interface MobileNavbarProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function MobileHamburger({
  dictionary,
  lang,
}: MobileNavbarProps) {
  const { data } = useSession();
  const session = data;
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <>
      <button
        aria-label={
          open
            ? `${dictionary.general.close} ${dictionary.general.menu.toLowerCase()}`
            : `${dictionary.general.open} ${dictionary.general.menu.toLowerCase()}`
        }
        className="btn btn-ghost lg:hidden"
        onClick={toggleMenu}
      >
        <HiMenu size={34} />
      </button>
      <dialog
        className={`modal text-base-content ${open && 'modal-open lg:hidden'}`}
        id="mobileNavbar"
      >
        <div className="modal-box flex h-full min-h-dvh w-screen max-w-full gap-4 rounded-none">
          <ul className="menu h-max w-full flex-nowrap gap-2">
            {navLinksMobile
              .filter(
                (link) =>
                  (link.authenticated && session?.user) || !link.authenticated,
              )
              .map((link, index) => (
                <li
                  key={link.translation}
                  className={`${index === navLinksMobile.length - 1 ? 'pb-6' : ''}`}
                >
                  {link.sublinks && link.sublinks.length > 0 ? (
                    <div className="flex items-center justify-between bg-secondary-400 font-bold text-white hover:cursor-auto hover:bg-secondary-400">
                      {
                        dictionary.navigation[
                        link.translation as keyof typeof dictionary.navigation
                        ]
                      }
                    </div>
                  ) : (
                    <Link
                      className="font-bold"
                      href={`/${lang}${link.href as string}`}
                      onClick={() => setOpen(false)}
                    >
                      {
                        dictionary.navigation[
                        link.translation as keyof typeof dictionary.navigation
                        ]
                      }
                    </Link>
                  )}
                  {link.sublinks && link.sublinks.length > 0 && (
                    <ul className="my-4">
                      {link.sublinks.map((sublink) => (
                        <li key={sublink.translation}>
                          <Link
                            className={`${sublink.href === '/' ? 'disabled cursor-not-allowed opacity-50' : ''} font-bold`} // TODO: REMOVE DISABLED LINKS
                            href={`/${lang}${sublink.href as string}`}
                            onClick={() => setOpen(false)}
                          >
                            {
                              dictionary.navigation[
                              sublink.translation as keyof typeof dictionary.navigation
                              ]
                            }
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            <li>
              <InstallPwaButton dictionary={dictionary} />
            </li>
          </ul>
          <div className="sticky top-0 z-10 flex justify-end">
            <div className="flex h-full flex-col items-center gap-4">
              <button
                aria-label={`${dictionary.general.close} ${dictionary.general.menu.toLowerCase()}`}
                className="btn btn-circle btn-primary text-white"
                onClick={() => setOpen(false)}
              >
                <IoMdClose size={32} />
              </button>
              <LanguageSwitcher />
              {session?.user ? (
                <button
                  aria-label={dictionary.general.logout}
                  className="btn btn-circle btn-ghost m-1 bg-error text-white"
                  type="submit"
                  onClick={async () => await signOut()}
                >
                  <BiLogOutCircle size={32} />
                </button>
              ) : (
                <button
                  aria-label={dictionary.general.login}
                  className="btn btn-circle btn-ghost m-1 bg-primary-400 text-white"
                  onClick={async () => await signIn()}
                >
                  <RiLoginCircleLine size={32} />
                </button>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
