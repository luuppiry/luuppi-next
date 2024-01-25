import { getDictionary } from '@/dictionaries';
import Link from 'next/link';
import { IoMdClose } from 'react-icons/io';
import { navLinks } from '../Header/navLinks';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

interface MobileNavbarProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>['navigation'];
  open: boolean;
  onClose: () => void;
}

export default function MobileHamburger({
  dictionary,
  open,
  onClose,
}: MobileNavbarProps) {
  return (
    <dialog
      className={`modal ${open && 'modal-open lg:hidden'}`}
      id="mobileNavbar"
    >
      <div className="modal-box h-screen max-h-full w-screen max-w-full rounded-none">
        <div className="sticky top-0 z-10 flex justify-end">
          <div className="flex h-full flex-col items-end gap-4">
            <button
              className="btn btn-circle btn-primary text-white"
              onClick={onClose}
            >
              <IoMdClose size={32} />
            </button>
            <LanguageSwitcher />
          </div>
        </div>
        <ul className="menu mr-16 mt-12 gap-4 text-lg">
          {navLinks.map((link) => (
            <li key={link.translation}>
              {link.sublinks.length > 0 ? (
                <div className="flex items-center justify-between bg-primary-400 font-bold text-white hover:cursor-auto">
                  {dictionary[link.translation]}
                </div>
              ) : (
                <Link className="font-bold" href={link.href}>
                  {dictionary[link.translation]}
                </Link>
              )}
              {link.sublinks.length > 0 && (
                <ul className="my-4">
                  {link.sublinks.map((sublink) => (
                    <li key={sublink.name}>
                      <Link className="font-bold" href={sublink.href}>
                        {dictionary[sublink.name]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
