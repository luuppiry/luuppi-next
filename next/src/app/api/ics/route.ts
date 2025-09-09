import { getDictionary } from '@/dictionaries';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import { addEventRegisterationOpensAtInfo } from '@/libs/strapi/events';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponseCollection, APIResponseData } from '@/types/types';
import ical from 'ical-generator';
import { NextRequest } from 'next/server';

interface IcsEvent {
  name: string;
  id: number;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const lang = searchParams.get('lang') as string | undefined;
  const allowedLangs = ['en', 'fi'];

  if (!lang || !allowedLangs.includes(lang)) {
    return new Response('Invalid lang parameter', { status: 400 });
  }
  const dictionary = await getDictionary(lang);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const strapiUrl = `/api/events?filters[StartDate][$gte]=${threeMonthsAgo.toISOString()}&populate=Registration.TicketTypes.Role`;

  const eventData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >(lang, strapiUrl, ['event'], true);

  if (!eventData) {
    return new Response('Error fetching event data', { status: 500 });
  }

  // Format event from raw event data
  const formatEvent = (event: APIResponseData<'api::event.event'>) => ({
    name: event[lang === 'fi' ? 'NameFi' : 'NameEn'],
    id: event.id,
    startDate: new Date(event.StartDate),
    endDate: new Date(event.EndDate),
    location: event[lang === 'fi' ? 'LocationFi' : 'LocationEn'],
    description: getPlainText(
      event[lang === 'fi' ? 'DescriptionFi' : 'DescriptionEn'],
    ),
  });

  const eventLanguageFormatted = eventData.data.reduce(
    (acc, event) =>
      addEventRegisterationOpensAtInfo<IcsEvent>(
        acc,
        event,
        formatEvent,
        dictionary,
      ),
    [] as IcsEvent[],
  );

  const ics = ical({
    name: 'Luuppi Events',
    timezone: 'Europe/Helsinki',
  });

  eventLanguageFormatted.forEach((event) => {
    ics.createEvent({
      start: event.startDate,
      end: event.endDate,
      summary: event.name,
      location: event.location,
      description: event.description,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/events/${event.id}`,
    });
  });

  return new Response(ics.toString(), {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename=events-${lang}.ics`,
    },
  });
}
