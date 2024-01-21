'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { RiArrowDropDownLine, RiLoginCircleLine } from 'react-icons/ri';

const links = [
  {
    name: 'Home',
    href: '/',
    sublinks: [],
  },
  {
    name: 'Organization',
    href: '/organization',
    sublinks: [
      {
        name: 'Example 1',
        href: '/',
      },
      {
        name: 'Example 2',
        href: '/',
      },
      {
        name: 'Example 3',
        href: '/',
      },
    ],
  },
  {
    name: 'Studying',
    href: '/studying',
    sublinks: [
      {
        name: 'Example 1',
        href: '/',
      },
      {
        name: 'Example 2',
        href: '/',
      },
      {
        name: 'Example 3',
        href: '/',
      },
    ],
  },
  {
    name: 'Tutoring',
    href: '/services',
    sublinks: [
      {
        name: 'Example 1',
        href: '/',
      },
      {
        name: 'Example 2',
        href: '/',
      },
      {
        name: 'Example 3',
        href: '/',
      },
    ],
  },
  {
    name: 'Events',
    href: '/student-union',
    sublinks: [
      {
        name: 'Example 1',
        href: '/',
      },
      {
        name: 'Example 2',
        href: '/',
      },
      {
        name: 'Example 3',
        href: '/',
      },
    ],
  },
  {
    name: 'Blog',
    href: '/contact',
    sublinks: [
      {
        name: 'Example 1',
        href: '/',
      },
      {
        name: 'Example 2',
        href: '/',
      },
      {
        name: 'Example 3',
        href: '/',
      },
    ],
  },
  {
    name: 'Other',
    href: '/contact',
    sublinks: [
      {
        name: 'Example 1',
        href: '/',
      },
      {
        name: 'Example 2',
        href: '/',
      },
      {
        name: 'Example 3',
        href: '/',
      },
    ],
  },
];

export default function Header() {
  // Create fixed header on scroll
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  return (
    <>
      <div className="h-36 bg-primary-950 max-lg:h-16" />
      <header className={`fixed top-0 z-50 w-full bg-primary-950 text-white`}>
        <nav
          className={`bg-primary-400 px-4 transition-all duration-300 max-lg:h-16 max-lg:shadow-md ${
            scrollPosition > 100 ? 'h-16' : 'h-24'
          }`}
        >
          <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between">
            <div className="relative flex h-full items-center">
              <Image
                src={'/luuppi.svg'}
                priority
                alt="Luuppi"
                className={`object-contain transition-all duration-300 max-lg:w-24 ${
                  scrollPosition > 100 ? 'w-24' : 'w-36'
                }`}
                width={140}
                height={200}
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full bg-primary-200 p-1 max-lg:hidden">
                <Image src={'/us.svg'} alt="English" width={36} height={36} />
              </button>
              <button className="flex items-center rounded-lg bg-primary-200 px-4 py-2 text-xl font-bold  max-lg:hidden">
                Login
                <RiLoginCircleLine className="ml-2 inline-block" size={26} />
              </button>
              <button className="cursor-pointer lg:hidden">
                <HiMenu size={36} />
              </button>
            </div>
          </div>
        </nav>
        <ul className="mx-auto flex max-w-screen-xl justify-center gap-1 px-4 max-lg:hidden">
          {links.map((link) => (
            <li className="group relative cursor-pointer" key={link.name}>
              <Link
                href="/"
                className="flex h-full items-center justify-center p-2 text-xl font-bold transition-colors duration-300 hover:bg-primary-200 group-hover:bg-primary-200"
              >
                <span>{link.name}</span>
                {link.sublinks.length > 0 && (
                  <div className="w-6">
                    <RiArrowDropDownLine
                      size={32}
                      className="transition-transform duration-300 group-hover:rotate-180"
                    />
                  </div>
                )}
              </Link>
              {link.sublinks.length > 0 && (
                <div className="invisible absolute z-50 flex min-w-full flex-col bg-gray-100 px-2 py-4 text-gray-800 shadow-xl group-hover:visible">
                  {link.sublinks.map((sublink) => (
                    <Link
                      key={sublink.name}
                      href="/"
                      className="truncate rounded-lg p-2 text-xl font-bold hover:bg-gray-200"
                    >
                      {sublink.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </header>
    </>
  );
}
