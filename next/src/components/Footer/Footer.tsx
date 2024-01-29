import Image from 'next/image';
import Link from 'next/link';
import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaTelegram,
} from 'react-icons/fa';
import { SiLinktree } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="bg-primary-500 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <div className="grid w-full grid-cols-5 gap-12 px-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          <div className="flex flex-col gap-6 max-lg:col-span-2 max-lg:flex-row max-md:col-span-1">
            <Image
              alt="Luuppi"
              className={'object-contain'}
              draggable={false}
              height={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={'/luuppi.svg'}
              width={125}
            />
            <p className="max-w-md text-sm text-white">
              Luuppi ry on Tampereen yliopiston tietojenkäsittelytieteen
              opiskelijoiden ainejärjestö. Luuppi ry on perustettu vuonna 1991.
            </p>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <h6 className="text-sm font-semibold uppercase text-white">
                Organisaatio
              </h6>
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Link
                      className="text-sm text-white hover:underline"
                      href="/"
                    >
                      Link 1
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <span className="h-0.5 w-full bg-white max-md:hidden" />
        <div className="flex items-center justify-between gap-6 p-4 max-md:flex-col max-md:items-start">
          <div className="flex items-center gap-6">
            <p className="text-sm text-white">
              {new Date().getFullYear()} © Luuppi ry
            </p>
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Link
                  key={i}
                  className="text-sm text-white hover:underline"
                  href="/"
                >
                  Privacy
                </Link>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <FaTelegram className="text-white" size={20} />
            <FaGithub className="text-white" size={20} />
            <FaFacebook className="text-white" size={20} />
            <FaInstagram className="text-white" size={20} />
            <FaDiscord className="text-white" size={20} />
            <SiLinktree className="text-white" size={20} />
          </div>
        </div>
      </div>
    </footer>
  );
}
