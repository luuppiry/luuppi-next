import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/sport?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['sport'] as const satisfies StrapiCacheTag[];

interface SportsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Organization(props: SportsProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(props: SportsProps): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<APIResponse<'api::sport.sport'>>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/sports`;

  return formatMetadata(data, pathname);
}
