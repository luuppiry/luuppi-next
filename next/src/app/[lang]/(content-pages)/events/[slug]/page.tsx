import EventPage from '@/components/EventPage/EventPage';
import { getDictionary } from '@/dictionaries';
import { EVENT_POPULATE, buildEventMetadata } from '@/libs/events';
import { isEventVisible } from '@/libs/strapi/events';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { lang as language } from 'next/root-params';
import qs from 'qs';

interface EventProps {
  params: Promise<{ slug: string }>;
}

const getCachedDate = async (date: string) => {
  'use cache';
  return new Date(date);
};

export default async function Event(props: EventProps) {
  const lang = await language();
  const { slug } = await props.params;
  const dictionary = await getDictionary();
  const { isEnabled: isDraftMode } = await draftMode();

  const events = await getStrapiData<APIResponseCollection<'api::event.event'>>(
    lang,
    `/api/events?filters[Slug][$eq]=${slug}&${EVENT_POPULATE}`,
    [`event-${slug}`],
    true,
    isDraftMode,
  );

  const event = events?.data.at(0);

  if (!event) {
    redirect(`/${lang}/404`);
  }

  // Check if the event is visible to the current user
  const eventVisible =
    isDraftMode ||
    (await isEventVisible(event, [
      process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
      process.env.NEXT_PUBLIC_NO_ROLE_ID!,
    ]));

  if (!eventVisible) {
    redirect(`/${lang}/404`);
  }

  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(lang, '/api/companies?populate=*', ['company']);

  if (!partnersData) {
    redirect(`/${lang}/404`);
  }

  return (
    <EventPage
      dictionary={dictionary}
      endDate={await getCachedDate(event.EndDate as string)}
      event={event}
      lang={lang}
      partners={partnersData.data}
      slug={slug}
      startDate={await getCachedDate(event.StartDate as string)}
      updatedAt={await getCachedDate(event.updatedAt as string)}
    />
  );
}

export async function generateStaticParams() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const twoMonthsInFuture = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  const query = qs.stringify({
    sort: 'updatedAt:desc',
    fields: 'Slug',
    filters: {
      StartDate: { $gte: thisMonth.toISOString().split('T')[0] },
      EndDate: { $lte: twoMonthsInFuture.toISOString().split('T')[0] },
    },
  });

  const url = `/api/events?${query}`;

  const data = await getStrapiData<APIResponseCollection<'api::event.event'>>(
    'fi',
    url,
    ['event'],
  );

  const events = data.data.map((event) => event.Slug);

  return events.map((slug) => ({ slug }));
}

export async function generateMetadata(props: EventProps): Promise<Metadata> {
  const lang = await language();
  const { slug } = await props.params;
  const events = await getStrapiData<APIResponseCollection<'api::event.event'>>(
    lang,
    `/api/events?filters[Slug][$eq]=${slug}&populate=Image&populate=ImageEn`,
    [`event-${slug}`],
    true,
  );
  const event = events?.data.at(0);
  return event ? buildEventMetadata(event, lang, 'events', slug) : {};
}
