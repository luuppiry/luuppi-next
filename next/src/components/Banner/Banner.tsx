import Image from 'next/image';

export default function Banner() {
  return (
    <section>
      <div className="h-80 bg-primary-400 transition-all duration-300 max-md:h-56">
        <div className="relative flex h-full w-full justify-center overflow-hidden">
          <div className="relative z-10 flex h-full w-full max-md:h-56">
            <Image
              alt="Luuppi banner"
              className="z-10 object-contain p-8 drop-shadow-[-6px_6px_#00000030] filter max-md:p-4 max-sm:p-2"
              draggable={false}
              src={'/luuppi_banner_text.svg'}
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
