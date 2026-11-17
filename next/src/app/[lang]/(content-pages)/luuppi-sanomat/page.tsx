import { getDictionary } from '@/dictionaries';
import { toCalendarDate } from '@/libs/constants';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { APIResponseCollection, APIResponseData } from '@/types/types';
import Image from 'next/image';
import { lang as language } from 'next/root-params';
import qs from 'qs';

type Publication = APIResponseData<'api::luuppi-sanomat.luuppi-sanomat'>;

const getPublishedDate = (publication: Publication) =>
  publication.firstPublishedAt ||
  publication.publishedAt ||
  publication.createdAt!;

export default async function LuuppiSanomat() {
  const lang = await language();
  const dictionary = await getDictionary();

  const query = qs.stringify({
    populate: ['image'],
    pagination: { pageSize: 500 },
    sort: ['firstPublishedAt:desc', 'publishedAt:desc'],
  });

  const pageData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >({
    lang: 'fi',
    url: `/api/luuppi-sanomats?${query}`,
    collection: 'luuppi-sanomat',
  });

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.sanomat}</h1>
      <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {pageData.data.map((publication) => (
          <a
            key={publication.documentId}
            className="group relative flex cursor-pointer flex-col gap-4 transition-transform duration-300 hover:scale-105"
            href={`/${lang}/luuppi-sanomat/${toCalendarDate(getPublishedDate(publication))}`}
          >
            {publication.image.url && (
              <div
                className={
                  'relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300'
                }
              >
                <Image
                  alt={`${dictionary.navigation.sanomat} cover`}
                  className="h-full w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  src={getStrapiUrl(publication.image.url)}
                  fill
                />
              </div>
            )}
            <div className="absolute bottom-0 right-0 z-20 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
              {firstLetterToUpperCase(
                new Date(getPublishedDate(publication)).toLocaleDateString(
                  lang,
                  { month: 'short', year: 'numeric' },
                ),
              )}
            </div>
            <div className="absolute bottom-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black to-transparent opacity-25" />
            <div className="absolute -bottom-1.5 left-1.5 -z-10 h-full w-full transform rounded-lg bg-gray-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:rotate-1 dark:bg-base-100" />
            <div className="absolute -bottom-3 left-3 -z-20 h-full w-full transform rounded-lg bg-gray-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-2 dark:bg-base-200" />
          </a>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
