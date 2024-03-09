import SidePartners from '@/components/SidePartners/SidePartners';
import { getDictionary } from '@/dictionaries';
import { longDateFormat, shortDateFormat } from '@/libs/constants';
import {
  getLuuppiEventById,
  getLuuppiEvents,
} from '@/libs/events/get-legacy-events';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5';

interface EventProps {
  params: { slug: string; lang: SupportedLanguage };
}

export default async function Event({ params }: EventProps) {
  const dictionary = await getDictionary(params.lang);

  const id = parseInt(params.slug, 10);
  if (isNaN(id)) {
    redirect(`/${params.lang}/404`);
  }

  const event = await getLuuppiEventById(params.lang, params.slug);

  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(params.lang, '/api/companies?populate=*', ['company']);

  if (!event) {
    redirect(`/${params.lang}/404`);
  }

  // Remove empty paragraphs
  event.description = event.description.replace(/<p>&nbsp;<\/p>/g, '');

  // Replace h1 with h2
  event.description = event.description.replace(/<h1/g, '<h2');
  event.description = event.description.replace(/<\/h1>/g, '</h2>');

  const index = event.description.indexOf('--\n');
  if (index !== -1) {
    event.description = event.description.substring(0, index);
  }

  return (
    <div className="flex w-full gap-12">
      <div className="flex w-full flex-col">
        <h1 className="mb-12">{event.title}</h1>
        <div className="mb-6 flex gap-4 rounded-lg bg-background-50/50">
          <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
          <div className="flex max-w-full flex-col gap-2 rounded-lg py-4 pr-4 font-semibold max-sm:text-sm">
            <div className="flex items-center">
              <IoCalendarOutline className="mr-2 shrink-0 text-2xl" />
              <p className="line-clamp-2">
                {firstLetterToUpperCase(
                  new Date(event.start).toLocaleString(
                    params.lang,
                    longDateFormat,
                  ),
                )}{' '}
                -{' '}
                {new Date(event.start).toLocaleString(
                  params.lang,
                  shortDateFormat,
                )}
                {'-'}
                {new Date(event.end).toLocaleString(
                  params.lang,
                  shortDateFormat,
                )}
              </p>
            </div>
            <div className="flex items-center">
              <IoLocationOutline className="mr-2 shrink-0 text-2xl" />
              <p className="line-clamp-2">{event.location}</p>
            </div>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: event.description }}
          className="prose prose-custom max-w-full break-words decoration-secondary-400 transition-all duration-300 ease-in-out"
        />
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
  );
}

// TODO: Change when we have events on Strapi :)
export async function generateMetadata({
  params,
}: EventProps): Promise<Metadata> {
  const event = await getLuuppiEventById(params.lang, params.slug);

  const pathname = `/${params.lang}/events/${params.slug}`;

  return {
    title: `${event?.title} | Luuppi ry`,
    description: event?.description,
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title: event?.title,
      description: event?.description,
      url: pathname,
      siteName: 'Luuppi ry',
    },
    twitter: {
      title: event?.title,
      description: event?.description,
    },
  };
}

export async function generateStaticParams() {
  const eventData = await getLuuppiEvents('fi');

  return eventData
    .filter((e) => e.id)
    .map((event) => ({
      slug: event.id,
    }));
}
