import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { flipNewsLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { analyzeReadTime } from '@/libs/utils/analyze-read-time';
import { SupportedLanguage } from '@/models/locale';
import {
  APIResponse,
  APIResponseCollection,
  APIResponseData,
} from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserAlt } from 'react-icons/fa';
import { PiImageBroken } from 'react-icons/pi';

interface NewsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function News(props: NewsProps) {
  const params = await props.params;
  const session = await auth();
  const includeDrafts = session?.user?.isLuuppiHato ?? false;

  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >(
    'fi',
    '/api/news?populate[0]=banner&populate[1]=authorImage&populate[3]=localizations&pagination[pageSize]=100',
    ['news-single'],
    undefined,
    includeDrafts,
  );

  const newsLocaleFlipped = flipNewsLocale(params.lang, pageData.data);
  const dictionary = await getDictionary(params.lang);

  const sortedNews = newsLocaleFlipped
    .filter((n) => n.attributes.createdAt)
    .sort((a, b) => {
      const dateA = a.attributes?.publishedAt
        ? new Date(a.attributes.publishedAt).getTime()
        : new Date(a.attributes.createdAt || new Date()).getTime();
      const dateB = b.attributes.publishedAt
        ? new Date(b.attributes.publishedAt).getTime()
        : new Date(b.attributes.createdAt || new Date()).getTime();

      return dateB - dateA;
    });

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.news}</h1>
      <div className="flex flex-col gap-12 max-md:gap-6">
        {sortedNews.map((news) => (
          <article
            key={news.attributes.title}
            className={
              'flex gap-4 rounded-lg border border-gray-200/50 bg-background-50 shadow-sm max-sm:flex-col dark:border-background-200'
            }
          >
            <div
              className={
                'relative aspect-video w-full bg-gradient-to-r from-secondary-400 to-primary-300 max-sm:rounded-t-lg sm:rounded-l-lg'
              }
            >
              {news.attributes.banner?.data?.attributes?.url ? (
                <Image
                  alt="News banner"
                  className={'object-cover max-sm:rounded-t-lg sm:rounded-l-lg'}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={getStrapiUrl(
                    news.attributes.banner?.data.attributes.url,
                  )}
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
                    {news.attributes.category}
                  </span>
                  <p
                    className={
                      'flex items-center gap-1 text-sm font-semibold uppercase opacity-75'
                    }
                  >
                    {analyzeReadTime(
                      news as APIResponseData<'api::news-single.news-single'>,
                    )}{' '}
                    {dictionary.general.min_read}
                  </p>
                </div>
                <Link
                  className={
                    'inline-block text-2xl font-bold hover:underline max-lg:text-xl'
                  }
                  href={`/${params.lang}/news/${news.attributes.slug}`}
                >
                  {news.attributes.title}
                </Link>
                <p className="line-clamp-4">{news.attributes.description}</p>
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
                  {!news.attributes.publishedAt && (
                    <span className="badge badge-neutral mb-1">
                      {dictionary.general.draft} 👷🏼
                    </span>
                  )}
                  <span className="text-sm font-semibold">
                    {news.attributes.authorName}
                  </span>
                  <span className="text-sm opacity-60">
                    {new Date(
                      news.attributes?.publishedAt ||
                        news.attributes.createdAt!,
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
    '/api/news-list?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage&populate=ContactBanner';
  const tags = ['news-list'];

  const data = await getStrapiData<APIResponse<'api::news-list.news-list'>>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/news`;

  return formatMetadata(data, pathname);
}
