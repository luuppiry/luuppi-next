import Image from 'next/image';

export default function Hero() {
  return (
    <section>
      <div className="relative  h-96 bg-blue-200 transition-all duration-300 max-lg:h-80 max-md:h-56 max-sm:h-44">
        <div className="relative flex h-full w-full overflow-hidden">
          <Image
            src="/banner.png"
            layout="fill"
            objectFit="cover"
            alt="Luuppi banner"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
