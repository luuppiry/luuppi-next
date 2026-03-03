import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { flipNewsLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { analyzeReadTime } from '@/libs/utils/analyze-read-time';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserAlt } from 'react-icons/fa';
import { PiImageBroken } from 'react-icons/pi';
import qs from 'qs'

interface NewsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function News(props: NewsProps) {
  const params = await props.params;
  const { isEnabled: isDraftMode } = await draftMode();

const query = qs.stringify({
  populate: {
    banner: true,
    authorImage: true,
    localizations: {
      populate: {
        banner: true,
      }
    }
  },
  pagination: {
    pageSize: 100
  }
})

  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >(
    'fi',
    `/api/news?${query}`,
    ['news-single'],
    false,
    isDraftMode,
  );

  const newsLocaleFlipped = flipNewsLocale(params.lang, pageData.data);
  const dictionary = await getDictionary(params.lang);

  const sortedNews = newsLocaleFlipped
    .filter((n) => n.createdAt)
    .sort((a, b) => {
      const dateA = a?.publishedAt
        ? new Date(a.publishedAt).getTime()
        : new Date(a.createdAt || new Date()).getTime();
      const dateB = b.publishedAt
        ? new Date(b.publishedAt).getTime()
        : new Date(b.createdAt || new Date()).getTime();

      return dateB - dateA;
    });

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.news}</h1>
      <div className="flex flex-col gap-12 max-md:gap-6">
        {sortedNews.map((news) => (
          <article
            key={news.documentId}
            className={
              'flex gap-4 rounded-lg border border-gray-200/50 bg-background-50 shadow-sm max-sm:flex-col dark:border-background-200'
            }
          >
            <div
              className={
                'relative aspect-video w-full bg-gradient-to-r from-secondary-400 to-primary-300 max-sm:rounded-t-lg sm:rounded-l-lg'
              }
            >
              {news.banner?.url ? (
                <Image
                  alt="News banner"
                  className={'object-cover max-sm:rounded-t-lg sm:rounded-l-lg'}
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
            <div className="flex w-full flex-col justify-between gap-6 p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold uppercase text-accent-400 dark:text-accent-700">
                    {news.category}
                  </span>
                  <p
                    className={
                      'flex items-center gap-1 text-sm font-semibold uppercase opacity-75'
                    }
                  >
                    {analyzeReadTime(news)} {dictionary.general.min_read}
                  </p>
                </div>
                <Link
                  className={
                    'inline-block text-2xl font-bold hover:underline max-lg:text-xl'
                  }
                  href={`/${params.lang}/news/${news.slug}`}
                >
                  {news.title}
                </Link>
                <p className="line-clamp-4">{news.description}</p>
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
                  {!news.publishedAt && (
                    <span className="badge badge-neutral mb-1">
                      {dictionary.general.draft} 👷🏼
                    </span>
                  )}
                  <span className="text-sm font-semibold">
                    {news.authorName}
                  </span>
                  <span className="text-sm opacity-60">
                    {new Date(
                      news?.publishedAt || news.createdAt!,
                    ).toLocaleDateString(params.lang, dateFormat)}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(props: NewsProps): Promise<Metadata> {
  const params = await props.params;
  const url =
    '/api/news-list?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['news-list'] as const;

  const data = await getStrapiData<APIResponse<'api::news-list.news-list'>>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/news`;

  return formatMetadata(data, pathname);
}
