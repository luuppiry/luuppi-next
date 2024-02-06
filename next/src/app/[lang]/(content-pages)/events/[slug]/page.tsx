import SidePartners from '@/components/SidePartners/SidePartners';
import { getDictionary } from '@/dictionaries';
import { getLuuppiEventById } from '@/lib/get-legacy-events';
import getStrapiData from '@/lib/get-strapi-data';
import firstLetterToUpperCase from '@/lib/text-utils';
import { longDateFormat, shortDateFormat } from '@/lib/time-utils';
import { SupportedLanguage } from '@/models/locale';
import { ApiCompanyCompany } from '@/types/contentTypes';
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

  const partnersData = await getStrapiData<ApiCompanyCompany[]>(
    params.lang,
    '/api/companies?populate=*',
    ['company'],
  );

  if (!event) {
    redirect(`/${params.lang}/404`);
  }

  event.description = event.description.replace(/<p>&nbsp;<\/p>/g, '');

  const index = event.description.indexOf('--\n');
  if (index !== -1) {
    event.description = event.description.substring(0, index);
  }

  return (
    <div className="flex w-full gap-12">
      <div className="flex w-full flex-col">
        <h1 className="mb-14">{event.title}</h1>
        <div className="mb-6 flex flex-col gap-2 rounded-lg bg-secondary-400 p-4 font-bold text-white max-sm:text-sm">
          <div className="flex items-center">
            <IoCalendarOutline className="mr-2 shrink-0 text-2xl" />
            <p className="truncate">
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
              {new Date(event.end).toLocaleString(params.lang, shortDateFormat)}
            </p>
          </div>
          <div className="flex items-center">
            <IoLocationOutline className="mr-2 shrink-0 text-2xl" />
            <p className="truncate">{event.location}</p>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: event.description }}
          className="prose prose-custom max-w-full decoration-primary-400 transition-all duration-300 ease-in-out"
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
