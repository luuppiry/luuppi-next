import EventSelector from '@/components/EventSelector/EventSelector';
import { getDictionary } from '@/dictionaries';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import { addEventRegisterationOpensAtInfo } from '@/libs/strapi/events';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import {
  APIResponse,
  APIResponseCollection,
  APIResponseData,
} from '@/types/types';
import { Metadata } from 'next';

interface EventsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Events(props: EventsProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const url = `/api/events?filters[StartDate][$gte]=${sixMonthsAgo.toISOString()}&populate=Registration.TicketTypes.Role`;

  const data = await getStrapiData<APIResponseCollection<'api::event.event'>>(
    params.lang,
    url,
    ['event'],
  );

  // Format event from raw event data
  const formatEvent = (event: APIResponseData<'api::event.event'>): Event => ({
    description: getPlainText(
      event.attributes[
        params.lang === 'en' ? 'DescriptionEn' : 'DescriptionFi'
      ],
    ),
    end: new Date(event.attributes.EndDate),
    start: new Date(event.attributes.StartDate),
    id: event.id.toString(),
    location:
      event.attributes[params.lang === 'en' ? 'LocationEn' : 'LocationFi'],
    title: event.attributes[params.lang === 'en' ? 'NameEn' : 'NameFi'],
    hasTickets: Boolean(event.attributes.Registration?.TicketTypes.length),
  });

  const events = data.data.reduce(
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
      <EventSelector
        dictionary={dictionary}
        events={events}
        lang={params.lang}
      />
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(props: EventsProps): Promise<Metadata> {
  const params = await props.params;
  const url =
    '/api/events-calendar?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['events-calendar'];

  const data = await getStrapiData<
    APIResponse<'api::events-calendar.events-calendar'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/events`;

  return formatMetadata(data, pathname);
}
