import Image from 'next/image';

export default function Banner() {
  return (
    <section>
      <div className="relative  h-80 bg-blue-200 transition-all duration-300 max-md:h-56">
        <div className="relative flex h-full w-full justify-center overflow-hidden">
          <div className="z-10 flex h-full max-md:h-56">
            <Image
              src={'/luuppi_banner_text.svg'}
              draggable={false}
              alt="Luuppi banner"
              fill
              className="z-10 object-contain p-8 drop-shadow-[-6px_6px_#00000030] filter max-md:p-4 max-sm:p-2"
            />
          </div>
          <Image
            src="/banner.png"
            fill
            alt="Luuppi banner"
            priority
            draggable={false}
            quality={100}
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
