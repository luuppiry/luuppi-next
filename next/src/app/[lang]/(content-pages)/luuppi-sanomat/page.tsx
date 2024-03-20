import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import Image from 'next/image';

interface LuuppiSanomatProps {
  params: { lang: SupportedLanguage };
}

export default async function LuuppiSanomat({ params }: LuuppiSanomatProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >('fi', '/api/luuppi-sanomats?populate[1]=image&pagination[pageSize]=100', [
    'luuppi-sanomat',
  ]);

  const sortedData = pageData.data
    .filter((publication) => publication.attributes.createdAt)
    .sort(
      (a, b) =>
        new Date(b.attributes.createdAt as string).getTime() -
        new Date(a.attributes.createdAt as string).getTime(),
    );

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.sanomat}</h1>
      <div className="grid grid-cols-3 gap-12 max-md:grid-cols-2">
        {sortedData.map((publication) => (
          <a
            key={publication.id}
            className="relative flex cursor-pointer flex-col gap-4 transition-transform duration-300 hover:scale-105"
            href={`/${params.lang}/luuppi-sanomat/${publication.id}`}
          >
            {publication.attributes.image?.data.attributes.url && (
              <div
                className={
                  'relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300'
                }
              >
                <Image
                  alt={`${dictionary.navigation.sanomat} cover`}
                  className="h-full w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  src={getStrapiUrl(
                    publication.attributes.image?.data.attributes.url,
                  )}
                  fill
                />
              </div>
            )}
            <div className="absolute bottom-0 right-0 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
              {firstLetterToUpperCase(
                new Date(
                  publication.attributes.createdAt as string,
                ).toLocaleDateString(params.lang, {
                  month: 'short',
                  year: 'numeric',
                }),
              )}
            </div>
          </a>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}
