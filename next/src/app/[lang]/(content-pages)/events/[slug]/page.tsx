import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import SidePartners from '@/components/SidePartners/SidePartners';
import Ticket from '@/components/Ticket/Ticket';
import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { formatDateRange } from '@/libs/utils/format-date-range';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5';
import { Event as EventSchema, WithContext } from 'schema-dts';

interface EventProps {
  params: { slug: string; lang: SupportedLanguage };
}

export default async function Event({ params }: EventProps) {
  const dictionary = await getDictionary(params.lang);

  const id = parseInt(params.slug, 10);
  if (isNaN(id)) {
    redirect(`/${params.lang}/404`);
  }

  const url = `/api/events/${params.slug}?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage&populate=Image&populate=Registration.TicketTypes.Role`;

  const event = await getStrapiData<
    APIResponse<'api::event.event'>
  >(params.lang, url, ['event']);

  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(params.lang, '/api/companies?populate=*', ['company']);

  if (!event) {
    redirect(`/${params.lang}/404`);
  }

  const jsonLd: WithContext<EventSchema> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.data.attributes[params.lang === 'en' ? 'NameEn' : 'NameFi'],
    startDate: new Date(event.data.attributes.StartDate).toISOString(),
    endDate: new Date(event.data.attributes.EndDate).toISOString(),
    description: getPlainText(event.data.attributes[params.lang === 'en' ? 'DescriptionEn' : 'DescriptionFi']).slice(0, 300),
    location: {
      '@type': 'Place',
      name: event.data.attributes[params.lang === 'en' ? 'LocationEn' : 'LocationFi'],
    },
  };

  const imageUrl = event.data.attributes.Image?.data.attributes.url ? getStrapiUrl(event.data.attributes.Image?.data.attributes.url) : undefined;
  const ticketTypes = event.data.attributes.Registration?.TicketTypes;

  const ticketTypesTranslated = ticketTypes?.map((ticketType) => ({
    name: ticketType[params.lang === 'en' ? 'NameEn' : 'NameFi'],
    location: event.data.attributes[params.lang === 'en' ? 'LocationEn' : 'LocationFi'],
    price: ticketType.Price,
    registrationStartsAt: new Date(ticketType.RegistrationStartsAt),
    registrationEndsAt: new Date(ticketType.RegistrationEndsAt)
  }))

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <div className="relative flex w-full gap-12">
        <div className="flex w-full flex-col">
          <div className="relative h-64 rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:h-44 mb-12" >
            {imageUrl && (
              <Image
                alt="Page banner image"
                className="rounded-lg object-cover"
                src={imageUrl}
                fill
              />
            )}
          </div>
          <div className="relative flex flex-col gap-4">
            <h1 className="break-words">{
              event.data.attributes[params.lang === 'en' ? 'NameEn' : 'NameFi']
            }</h1>
            <div className="flex flex-col opacity-40">
              <p className="text-sm">
                {dictionary.general.content_updated}:{' '}
                {new Date(event.data.attributes.updatedAt!).toLocaleString(
                  params.lang,
                  dateFormat,
                )}
              </p>
            </div>
            <div className="luuppi-pattern absolute -left-28 -top-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
          </div>
          <div className="mb-12 mt-4 flex gap-4 rounded-lg bg-background-50/50 backdrop-blur-sm">
            <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
            <div className="flex max-w-full flex-col gap-2 rounded-lg py-4 pr-4 font-semibold max-sm:text-sm">
              <div className="flex items-center">
                <IoCalendarOutline className="mr-2 shrink-0 text-2xl" />
                <p className="line-clamp-2">
                  {formatDateRange(
                    new Date(event.data.attributes.StartDate),
                    new Date(event.data.attributes.EndDate),
                    params.lang,
                  )}
                </p>
              </div>
              <div className="flex items-center">
                <IoLocationOutline className="mr-2 shrink-0 text-2xl" />
                <p className="line-clamp-2">{
                  event.data.attributes[params.lang === 'en' ? 'LocationEn' : 'LocationFi']
                }</p>
              </div>
            </div>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: event.description }}
            className="prose prose-custom max-w-full break-words decoration-secondary-400 transition-all duration-300 ease-in-out"
          />
          <div className="mt-8">
            <Link
              className="btn btn-primary text-white"
              href={`https://legacy.luuppi.fi/tapahtumat/${params.lang === 'fi' ? 'tapahtuma' : 'event'}?id=${event.id}&lang=${params.lang}`}
            >
              {dictionary.general.register_event}
            </Link>
            <p className="mt-4 max-w-md text-sm opacity-60">
              <i>{dictionary.pages_events.event_info}</i>
            </p>
          </div>
        </div>
        <div className="sticky top-36 h-full w-full max-w-80 max-lg:hidden">
          <div className="flex flex-col gap-4">
            <SidePartners
              dictionary={dictionary}
              partnersData={partnersData.data}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// TODO: Change when we have events on Strapi :)
export async function generateMetadata({
  params,
}: EventProps): Promise<Metadata> {
  const event = await getStrapiData<
    APIResponse<'api::event.event'>
  >(params.lang, `/api/events/${params.slug}?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage`, ['event']);

  const pathname = `/${params.lang}/events/${params.slug}`;

  const description = getPlainText(event.data.attributes[params.lang === 'en' ? 'DescriptionEn' : 'DescriptionFi']).slice(0, 300);
  const title = event.data.attributes[params.lang === 'en' ? 'NameEn' : 'NameFi'];

  return {
    title: `${event?.title} | Luuppi ry`,
    description: removeHtml(event?.description)?.slice(0, 160) + '...',
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title: event?.title,
      description: removeHtml(event?.description)?.slice(0, 160) + '...',
      url: pathname,
      siteName: 'Luuppi ry',
    },
    twitter: {
      title: event?.title,
      description: removeHtml(event?.description)?.slice(0, 160) + '...',
    },
  };
}

export async function generateStaticParams() {
  const url = '/api/events';

  const data = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >('fi', url, ['event']);

  return data.data
    .filter((e) => e.id)
    .map((event) => ({
      slug: event.id.toString(),
    }));
}
