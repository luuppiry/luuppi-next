import EventSelector from '@/components/EventSelector/EventSelector';
import { getDictionary } from '@/dictionaries';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import {
  addEventRegisterationOpensAtInfo,
  filterVisibleEvents,
} from '@/libs/strapi/events';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { Event } from '@/models/event';
import {
  APIResponse,
  APIResponseCollection,
  APIResponseData,
} from '@/types/types';
import { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { lang as language } from 'next/root-params';

async function getSixMonthsAgoISO() {
  'use cache';
  cacheLife('days');
  cacheTag('event');

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  return sixMonthsAgo.toISOString().split('T')[0];
}

export default async function Events() {
  'use cache';
  cacheLife('max');
  cacheTag('event');

  const lang = await language();
  const dictionary = await getDictionary();

  const sixMonthsAgo = await getSixMonthsAgoISO();

  const url = `/api/events?filters[StartDate][$gte]=${sixMonthsAgo}&populate=Registration.TicketTypes.Role&populate=VisibleOnlyForRoles`;

  const data = await getStrapiData<APIResponseCollection<'api::event.event'>>(
    lang,
    url,
    ['event'],
  );

  // Filter events based on visibility rules
  const visibleEvents = await filterVisibleEvents(data.data);

  // Format event from raw event data
  const formatEvent = (
    event: Omit<APIResponseData<'api::event.event'>, 'id'>,
  ): Event => ({
    description: getPlainText(
      event[lang === 'en' ? 'DescriptionEn' : 'DescriptionFi'],
    ),
    slug: event.Slug,
    end: new Date(event.EndDate),
    start: new Date(event.StartDate),
    id: event.documentId,
    location: event[lang === 'en' ? 'LocationEn' : 'LocationFi'],
    title: event[lang === 'en' ? 'NameEn' : 'NameFi'],
    hasTickets: Boolean(event.Registration?.TicketTypes.length),
  });

  const events = visibleEvents.reduce(
    (acc, event) =>
      addEventRegisterationOpensAtInfo<Event>(
        acc,
        event,
        formatEvent,
        dictionary,
      ),
    [] as Event[],
  );

  return (
    <div className="relative">
      <h1 className="mb-12">{dictionary.navigation.events}</h1>
      <EventSelector dictionary={dictionary} events={events} lang={lang} />
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const url =
    '/api/events-calendar?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['events-calendar'] as const;

  const data = await getStrapiData<
    APIResponse<'api::events-calendar.events-calendar'>
  >(lang, url, tags);

  const pathname = `/${lang}/events`;

  return formatMetadata(data, pathname);
}
