import { getPlainText } from '@/libs/strapi/blocks-converter';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import ical from 'ical-generator';
import url from 'url';

export async function GET(request: Request) {
  const queryParams = url.parse(request.url, true).query;

  const lang = queryParams.lang as SupportedLanguage | undefined;

  const allowedLangs = ['en', 'fi'];

  if (!lang || !allowedLangs.includes(lang)) {
    return new Response('Invalid lang parameter', { status: 400 });
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const strapiUrl = `/api/events?filters[StartDate][$gte]=${threeMonthsAgo.toISOString()}`;

  const eventData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >(lang, strapiUrl, ['event'], true);

  if (!eventData) {
    return new Response('Error fetching event data', { status: 500 });
  }

  const eventLanguageFormatted = eventData.data.map((event) => ({
    name: event.attributes[lang === 'fi' ? 'NameFi' : 'NameEn'],
    id: event.id,
    startDate: new Date(event.attributes.StartDate),
    endDate: new Date(event.attributes.EndDate),
    location: event.attributes[lang === 'fi' ? 'LocationFi' : 'LocationEn'],
    description: getPlainText(
      event.attributes[lang === 'fi' ? 'DescriptionFi' : 'DescriptionEn'],
    ),
  }));

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
