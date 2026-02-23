import { dateFormat } from '@/libs/constants';
import { flipNewsLocale } from '@/libs/strapi/flip-locale';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { analyzeReadTime } from '@/libs/utils/analyze-read-time';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponseCollection, APIResponseData } from '@/types/types';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserAlt } from 'react-icons/fa';
import { PiImageBroken } from 'react-icons/pi';
import qs from 'qs';

interface RenderNewsProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default async function RenderNews({
  lang,
  dictionary,
}: RenderNewsProps) {
  const { isEnabled: isDraftMode } = await draftMode();

  const query = qs.stringify({
    populate: {
      banner: true,
      authorImage: true,
      localizations: {
        populate: { banner: true },
      },
    },
    sort: ['publishedAt:desc', 'createdAt:desc'],
    pagination: { pageSize: 20 },
  });

  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >('fi', `/api/news?${query}`, ['news-single'], false, isDraftMode);

  // We need to fetch more than we render, because flipNewsLocale removes entries that don't have english localization
  const newsLocaleFlipped = flipNewsLocale(lang, pageData.data).slice(0, 4);

  return (
    <>
      {newsLocaleFlipped.map((news, i) => (
        <article
          key={i}
          className={`${
            i === 0
              ? 'col-span-3 max-lg:col-span-1 max-lg:flex-col'
              : 'col-span-1 flex-col'
          } flex gap-4 rounded-lg border border-gray-200/50 bg-background-50 shadow-sm dark:border-background-50 dark:bg-background-100`}
        >
          <div
            className={`${
              i !== 0
                ? 'shrink-0 rounded-t-lg'
                : 'rounded-l-lg max-lg:shrink-0 max-lg:rounded-l-none max-lg:rounded-t-lg'
            } relative aspect-video w-full bg-gradient-to-r from-secondary-400 to-primary-300`}
          >
            {news.banner?.url ? (
              <Image
                alt="News banner"
                className={`${
                  i !== 0
                    ? 'rounded-t-lg'
                    : 'rounded-l-lg max-lg:rounded-l-none max-lg:rounded-t-lg'
                } object-cover dark:brightness-90`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={getStrapiUrl(news.banner?.url)}
                fill
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <PiImageBroken className="text-8xl text-white" />
              </div>
            )}
          </div>
          <div className="flex h-full w-full flex-col justify-between gap-12 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold uppercase text-accent-400 dark:text-accent-600">
                  {news.category}
                </span>
                <p
                  className={`flex items-center gap-1 text-sm font-semibold uppercase opacity-75 ${
                    i === 0 ? 'max-lg:text-xs' : 'text-xs'
                  }`}
                >
                  {analyzeReadTime(
                    news as APIResponseData<'api::news-single.news-single'>,
                  )}{' '}
                  {dictionary.general.min_read}
                </p>
              </div>
              <Link
                className={`inline-block font-bold ${i === 0 ? 'text-2xl max-lg:text-xl' : 'text-xl'} hover:underline`}
                href={`/${lang}/news/${news.slug}`}
              >
                {news.title}
              </Link>
              <p className="line-clamp-3 text-sm">{news.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {news.authorImage?.url ? (
                <Image
                  alt="News author avatar"
                  className="h-[50px] w-[50px] rounded-full bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  height={50}
                  src={getStrapiUrl(news.authorImage?.url)}
                  width={50}
                />
              ) : (
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-secondary-400 to-primary-300">
                  <FaUserAlt color="white" size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{news.authorName}</span>
                <span className="text-sm opacity-60">
                  {new Date(
                    news?.publishedAt || news.createdAt!,
                  ).toLocaleDateString(lang, dateFormat)}
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
