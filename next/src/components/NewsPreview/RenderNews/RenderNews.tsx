import { dateFormat } from '@/libs/constants';
import { flipNewsLocale } from '@/libs/strapi/flip-locale';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { analyzeReadTime } from '@/libs/utils/analyze-read-time';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponseCollection, APIResponseData } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserAlt } from 'react-icons/fa';
import { PiImageBroken } from 'react-icons/pi';

interface RenderNewsProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default async function RenderNews({
  lang,
  dictionary,
}: RenderNewsProps) {
  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >(
    'fi',
    '/api/news?populate[0]=banner&populate[1]=authorImage&populate[3]=localizations&pagination[pageSize]=100',
    ['news-single'],
  );

  const newsLocaleFlipped = flipNewsLocale(lang, pageData.data);

  const sortedNews = newsLocaleFlipped
    .sort((a, b) => {
      const dateA = a.attributes?.publishedAt
        ? new Date(a.attributes.publishedAt).getTime()
        : new Date(a.attributes.createdAt || new Date()).getTime();
      const dateB = b.attributes.publishedAt
        ? new Date(b.attributes.publishedAt).getTime()
        : new Date(b.attributes.createdAt || new Date()).getTime();

      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <>
      {sortedNews.map((news, i) => (
        <article
          key={i}
          className={`${
            i === 0
              ? 'col-span-3 max-lg:col-span-1 max-lg:flex-col'
              : 'col-span-1 flex-col'
          } flex gap-4 rounded-lg border border-gray-200/50 bg-background-50 shadow-sm`}
        >
          <div
            className={`${
              i !== 0
                ? 'shrink-0 rounded-t-lg'
                : 'rounded-l-lg max-lg:shrink-0 max-lg:rounded-l-none max-lg:rounded-t-lg'
            } relative aspect-video w-full bg-gradient-to-r from-secondary-400 to-primary-300`}
          >
            {news.attributes.banner?.data?.attributes?.url ? (
              <Image
                alt="News banner"
                className={`${
                  i !== 0
                    ? 'rounded-t-lg'
                    : 'rounded-l-lg max-lg:rounded-l-none max-lg:rounded-t-lg'
                } object-cover`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={getStrapiUrl(news.attributes.banner?.data.attributes.url)}
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
                <span className="text-sm font-bold uppercase text-accent-400">
                  {news.attributes.category}
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
                href={`/${lang}/news/${news.attributes.slug}`}
              >
                {news.attributes.title}
              </Link>
              <p className="line-clamp-3 text-sm">
                {news.attributes.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {news.attributes.authorImage?.data?.attributes?.url ? (
                <Image
                  alt="News author avatar"
                  className="h-[50px] w-[50px] rounded-full bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  height={50}
                  src={getStrapiUrl(
                    news.attributes.authorImage.data?.attributes.url,
                  )}
                  width={50}
                />
              ) : (
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-secondary-400 to-primary-300">
                  <FaUserAlt color="white" size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {news.attributes.authorName}
                </span>
                <span className="text-sm opacity-60">
                  {new Date(
                    news.attributes?.publishedAt || news.attributes.createdAt!,
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
