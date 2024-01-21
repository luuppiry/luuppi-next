import Image from 'next/image';
import Link from 'next/link';
import { IoLocation } from 'react-icons/io5';

export default function EventsPreview() {
  return (
    <section className=" bg-primary-50">
      <div className="mx-auto max-w-screen-xl px-4 py-20">
        <p className="mb-2 text-2xl font-bold">
          Check out what&apos;s happening
        </p>
        <h2 className="mb-8 text-5xl font-bold max-md:text-4xl">
          Upcoming events
        </h2>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Link
              href="/events"
              className=" group relative rounded-xl max-md:aspect-square"
              key={i}
            >
              <div className="absolute z-20 flex h-full w-full flex-col justify-end bg-gradient-to-t from-primary-800 via-black/50 to-transparent p-6 transition-all duration-300">
                <p className="font-bold text-white">31 Aug 2024</p>
                <p className="text-xl font-bold text-accent-400 transition-all duration-300 group-hover:underline max-md:text-xl">
                  Event name
                </p>
                <div className="flex items-center gap-1">
                  <IoLocation size={16} color="#fff" />
                  <p className="font-bold text-white">Koskikeskus</p>
                </div>
              </div>
              <div className="relative flex aspect-[5/6] h-full w-full overflow-hidden brightness-[75%] group-hover:brightness-100 max-md:aspect-square">
                <Image
                  draggable={false}
                  className="object-cover transition-all duration-300 group-hover:scale-105"
                  src={
                    i % 2 === 0 ? '/temp/events.jpg' : '/temp/pullapäivä.jpg'
                  }
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt="event"
                  fill
                />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/events"
            className="rounded-lg bg-primary-400 px-4 py-2 text-2xl font-bold text-white transition-all duration-300 max-md:text-xl"
          >
            See all events
          </Link>
        </div>
      </div>
    </section>
  );
}
