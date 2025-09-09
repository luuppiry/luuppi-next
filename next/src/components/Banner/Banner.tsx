import Image from 'next/image';
import bannerDesktop from '../../../public/banner.png';
import bannerMobile from '../../../public/banner_mobile.png';
import binarySvg from '../../../public/binary.svg';
import luuppiBannerTextEn from '../../../public/luuppi_banner_text_en.svg';
import luuppiBannerTextFi from '../../../public/luuppi_banner_text_fi.svg';

interface BannerProps {
  lang: string;
}

export default function Banner({ lang }: BannerProps) {
  return (
    <section>
      <div className="h-72 bg-secondary-400 transition-all duration-300 max-md:h-48">
        <div className="relative flex h-full w-full justify-center overflow-hidden">
          <div className="relative z-10 flex h-full w-full max-md:h-48">
            <Image
              alt="Luuppi banner text"
              className="z-20 object-contain p-6 drop-shadow-[-6px_6px_#00000030] filter max-lg:drop-shadow-[-4px_4px_#00000030] max-md:p-4"
              draggable={false}
              src={lang === 'en' ? luuppiBannerTextEn : luuppiBannerTextFi}
              fill
              priority
            />
            <Image
              alt="Luuppi banner text"
              className="z-10 object-cover opacity-[0.04] max-lg:scale-[2] max-md:scale-[3]"
              draggable={false}
              src={binarySvg}
              fill
            />
          </div>
          <Image
            alt="Luuppi banner"
            className="object-cover max-lg:hidden"
            draggable={false}
            quality={100}
            src={bannerDesktop}
            fill
            priority
          />
          <Image
            alt="Luuppi banner"
            className="object-cover lg:hidden"
            draggable={false}
            quality={100}
            src={bannerMobile}
            fill
            priority
          />
        </div>
      </div>
    </section>
  );
}
