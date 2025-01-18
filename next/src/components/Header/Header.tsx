import { navLinksDesktop } from '@/libs/constants';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import { RiArrowDropDownLine } from 'react-icons/ri';
import luuppiSvg from '../../../public/luuppi.svg';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import HeaderActions from './HeaderActions/HeaderActions';
import HideableLink from './HideableLinks/HideableLink';
import ScrollListener from './ScrollListener/ScrollListener';

interface HeaderProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function Header({ dictionary, lang }: HeaderProps) {
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const isDevEnv = process.env.NEXT_PUBLIC_IS_DEV_ENV === 'true';

  return (
    <div>
      <ScrollListener />
      <div className="h-36 bg-primary-800 max-xl:h-28 max-lg:h-16" />
      <header className={'fixed top-0 z-50 w-full bg-primary-800 text-white'}>
        <nav
          className={
            'custom-scroll-nav h-24 bg-primary-500 px-4 transition-all duration-300 max-xl:h-16 max-xl:shadow-md'
          }
        >
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
            <Link
              className={
                'custom-scroll-nav-image btn btn-link relative h-full w-36 transition-all duration-300 max-xl:w-24'
              }
              href={`/${lang}`}
            >
              <Image
                alt="Luuppi logo"
                className={'object-contain'}
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={luuppiSvg}
                fill
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              {(isLocalEnv || isDevEnv) && (
                <div className="flex items-center gap-1.5 rounded-sm bg-violet-400/30 px-2 py-0.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
                  <span className="font-mono text-[11px] font-medium text-violet-200">
                    {isLocalEnv ? 'Localhost' : 'Development'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center max-lg:hidden">
                <LanguageSwitcher />
              </div>
              <HeaderActions dictionary={dictionary} lang={lang} />
            </div>
          </div>
        </nav>
        <ul className="mx-auto flex max-w-[1200px] justify-center gap-1 px-4 max-lg:hidden">
          {navLinksDesktop.map((link) => (
            <li
              key={link.translation}
              className="group relative cursor-pointer"
            >
              {link.sublinks && link.sublinks.length > 0 ? (
                <div
                  className={
                    'custom-scroll-text flex h-full items-center justify-center p-2 text-lg font-bold transition-all duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200 max-xl:text-base'
                  }
                >
                  <span>
                    {
                      dictionary.navigation[
                        link.translation as keyof typeof dictionary.navigation
                      ]
                    }
                  </span>
                  <div className="w-6">
                    <RiArrowDropDownLine
                      className="transition-transform duration-300 group-hover:rotate-180"
                      size={32}
                    />
                  </div>
                </div>
              ) : (
                <Link
                  className={
                    'custom-scroll-text flex h-full items-center justify-center p-2 text-lg font-bold transition-all duration-300 ease-in-out hover:bg-primary-200 group-hover:bg-primary-200 max-xl:text-base'
                  }
                  href={
                    link.href?.startsWith('/')
                      ? `/${lang}${link.href as string}`
                      : link.href!
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
