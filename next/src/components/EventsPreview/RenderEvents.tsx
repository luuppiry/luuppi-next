import { dateFormat, getLuuppiEvents } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';

interface RenderEventsProps {
  lang: SupportedLanguage;
}

export default async function RenderEvents({ lang }: RenderEventsProps) {
  const events = await getLuuppiEvents(lang);
  const upcomingEvents = events
    .filter((event) => event.end > new Date())
    .sort((a, b) => a.end.getTime() - b.end.getTime());

  return (
    <>
      {upcomingEvents.slice(0, 4).map((event, i) => (
        <Link
          key={i}
          className="group relative"
          href={`/${lang}/events/${event.id}`}
        >
          <div className="absolute z-20 flex h-full w-full flex-col justify-end rounded-lg bg-gradient-to-t from-primary-800 via-black/50 to-transparent p-6 transition-all duration-300">
            <p className="text-sm font-bold text-white">
              {new Date(event.start).toLocaleString(lang, dateFormat)}
            </p>
            <p className="line-clamp-3 text-lg font-bold text-accent-400 transition-all duration-300 group-hover:underline max-md:text-base">
              {event.title}
            </p>
            <div className="flex items-center">
              <p className="line-clamp-3 text-sm text-white">
                {event.description}
              </p>
            </div>
          </div>
          <div className="relative flex aspect-[5/6] h-full w-full overflow-hidden rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:aspect-[2/1]">
            <Image
              alt="Event placeholder image"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              draggable={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src="/images/event_placeholder.png"
              fill
            />
          </div>
        </Link>
      ))}
    </>
  );
}
