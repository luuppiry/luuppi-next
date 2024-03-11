import { dateFormat } from '@/libs/constants';
import { getLuuppiEvents } from '@/libs/events/get-legacy-events';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import DayBadge from '../DayBadge/DayBadge';

interface RenderEventsProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default async function RenderEvents({
  lang,
  dictionary,
}: RenderEventsProps) {
  const events = await getLuuppiEvents(lang);
  const upcomingEvents = events
    .filter((event) => event.end > new Date())
    .sort((a, b) => a.end.getTime() - b.end.getTime())
    .map((e) => ({
      ...e,
      isToday: new Date(e.start).toDateString() === new Date().toDateString(),
    }));

  return (
    <>
      {upcomingEvents.slice(0, 4).map((event, i) => (
        <Link
          key={i}
          className="group relative flex flex-col rounded-lg bg-primary-800 text-white"
          href={`/${lang}/events/${event.id}`}
        >
          <DayBadge dictionary={dictionary} event={event} />
          <div className="relative aspect-[7/5] overflow-hidden rounded-t-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:aspect-video max-sm:aspect-[7/3]">
            <Image
              alt="Event placeholder image"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              draggable={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src="/images/event_placeholder.png"
              fill
            />
          </div>
          <div className="relative flex flex-grow flex-col overflow-hidden p-6 transition-all duration-300">
            <p className="z-20 text-sm font-bold">
              {new Date(event.start).toLocaleString(lang, dateFormat)}
            </p>
            <p className="z-20 line-clamp-3 text-lg font-bold text-accent-400 transition-all duration-300 group-hover:underline max-md:text-base">
              {event.title}
            </p>
            <div className="z-20 flex items-center">
              <p className="line-clamp-3 text-sm">{event.description}</p>
            </div>
            <div className="luuppi-events-preview-pattern absolute left-0 top-0 z-10 h-full w-full opacity-100" />
          </div>
        </Link>
      ))}
    </>
  );
}
