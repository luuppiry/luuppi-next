import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import ShowParticipants from '@/components/ShowParticipants/ShowParticipants';
import SidePartners from '@/components/SidePartners/SidePartners';
import TicketArea from '@/components/Ticket/TicketArea';
import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { getPlainText } from '@/libs/strapi/blocks-converter';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { formatDateRangeLong } from '@/libs/utils/format-date-range';
import { getEventJsonLd } from '@/libs/utils/json-ld';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5';
import { PiImageBroken } from 'react-icons/pi';

interface EventProps {
  params: Promise<{ slug: string; lang: SupportedLanguage }>;
}

export default async function Event(props: EventProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const id = parseInt(params.slug, 10);
  if (isNaN(id)) {
    redirect(`/${params.lang}/404`);
  }

  const url = `/api/events/${params.slug}?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage&populate=Image&populate=Registration.TicketTypes.Role`;

  const event = await getStrapiData<APIResponse<'api::event.event'>>(
    params.lang,
    url,
    [`event-${params.slug}`],
    true,
  );

  if (!event) {
    redirect(`/${params.lang}/404`);
  }

  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(params.lang, '/api/companies?populate=*', ['company']);

  if (!event || !partnersData) {
    redirect(`/${params.lang}/404`);
  }

  const imageUrlLocalized =
    params.lang === 'en' && event.data.attributes.ImageEn?.data?.attributes?.url
      ? event.data.attributes.ImageEn?.data?.attributes?.url
      : event.data.attributes.Image?.data?.attributes?.url;

  const imageUrl = imageUrlLocalized ? getStrapiUrl(imageUrlLocalized) : null;

  const hasRegistration =
    event.data.attributes?.Registration?.TicketTypes?.length;

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getEventJsonLd(event, params.lang)),
        }}
        id="event-jsonld"
        type="application/ld+json"
      />
      <div className="relative flex w-full gap-12">
        <div className="flex w-full flex-col">
          <div className="relative mb-12 h-64 rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:h-44">
            {imageUrl ? (
              <Image
                alt="Page banner image"
                className="rounded-lg object-cover"
                src={imageUrl}
                fill
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <PiImageBroken className="text-8xl text-white" />
              </div>
            )}
          </div>
          <div className="relative flex flex-col gap-4">
            <h1 className="break-words">
              {
                event.data.attributes[
                  params.lang === 'en' ? 'NameEn' : 'NameFi'
                ]
              }
            </h1>
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
          <div className="mb-12 mt-4 flex gap-4 rounded-lg bg-background-50">
            <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
            <div className="flex max-w-full flex-col gap-2 rounded-lg py-4 pr-4 font-semibold max-sm:text-sm">
              <div className="flex items-center">
                <div className="mr-2 flex items-center justify-center rounded-full bg-primary-400 p-2 text-white">
                  <IoCalendarOutline className="shrink-0 text-2xl" />
                </div>
                <p className="line-clamp-2">
                  {formatDateRangeLong(
                    new Date(event.data.attributes.StartDate),
                    new Date(event.data.attributes.EndDate),
                    params.lang,
                  )}
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-2 flex items-center justify-center rounded-full bg-primary-400 p-2 text-white">
                  <IoLocationOutline className="shrink-0 text-2xl" />
                </div>
                <p className="line-clamp-2">
                  {
                    event.data.attributes[
                      params.lang === 'en' ? 'LocationEn' : 'LocationFi'
                    ]
                  }
                </p>
              </div>
            </div>
          </div>
          {hasRegistration && (
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-bold">
                {dictionary.pages_events.tickets}
              </h2>
              <Suspense
                fallback={
                  <div className="flex flex-col gap-4">
                    <div className="skeleton h-24 w-full" />
                    <div className="skeleton h-24 w-full" />
                  </div>
                }
              >
                <TicketArea event={event} lang={params.lang} />
              </Suspense>
              <Suspense
                fallback={
                  <div className="mt-6">
                    <div className="skeleton h-8 w-48" />
                  </div>
                }
              >
                <ShowParticipants eventId={id} lang={params.lang} />
              </Suspense>
            </div>
          )}
          <div className="organization-page prose prose-custom max-w-full break-words decoration-secondary-400 transition-all duration-300 ease-in-out">
            <BlockRendererClient
              content={
                event.data.attributes[
                  params.lang === 'en' ? 'DescriptionEn' : 'DescriptionFi'
                ]
              }
            />
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

export async function generateMetadata(props: EventProps): Promise<Metadata> {
  const params = await props.params;
  const event = await getStrapiData<APIResponse<'api::event.event'>>(
    params.lang,
    `/api/events/${params.slug}?populate=Image`,
    [`event-${params.slug}`],
    true,
  );

  if (!event) return {};

  const pathname = `/${params.lang}/events/${params.slug}`;

  const description = getPlainText(
    event.data.attributes[
      params.lang === 'en' ? 'DescriptionEn' : 'DescriptionFi'
    ],
  );

  const title =
    event.data.attributes[params.lang === 'en' ? 'NameEn' : 'NameFi'];

  const imageUrlLocalized =
    params.lang === 'en' && event.data.attributes.ImageEn?.data?.attributes?.url
      ? event.data.attributes.ImageEn?.data?.attributes?.url
      : event.data.attributes.Image?.data?.attributes?.url;

  const imageUrl = imageUrlLocalized
    ? getStrapiUrl(imageUrlLocalized)
    : undefined;

  const descriptionCutted = description.length > 300;

  return {
    title: `${title} | Luuppi ry`,
    description: description.slice(0, 300) + (descriptionCutted ? '...' : ''),
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title,
      description: description.slice(0, 300) + (descriptionCutted ? '...' : ''),
      url: pathname,
      siteName: 'Luuppi ry',
      images: imageUrl,
    },
    twitter: {
      title,
      description: description.slice(0, 300) + (descriptionCutted ? '...' : ''),
      card: 'summary_large_image',
      images: imageUrl,
    },
  };
}

// TODO: Remove when partial pre-rendering is available in Nextjs 15
// export async function generateStaticParams() {
//   const url = '/api/events';

//   const data = await getStrapiData<APIResponseCollection<'api::event.event'>>(
//     'fi',
//     url,
//     ['event'],
//     true,
//   );

//   if (!data) return [];

//   const events = data.data
//     .filter((e) => e.id)
//     .map((event) => event.id.toString());

//   return events.map((eventId) => ({
//     slug: eventId,
//   }));
// }
