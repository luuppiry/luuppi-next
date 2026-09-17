import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';
import { Suspense } from 'react';

const url =
  '/api/tutoring-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['tutoring-general'] as const satisfies StrapiCacheTag[];

interface TutoringProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Tutoring(props: TutoringProps) {
  return (
    <Suspense fallback={null}>
      <ContentPage fetchTags={tags} params={props.params} url={url} />
    </Suspense>
  );
}

export async function generateMetadata(
  props: TutoringProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::tutoring-general.tutoring-general'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/tutoring`;

  return formatMetadata(data, pathname);
}
