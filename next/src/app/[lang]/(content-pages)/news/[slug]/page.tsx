import { auth } from '@/auth';
import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import SideNavigator from '@/components/SideNavigator/SideNavigator';
import SidePartners from '@/components/SidePartners/SidePartners';
import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { flipNewsLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { getNewsJsonLd } from '@/libs/utils/json-ld';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Script from 'next/script';
import { FaUserAlt } from 'react-icons/fa';
import { PiImageBroken } from 'react-icons/pi';

const baseUrl =
  '/api/news?populate[0]=banner&populate[1]=authorImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations&populate=localizations.Seo.twitter.twitterImage&populate=localizations.Seo.openGraph.openGraphImage&filters[slug][$eq]=';

interface NewsPostProps {
  params: Promise<{ slug: string; lang: SupportedLanguage }>;
}

export default async function NewsPost(props: NewsPostProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const session = await auth();

  const includeDrafts = session?.user?.isLuuppiHato ?? false;

  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >(
    'fi',
    `${baseUrl}${params.slug}`,
    ['news-single'],
    undefined,
    includeDrafts,
  );

  const newsLocaleFlipped = flipNewsLocale(params.lang, pageData.data);

  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(params.lang, '/api/companies?populate=*', ['company']);

  if (!pageData.data.length) {
    redirect(`/${params.lang}/404`);
  }

  const selectedNews = newsLocaleFlipped[0];

  // No version of the content exists in the requested language
  if (!selectedNews?.content) {
    redirect(`/${params.lang}/404`);
  }

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getNewsJsonLd(selectedNews, params.lang)),
        }}
        id="news-jsonld"
        type="application/ld+json"
      />
      <div className="flex w-full gap-12">
        <div className="flex w-full flex-col gap-12">
          <div className="relative aspect-[2/1] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300">
            {selectedNews.banner?.data?.url ? (
              <Image
                alt="News banner"
                className={'rounded-lg object-cover'}
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={getStrapiUrl(selectedNews.banner?.data.url)}
                fill
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <PiImageBroken className="text-8xl text-white" />
              </div>
            )}
          </div>
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {selectedNews.authorImage?.data?.url ? (
                <Image
                  alt="News author avatar"
                  className="h-[50px] w-[50px] rounded-full bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  height={50}
                  src={getStrapiUrl(selectedNews.authorImage.data?.url)}
                  width={50}
                />
              ) : (
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-secondary-400 to-primary-300">
                  <FaUserAlt color="white" size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold">
                  {selectedNews.authorName}{' '}
                  {Boolean(selectedNews?.authorTitle) && (
                    <span className="font-normal">
                      | {selectedNews?.authorTitle}
                    </span>
                  )}
                </span>
                <span className="text-sm opacity-75">
                  {new Date(
                    selectedNews?.publishedAt || selectedNews.createdAt!,
                  ).toLocaleString(params.lang, dateFormat)}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold max-md:text-3xl">
                {selectedNews.title}
              </h1>
            </div>
            <div className="flex flex-col opacity-40">
              <p className="text-sm">
                {dictionary.general.content_updated}:{' '}
                {new Date(selectedNews.updatedAt!).toLocaleString(
                  params.lang,
                  dateFormat,
                )}
              </p>
            </div>
            <div className="luuppi-pattern absolute -left-28 -top-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
          </div>
          <article className="organization-page prose prose-custom max-w-full decoration-secondary-400 transition-all duration-300 ease-in-out">
            <BlockRendererClient content={selectedNews.content!} />
          </article>
        </div>
        <div className="sticky top-36 h-full w-full max-w-80 max-lg:hidden">
          <div className="flex flex-col gap-4">
            <SideNavigator
              dictionary={dictionary}
              targetClass="organization-page"
            />
            <SidePartners
              dictionary={dictionary}
              partnersData={partnersData.data}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata(
  props: NewsPostProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >('fi', `${baseUrl}${params.slug}`, ['news-single']);
  const newsLocaleFlipped = flipNewsLocale(params.lang, data.data);
  const selectedNews = newsLocaleFlipped[0];
  const pathname = `/${params.lang}/news/${params.slug}`;

  // No version of the content exists in the requested language
  if (!selectedNews?.content) {
    return {};
  }

  return formatMetadata({ data: selectedNews }, pathname);
}

export async function generateStaticParams() {
  const pageData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >('fi', '/api/news?pagination[pageSize]=100', ['news-single']);

  return pageData.data.map((news) => ({
    slug: news.slug,
  }));
}
