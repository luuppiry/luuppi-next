'use client';
import { getDictionary } from '@/dictionaries';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { RiArrowDropDownLine, RiLoginCircleLine } from 'react-icons/ri';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { navLinks } from './navLinks';

export default function Header({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>['navigation'];
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    if (typeof window === 'undefined') return;
    const position = window.scrollY;
    setScrollPosition(position);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <div className="h-36 bg-primary-800 max-lg:h-16" />
      <header className={'fixed top-0 z-50 w-full bg-primary-800 text-white'}>
        <nav
          className={`bg-primary-500 px-4 transition-all duration-300 max-lg:h-16 max-lg:shadow-md ${
            scrollPosition > 100 ? 'h-16' : 'h-24'
          }`}
        >
          <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between">
            <Link
              className={`btn btn-link relative h-full transition-all duration-300 ${
                scrollPosition > 100 ? 'w-24' : 'w-36 max-lg:w-24'
              }`}
              href="/"
            >
              <Image
                alt="Luuppi"
                className={'object-contain'}
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={'/luuppi.svg'}
                fill
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                className={`btn btn-ghost flex items-center rounded-lg bg-primary-600 px-4 py-2 font-bold transition-all max-lg:hidden ${
                  scrollPosition > 100 ? 'text-lg' : 'text-xl'
                }`}
              >
                {dictionary.login}
                <RiLoginCircleLine className="ml-2 inline-block" size={24} />
              </button>
              <button className="btn btn-ghost cursor-pointer lg:hidden">
                <HiMenu size={36} />
              </button>
            </div>
          </div>
        </nav>
        <ul className="mx-auto flex max-w-screen-xl justify-center gap-1 px-4 max-lg:hidden">
          {navLinks.map((link) => (
            <li
              key={link.translation}
              className="group relative cursor-pointer"
            >
              <Link
                className={`transition- flex h-full items-center justify-center p-2 font-bold duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200 ${
                  scrollPosition > 100 ? 'text-lg' : 'text-xl'
                }`}
                href="/"
              >
                <span>{dictionary[link.translation]}</span>
                {link.sublinks.length > 0 && (
                  <div className="w-6">
                    <RiArrowDropDownLine
                      className="transition-transform duration-300 group-hover:rotate-180"
                      size={32}
                    />
                  </div>
                )}
              </Link>
              {link.sublinks.length > 0 && (
                <div className="invisible absolute z-50 flex min-w-full flex-col bg-gray-100 px-2 py-4 text-gray-800 shadow-xl group-hover:visible">
                  {link.sublinks.map((sublink) => (
                    <Link
                      key={sublink.name}
                      className="truncate rounded-lg p-2 text-xl font-bold hover:bg-gray-200"
                      href="/"
                    >
                      {dictionary[sublink.name]}
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
