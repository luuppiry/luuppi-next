import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-500">
      <div className="mx-auto flex max-w-screen-xl flex-col">
        <div className="grid w-full grid-cols-4 gap-12 px-4 py-12 max-lg:grid-cols-2 max-md:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="flex flex-col gap-4" key={i}>
              <h6 className="text-xl font-bold uppercase text-white">
                Organisaatio
              </h6>
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Link
                      href="/"
                      className="text-lg text-white hover:underline"
                    >
                      Link 1
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <span className="h-0.5 w-full bg-white max-lg:hidden"></span>
        <div className="flex h-28 items-center justify-between gap-4 p-4 max-md:h-36 max-md:flex-col max-md:items-start">
          <div className="relative h-full w-32">
            <Image
              src={'/luuppi.svg'}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              draggable={false}
              alt="Luuppi"
              className={`object-contain`}
              fill
            />
          </div>
          <p className="text-white">
            {new Date().getFullYear()} © Luuppi ry. All rights reserved.{' '}
          </p>
        </div>
      </div>
    </footer>
  );
}
