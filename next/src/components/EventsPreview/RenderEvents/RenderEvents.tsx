import { dateFormat } from '@/libs/constants';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import { filterVisibleEvents } from '@/libs/strapi/events';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponseCollection, StrapiCacheTag } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import eventPlaceholder from '../../../../public/images/event_placeholder.png';
import DayBadge from '../DayBadge/DayBadge';

import qs from 'qs';
import { cacheLife, cacheTag } from 'next/cache';

interface RenderEventsProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

async function getCachedCalendarDate() {
  'use cache';
  cacheLife('hours');
  cacheTag('event' satisfies StrapiCacheTag);

  return new Date().toISOString().split('T')[0];
}

export default async function RenderEvents({
  lang,
  dictionary,
}: RenderEventsProps) {
  const query = qs.stringify({
    pagination: { limit: 9999 },
    sort: ['StartDate'],
    filters: { EndDate: { $gte: getCachedCalendarDate() } },
    fields: [
      'NameEn',
      'NameFi',
      'LocationEn',
      'LocationFi',
      'StartDate',
      'EndDate',
      'DescriptionEn',
      'DescriptionFi',
      'Slug',
    ],
    populate: {
      Image: { fields: ['url'] },
      ImageEn: { fields: ['url'] },
      Registration: { populate: { TicketTypes: { populate: ['Role'] } } },
      VisibleOnlyForRoles: true,
    },
  });

  const url = `/api/events?${query}`;

  const eventsData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >('fi', url, ['event']);

  // Filter events based on visibility rules
  const visibleEventsData = await filterVisibleEvents(eventsData.data);

  const formattedEvents = visibleEventsData.map((e) => {
    const isEnglish = lang === 'en';
    const description = getPlainText(
      isEnglish ? e.DescriptionEn : e.DescriptionFi,
    );
    const location = isEnglish ? e.LocationEn : e.LocationFi;
    const title = isEnglish ? e.NameEn : e.NameFi;

    const image =
      isEnglish && e.ImageEn?.url
        ? getStrapiUrl(e.ImageEn.url)
        : e.Image?.url
          ? getStrapiUrl(e.Image.url)
          : eventPlaceholder;

    return {
      id: e.documentId,
      slug: e.Slug,
      description,
      location,
      title,
      image,
      start: new Date(e.StartDate),
      end: new Date(e.EndDate),
      hasTickets: Boolean(e.Registration?.TicketTypes.length),
    };
  });

  return (
    <>
      {formattedEvents.slice(0, 4).map((event, i) => (
        <Link
          key={i}
          className="group relative flex flex-col rounded-lg bg-primary-800 text-white dark:bg-primary-200"
          href={`/${lang}/events/${event.slug}`}
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
            <p className="z-20 line-clamp-3 text-lg font-bold text-accent-400 transition-all duration-300 group-hover:underline max-md:text-base dark:text-accent-600">
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
