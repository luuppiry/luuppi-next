import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useIsAuthenticated,
  useMsal,
} from '@azure/msal-react';
import Link from 'next/link';
import { BiLogOutCircle } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { RiLoginCircleLine } from 'react-icons/ri';
import { navLinks } from '../Header/navLinks';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './MobileHamburger.css';

interface MobileNavbarProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
  open: boolean;
  onClose: () => void;
}

export default function MobileHamburger({
  dictionary,
  lang,
  open,
  onClose,
}: MobileNavbarProps) {
  const { instance } = useMsal();
  const authenticated = useIsAuthenticated();

  const handleLogout = async () => {
    await instance.logout();
  };

  const handleLogin = async () => {
    await instance.loginRedirect();
  };

  return (
    <dialog
      className={`modal ${open && 'modal-open lg:hidden'}`}
      id="mobileNavbar"
    >
      <div className="modal-box flex h-full min-h-dvh w-screen max-w-full gap-4 rounded-none">
        <ul className="menu h-full w-full flex-nowrap gap-4">
          {navLinks
            .filter(
              (link) =>
                (link.authenticated && authenticated) || !link.authenticated,
            )
            .map((link, index) => (
              <li
                key={link.translation}
                className={`${index === navLinks.length - 1 ? 'pb-6' : ''}`}
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
                    onClick={onClose}
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
                          className="font-bold"
                          href={`/${lang}${sublink.href as string}`}
                          onClick={onClose}
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
        </ul>
        <div className="sticky top-0 z-10 flex justify-end">
          <div className="flex h-full flex-col items-center gap-4">
            <button
              className="btn btn-circle btn-primary text-white"
              onClick={onClose}
            >
              <IoMdClose size={32} />
            </button>
            <LanguageSwitcher />
            <AuthenticatedTemplate>
              <button
                className="btn btn-circle btn-ghost m-1 bg-error text-white"
                onClick={handleLogout}
              >
                <BiLogOutCircle size={32} />
              </button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <button
                className="btn btn-circle btn-ghost m-1 bg-primary-600 text-white max-lg:bg-secondary-400"
                onClick={handleLogin}
              >
                <RiLoginCircleLine size={32} />
              </button>
            </UnauthenticatedTemplate>
          </div>
        </div>
      </div>
    </dialog>
  );
}
