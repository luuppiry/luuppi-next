import EventPage from '@/components/EventPage/EventPage';
import { getDictionary } from '@/dictionaries';
import { EVENT_POPULATE, buildEventMetadata } from '@/libs/events';
import { isEventVisible } from '@/libs/strapi/events';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { lang as language } from 'next/root-params';
import { connection } from 'next/server';

export const instant = false;

interface EventProps {
  params: Promise<{ slug: string }>;
}

export default async function PrivateEvent(props: EventProps) {
  await connection();
  const lang = await language();
  const { slug } = await props.params;
  const dictionary = await getDictionary();

  const events = await getStrapiData<APIResponseCollection<'api::event.event'>>(
    lang,
    `/api/events?filters[Slug][$eq]=${slug}&${EVENT_POPULATE}&filters[ShowInCalendar][$eq]=false`,
    [`event-${slug}`],
    true,
  );
  const event = events?.data.at(0);
  if (!event) redirect(`/${lang}/404`);
  if (!(await isEventVisible(event))) redirect(`/${lang}/404`);

  const partners = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(lang, '/api/companies?populate=*', ['company']);
  if (!partners) redirect(`/${lang}/404`);

  return (
    <EventPage
      dictionary={dictionary}
      endDate={new Date(event.EndDate)}
      event={event}
      lang={lang}
      partners={partners.data}
      slug={slug}
      startDate={new Date(event.StartDate)}
      updatedAt={new Date(event.updatedAt!)}
    />
  );
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
  return event
    ? buildEventMetadata(event, lang, 'private-events', slug, { noIndex: true })
    : {};
}
