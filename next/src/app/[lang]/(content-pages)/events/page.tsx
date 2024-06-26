import EventSelector from '@/components/EventSelector/EventSelector';
import { getDictionary } from '@/dictionaries';
import { getLuuppiEvents } from '@/libs/events/get-legacy-events';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';

interface EventsProps {
  params: { lang: SupportedLanguage };
}

export default async function Events({ params }: EventsProps) {
  const dictionary = await getDictionary(params.lang);
  const events = await getLuuppiEvents(params.lang);
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
