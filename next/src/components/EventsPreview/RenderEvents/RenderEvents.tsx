import { dateFormat } from '@/libs/constants';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import { filterVisibleEvents } from '@/libs/strapi/events';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import eventPlaceholder from '../../../../public/images/event_placeholder.png';
import DayBadge from '../DayBadge/DayBadge';

interface RenderEventsProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default async function RenderEvents({
  lang,
  dictionary,
}: RenderEventsProps) {
  const url = `/api/events?pagination[limit]=9999&sort[0]=StartDate&filters[EndDate][$gte]=${new Date().toISOString()}&populate=Image&populate=Registration.TicketTypes.Role&populate=VisibleOnlyForRoles`;

  const eventsData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >('fi', url, ['event']);

  // Filter events based on visibility rules
  const visibleEventsData = await filterVisibleEvents(eventsData.data);

  const upcomingEvents = visibleEventsData.map((e) => ({
    ...e,
    isToday:
      new Date(e.attributes.StartDate).toDateString() ===
      new Date().toDateString(),
  }));

  const formattedEvents = upcomingEvents.map(({ id, attributes }) => {
    const isEnglish = lang === 'en';
    const description = getPlainText(
      isEnglish ? attributes.DescriptionEn : attributes.DescriptionFi,
    );
    const location = isEnglish ? attributes.LocationEn : attributes.LocationFi;
    const title = isEnglish ? attributes.NameEn : attributes.NameFi;

    const image =
      isEnglish && attributes.ImageEn?.data?.attributes?.url
        ? getStrapiUrl(attributes.ImageEn.data.attributes.url)
        : attributes.Image?.data?.attributes?.url
          ? getStrapiUrl(attributes.Image.data.attributes.url)
          : eventPlaceholder;

    return {
      id: id.toString(),
      description,
      location,
      title,
      image,
      start: new Date(attributes.StartDate),
      end: new Date(attributes.EndDate),
      hasTickets: Boolean(attributes.Registration?.TicketTypes.length),
    };
  });

  return (
    <>
      {formattedEvents.slice(0, 4).map((event, i) => (
        <Link
          key={i}
          className="group relative flex flex-col rounded-lg bg-primary-800 dark:bg-primary-200 text-white"
          href={`/${lang}/events/${event.id}`}
        >
          <DayBadge dictionary={dictionary} event={event} />
          <div className="relative aspect-[7/5] overflow-hidden rounded-t-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:aspect-video max-sm:aspect-[7/3]">
            <Image
              alt="Event placeholder image"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              draggable={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={event.image}
              fill
            />
          </div>
          <div className="relative flex flex-grow flex-col overflow-hidden p-6 transition-all duration-300">
            <p className="z-20 text-sm font-bold">
              {new Date(event.start).toLocaleString(lang, dateFormat)}
            </p>
            <p className="z-20 line-clamp-3 text-lg font-bold text-accent-400 dark:text-accent-600 transition-all duration-300 group-hover:underline max-md:text-base">
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
