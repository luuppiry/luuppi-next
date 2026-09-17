import { getDictionary } from '@/dictionaries';
import { dateFormat } from '@/libs/constants';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { APIResponseCollection, StrapiCacheTag } from '@/types/types';
import { cacheLife, cacheTag } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { lang as language } from 'next/root-params';
import BlockRendererClient from '../BlockRendererClient/BlockRendererClient';
import SideNavigator from '../SideNavigator/SideNavigator';
import SidePartners from '../SidePartners/SidePartners';

interface ContentPageProps {
  fetchTags: StrapiCacheTag[];
  url: string;
}

export default async function ContentPage({
  fetchTags,
  url,
}: ContentPageProps) {
  'use cache';
  cacheLife('max');
  cacheTag(...fetchTags);

  const lang = await language();
  const dictionary = await getDictionary();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: contentData } = await getStrapiData<any>(lang, url, fetchTags);

  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(lang, '/api/companies?populate=*', ['company']);

  const imagePath = contentData.Content.banner.url;
  const imageUrl = getStrapiUrl(imagePath);

  return (
    <div className="flex w-full gap-12">
      <div className="flex w-full flex-col gap-12">
        <div className="relative h-64 rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:h-44">
          <Image
            alt="Page banner image"
            className="rounded-lg object-cover"
            src={imageUrl}
            fill
          />
        </div>
        <div className="relative flex flex-col gap-4">
          <h1>{contentData.Content.title}</h1>
          <div className="flex flex-col opacity-40">
            <p className="text-sm dark:text-white">
              {dictionary.general.content_updated}:{' '}
              {new Date(contentData.updatedAt).toLocaleString(lang, dateFormat)}
            </p>
          </div>
          <div className="luuppi-pattern absolute -left-28 -top-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
        </div>
        <article className="organization-page prose prose-custom max-w-full decoration-secondary-400 transition-all duration-300 ease-in-out">
          <BlockRendererClient content={contentData.Content.content} />
        </article>
        {contentData.ContactBanner && (
          <div className="luuppi-questions-bg flex flex-col items-center justify-center gap-4 rounded-xl bg-secondary-400 p-6 text-center text-white shadow-sm">
            <h2 className="text-2xl font-bold">
              {contentData.ContactBanner.title}
            </h2>
            <p className="max-w-md">{contentData.ContactBanner.description}</p>
            <Link
              className="link text-white"
              href={`mailto:${contentData.ContactBanner.email}`}
            >
              {contentData.ContactBanner.email}
            </Link>
          </div>
        )}
      </div>
      <div className="sticky top-36 flex h-[calc(100vh-180px)] w-full max-w-80 flex-col gap-8 max-lg:hidden">
        <div className="flex flex-col">
          <SideNavigator
            dictionary={dictionary}
            targetClass="organization-page"
          />
        </div>
        <SidePartners
          dictionary={dictionary}
          partnersData={partnersData.data}
        />
      </div>
    </div>
  );
}
