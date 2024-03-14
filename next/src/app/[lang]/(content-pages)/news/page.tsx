import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { flipNewsLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserAlt } from 'react-icons/fa';

interface NewsProps {
  params: { lang: SupportedLanguage };
}

export default async function News({ params }: NewsProps) {
  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >(
    'fi',
    '/api/news?populate[0]=banner&populate[1]=authorImage&populate[3]=localizations&pagination[pageSize]=100',
    ['news-single'],
  );

  const newsLocaleFlipped = flipNewsLocale(params.lang, pageData.data);
  const dictionary = await getDictionary(params.lang);

  const sortedNews = newsLocaleFlipped
    .filter((n) => n.attributes.createdAt)
    .sort(
      (a, b) =>
        new Date(b.attributes.createdAt!).getTime() -
        new Date(a.attributes.createdAt!).getTime(),
    );

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.news}</h1>
      <div className="flex flex-col gap-12 max-md:gap-6">
        {sortedNews.map((news) => (
          <article
            key={news.attributes.title}
            className={
              'flex gap-4 rounded-lg border border-gray-200/50 bg-white shadow-sm max-sm:flex-col'
            }
          >
            <div
              className={`relative aspect-video w-full rounded-l-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-lg:rounded-l-none max-lg:rounded-t-lg
                      `}
            >
              <Image
                alt="News banner"
                className={'rounded-t-lg object-cover'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={getStrapiUrl(news.attributes.banner?.data.attributes.url)}
                fill
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-6 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold uppercase text-accent-400">
                  {news.attributes.category}
                </span>
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
                {news.attributes.authorImage?.data.attributes.url ? (
                  <Image
                    alt="News author avatar"
                    className="rounded-full bg-gradient-to-r from-secondary-400 to-primary-300"
                    height={50}
                    src={getStrapiUrl(
                      news.attributes.authorImage.data?.attributes.url,
                    )}
                    width={50}
                  />
                ) : (
                  <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-r from-secondary-400 to-primary-300">
                    <FaUserAlt color="white" size={20} />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {news.attributes.authorName}
                  </span>
                  <span className="text-sm opacity-60">
                    {new Date(news.attributes.createdAt!).toLocaleDateString(
                      params.lang,
                      dateFormat,
                    )}
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

export async function generateMetadata({
  params,
}: NewsProps): Promise<Metadata> {
  const url =
    '/api/news-list?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage&populate=ContactBanner';
  const tags = ['news-list'];

  const data = await getStrapiData<
    APIResponseCollection<'api::news-list.news-list'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/news`;

  return formatMetadata(data, pathname);
}
