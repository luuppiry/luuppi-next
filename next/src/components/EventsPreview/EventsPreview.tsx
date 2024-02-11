import { getDictionary } from '@/dictionaries';
import { dateFormat, getLuuppiEvents } from '@/lib';
import { SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';

interface EventsPreviewProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default async function EventsPreview({
  dictionary,
  lang,
}: EventsPreviewProps) {
  const events = await getLuuppiEvents(lang);
  const upcomingEvents = events
    .filter((event) => event.end > new Date())
    .sort((a, b) => a.end.getTime() - b.end.getTime());

  return (
    <section className=" relative bg-primary-50">
      <div className="relative z-[10] mx-auto max-w-[1200px] px-4 py-20">
        <p className="mb-1 text-xl font-bold">
          {dictionary.pages_home.events_preview.subtitle}
        </p>
        <h2 className="mb-8 text-4xl font-extrabold max-md:text-3xl">
          {dictionary.pages_home.events_preview.title}
        </h2>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
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
                  alt="event"
                  className="object-cover transition-all duration-300 group-hover:scale-105"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src="/images/event_placeholder.png"
                  fill
                />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            className="btn btn-primary z-10 px-4 py-2 text-lg text-white max-md:text-base"
            href="/events"
          >
            {dictionary.pages_home.events_preview.see_all}
          </Link>
        </div>
      </div>
      <div className="luuppi-kolmio-pattern absolute left-0 top-0 -z-0 h-full w-full" />
    </section>
  );
}
