import { discoverLinks } from '@/libs/constants';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import ccchaosSvg from '../../../public/ccchaos.svg';

interface DiscoverProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function Discover({ dictionary, lang }: DiscoverProps) {
  return (
    <section className="relative mx-auto max-w-[1200px] px-4 py-20 max-2xl:overflow-hidden">
      <Image
        alt="Luuppi background pattern"
        className="absolute -left-32 top-0 -z-10 max-md:hidden"
        height={400}
        src={ccchaosSvg}
        width={400}
      />
      <h2 className="mb-8 text-4xl font-extrabold max-md:text-3xl">
        {dictionary.pages_home.discover.title}
      </h2>
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2">
        {discoverLinks.map((link) => (
          <Link
            key={dictionary.pages_home.discover[link.translation]}
            className="group relative flex aspect-[3/2] h-full w-full border-4 border-primary-950 shadow-[7px_7px_#090a10] transition-all duration-300 hover:shadow-[0px_0px_#090a10] max-md:aspect-square dark:border-base-300"
            href={`/${lang}/${link.href}`}
          >
            <div className="absolute z-20 h-full w-0 bg-secondary-400/50 transition-all duration-300 group-hover:w-full" />
            <div className="absolute bottom-5 left-5 z-30 flex items-center justify-center bg-background-50 text-lg transition-all duration-300 max-md:bottom-0 max-md:left-0 max-md:w-full max-md:text-sm dark:bg-background-50">
              <h2 className="flex items-center px-4 py-2 font-bold">
                {dictionary.pages_home.discover[link.translation]}
                <span>
                  <MdOutlineKeyboardArrowRight size={25} />
                </span>
              </h2>
            </div>
            <div className="relative flex h-full w-full overflow-hidden bg-gradient-to-r from-secondary-400 to-primary-300">
              <div className="absolute z-10 flex h-full w-full bg-gradient-to-t from-background-400/70 via-transparent to-transparent" />
              <Image
                alt="Discover link image"
                className="object-cover brightness-90 transition-all duration-300 group-hover:scale-105"
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={link.image}
                fill
              />
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 -z-10 h-full w-full rotate-6 scale-50 rounded-lg bg-blue-200 blur-[550px] dark:bg-base-100" />
      <div className="luuppi-pattern max-md:.test absolute -right-40 -top-10 -z-50 h-[801px] w-[901px] max-md:right-0 max-md:top-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </section>
  );
}
