import { SupportedLanguage } from '@/models/locale';
import Image from 'next/image';

interface BannerProps {
  lang: SupportedLanguage;
}

export default function Banner({ lang }: BannerProps) {
  return (
    <section>
      <div className="h-72 bg-primary-400 transition-all duration-300 max-md:h-48">
        <div className="relative flex h-full w-full justify-center overflow-hidden">
          <div className="relative z-10 flex h-full w-full max-md:h-48">
            <Image
              alt="Luuppi banner"
              className="z-10 object-contain p-6 drop-shadow-[-6px_6px_#00000030] filter max-md:p-4"
              draggable={false}
              src={
                lang === 'en'
                  ? '/luuppi_banner_text_en.svg'
                  : '/luuppi_banner_text_fi.svg'
              }
              fill
            />
          </div>
          <Image
            alt="Luuppi banner"
            className="object-cover"
            draggable={false}
            quality={100}
            src="/banner.png"
            fill
            priority
          />
        </div>
      </div>
    </section>
  );
}
