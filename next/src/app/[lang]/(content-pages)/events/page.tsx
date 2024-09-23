import EventSelector from '@/components/EventSelector/EventSelector';
import { getDictionary } from '@/dictionaries';
import { getPlainText } from '@/libs/strapi/blocks-converter';
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
  params: { lang: SupportedLanguage };
}

export default async function Events({ params }: EventsProps) {
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
  const luuppiMember = process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!;
  const luuppiNonMember = process.env.NEXT_PUBLIC_NO_ROLE_ID!;

  // Incase an event has a Registeration for luuppi-members or non-members ("default"), add a duplicate event
  // to show the opening time in the calendar
  const events = data.data.reduce((acc, event) => {
    const memberSaleStartsAt = event.attributes.Registration?.TicketTypes.find(
      (type) =>
        type.Role?.data.attributes.RoleId &&
        [luuppiMember, luuppiNonMember].includes(
          type.Role?.data.attributes.RoleId,
        ),
    );
    if (!memberSaleStartsAt) {
      return [...acc, formatEvent(event)];
    }

    // Just a hack to add a EndDate because it doesn't seem to work with same date
    // adding 1 second should probably not have any side effects :^)
    const originalDate = new Date(memberSaleStartsAt.RegistrationStartsAt);
    const EndDate = new Date(originalDate);
    EndDate.setSeconds(originalDate.getSeconds() + 1);

    return [
      ...acc,
      formatEvent(event),
      formatEvent({
        ...event,
        attributes: {
          ...event.attributes,
          StartDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
          EndDate,
          NameEn: `${event.attributes['NameEn']} ${dictionary.general.opens}`,
          NameFi: `${event.attributes['NameFi']} ${dictionary.general.opens}`,
        },
      }),
    ];
  }, [] as Event[]);

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

export async function generateMetadata({
  params,
}: EventsProps): Promise<Metadata> {
  const url =
    '/api/events-calendar?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['events-calendar'];

  const data = await getStrapiData<
    APIResponse<'api::events-calendar.events-calendar'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/events`;

  return formatMetadata(data, pathname);
}
