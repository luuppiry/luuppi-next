import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';
import { Suspense } from 'react';

const url =
  '/api/tutoring-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['tutoring-general'] as const satisfies StrapiCacheTag[];

export default async function Tutoring() {
  return (
    <Suspense fallback={null}>
      <ContentPage fetchTags={tags} url={url} />
    </Suspense>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::tutoring-general.tutoring-general'>
  >(lang, url, tags);

  const pathname = `/${lang}/tutoring`;

  return formatMetadata(data, pathname);
}
