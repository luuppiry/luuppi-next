'use client';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { RiArrowDropDownLine, RiLoginCircleLine } from 'react-icons/ri';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import MobileHamburger from '../MobileHamburger/MobileHamburger';
import { navLinks } from './navLinks';

interface HeaderProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function Header({ dictionary, lang }: HeaderProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mobileHarmburgerOpen, setMobileHarmburgerOpen] = useState(false);
  const { instance } = useMsal();

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileHamburger = () => {
    setMobileHarmburgerOpen(!mobileHarmburgerOpen);
  };

  // Tällä rahalla saa tällästä tälläkertaa
  const hideAfterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const group = e.currentTarget.parentElement as HTMLElement;
    if (group) {
      group.style.display = 'none';
      setTimeout(() => {
        group.style.display = 'flex';
      }, 0);
    }
  };

  const handleLogin = async () => {
    try {
      await instance.loginRedirect();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await instance.logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div>
      <MobileHamburger
        dictionary={dictionary}
        lang={lang}
        open={mobileHarmburgerOpen}
        onClose={toggleMobileHamburger}
      />
      <div className="h-36 bg-primary-800 max-lg:h-16" />
      <header className={'fixed top-0 z-50 w-full bg-primary-800 text-white'}>
        <nav
          className={`bg-primary-500 px-4 transition-all duration-300 max-lg:h-16 max-lg:shadow-md ${
            scrollPosition > 100 ? 'h-16 max-lg:h-16' : 'h-24 max-lg:h-16'
          }`}
        >
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
            <Link
              className={`btn btn-link relative h-full transition-all duration-300 ${
                scrollPosition > 100 ? 'w-24' : 'w-36 max-lg:w-24'
              }`}
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
              <AuthenticatedTemplate>
                <button
                  className={`btn btn-ghost flex items-center rounded-lg bg-primary-600 px-4 py-2 font-bold transition-all max-lg:hidden ${
                    scrollPosition > 100 ? 'text-base' : 'text-lg'
                  }`}
                  onClick={handleLogout}
                >
                  {dictionary.general.logout}
                  <RiLoginCircleLine className="ml-2 inline-block" size={24} />
                </button>
              </AuthenticatedTemplate>
              <UnauthenticatedTemplate>
                <button
                  className={`btn btn-ghost flex items-center rounded-lg bg-primary-600 px-4 py-2 font-bold transition-all max-lg:hidden ${
                    scrollPosition > 100 ? 'text-base' : 'text-lg'
                  }`}
                  onClick={handleLogin}
                >
                  {dictionary.general.login}
                  <RiLoginCircleLine className="ml-2 inline-block" size={24} />
                </button>
              </UnauthenticatedTemplate>
              <button
                className="btn btn-ghost lg:hidden"
                onClick={toggleMobileHamburger}
              >
                <HiMenu size={34} />
              </button>
            </div>
          </div>
        </nav>
        <ul className="mx-auto flex max-w-[1200px] justify-center gap-1 px-4 max-lg:hidden">
          {navLinks.map((link) => (
            <li
              key={link.translation}
              className="group relative cursor-pointer"
            >
              {link.sublinks && link.sublinks.length > 0 ? (
                <div
                  className={`flex h-full items-center justify-center p-2 font-bold transition-all duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200 ${
                    scrollPosition > 100 ? 'text-base' : 'text-lg'
                  }`}
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
                  className={`flex h-full items-center justify-center p-2 font-bold transition-all duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200 ${
                    scrollPosition > 100 ? 'text-base' : 'text-lg'
                  }`}
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
