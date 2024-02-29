import { getDictionary } from '@/dictionaries';
import { footerLinks } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaTelegram,
  FaTiktok,
} from 'react-icons/fa';

interface FooterProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function Footer({ dictionary, lang }: FooterProps) {
  return (
    <footer className="bg-primary-500 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <div className="grid w-full grid-cols-5 gap-12 px-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {footerLinks.map((footerLink, i) => (
            <div key={i} className="flex flex-col gap-4">
              <p className="text-sm font-semibold uppercase text-white">
                {
                  dictionary.navigation[
                    footerLink.translation as keyof typeof dictionary.navigation
                  ]
                }
              </p>
              <div className="flex flex-col gap-2">
                {footerLink.sublinks?.map((link, i) => (
                  <div key={i}>
                    <Link
                      className="text-sm text-white hover:underline"
                      href={`/${lang}${link.href}`}
                    >
                      {
                        dictionary.navigation[
                          link.translation as keyof typeof dictionary.navigation
                        ]
                      }
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <span className="h-0.5 w-full bg-white opacity-10 max-md:hidden" />
        <div className="flex items-center justify-between gap-6 p-4 max-md:flex-col max-md:items-start">
          <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex items-center gap-4">
              <Image
                alt="Luuppi logo"
                className={'object-contain'}
                draggable={false}
                height={80}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={'/luuppi.svg'}
                width={95}
              />
              <div className="flex flex-col text-sm text-white">
                <p>{new Date().getFullYear()} © Luuppi ry</p>
                <p className="text-xs">
                  {dictionary.general.business_id}: 0512347-2
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link aria-label="Telegram" href="https://t.me/Luuppi">
              <FaTelegram className="text-white" size={20} />
            </Link>
            <Link aria-label="GitHub" href="https://github.com/luuppiry">
              <FaGithub className="text-white" size={20} />
            </Link>
            <Link
              aria-label="Facebook"
              href="https://www.facebook.com/luuppiry"
            >
              <FaFacebook className="text-white" size={20} />
            </Link>
            <Link aria-label="TikTok" href="https://www.tiktok.com/@luuppiry">
              <FaTiktok className="text-white" size={20} />
            </Link>
            <Link
              aria-label="Instagram"
              href="https://www.instagram.com/luuppiry/"
            >
              <FaInstagram className="text-white" size={20} />
            </Link>
            <Link aria-label="Discord" href="https://discord.gg/ZcREUWmYZs">
              <FaDiscord className="text-white" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
