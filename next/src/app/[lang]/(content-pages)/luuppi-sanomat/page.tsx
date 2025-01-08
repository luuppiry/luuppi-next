import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import Image from 'next/image';

interface LuuppiSanomatProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function LuuppiSanomat(props: LuuppiSanomatProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >('fi', '/api/luuppi-sanomats?populate[1]=image&pagination[pageSize]=100', [
    'luuppi-sanomat',
  ]);

  const sortedData = pageData.data
    .filter((publication) => publication?.createdAt)
    .sort((a, b) => {
      const dateA = a?.publishedAt
        ? new Date(a?.publishedAt).getTime()
        : new Date(a?.createdAt || new Date()).getTime();
      const dateB = b?.publishedAt
        ? new Date(b?.publishedAt).getTime()
        : new Date(b?.createdAt || new Date()).getTime();

      return dateB - dateA;
    });

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.sanomat}</h1>
      <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {sortedData.map((publication) => (
          <a
            key={publication.id}
            className="group relative flex cursor-pointer flex-col gap-4 transition-transform duration-300 hover:scale-105"
            href={`/${params.lang}/luuppi-sanomat/${publication.id}`}
          >
            {publication?.image?.url && (
              <div
                className={
                  'relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300'
                }
              >
                <Image
                  alt={`${dictionary.navigation.sanomat} cover`}
                  className="h-full w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  src={getStrapiUrl(publication?.image?.url)}
                  fill
                />
              </div>
            )}
            <div className="absolute bottom-0 right-0 z-20 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
              {firstLetterToUpperCase(
                new Date(
                  publication?.publishedAt || publication?.createdAt!,
                ).toLocaleDateString(params.lang, {
                  month: 'short',
                  year: 'numeric',
                }),
              )}
            </div>
            <div className="absolute bottom-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black to-transparent opacity-25" />
            <div className="absolute -bottom-1.5 left-1.5 -z-10 h-full w-full transform rounded-lg bg-gray-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:rotate-1" />
            <div className="absolute -bottom-3 left-3 -z-20 h-full w-full transform rounded-lg bg-gray-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-2" />
          </a>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
