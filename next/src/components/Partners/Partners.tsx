import { getDictionary } from '@/dictionaries';
import Image from 'next/image';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import { partnerLinks } from './parner-links';

export default function Partners({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}) {
  return (
    <section className=" bg-primary-50 px-4 py-20">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col gap-6">
          <h2 className="text-5xl font-extrabold max-md:text-4xl">
            {dictionary.pages_home.partners.title}
          </h2>
          <p className="max-w-2xl text-xl transition-all duration-300 max-md:text-lg">
            {dictionary.pages_home.partners.description}
          </p>
          <div className="flex">
            <Link
              className="btn btn-primary text-xl font-bold text-white"
              href="/contact"
            >
              {dictionary.pages_home.partners.read_more}
            </Link>
          </div>
        </div>
        <Marquee className="mt-4 max-md:mt-8" autoFill>
          {partnerLinks.map((partner) => (
            <Link
              key={partner.image}
              className="btn btn-link relative mx-6 flex h-32 w-48 grayscale filter transition-all duration-300 hover:grayscale-0 max-md:h-20"
              href={partner.link}
            >
              <Image
                alt="partner"
                className="object-contain opacity-75"
                draggable={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={partner.image}
                fill
                priority
              />
            </Link>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
