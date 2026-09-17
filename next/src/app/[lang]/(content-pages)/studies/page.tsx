import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/studies-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['studies-general'] as const satisfies StrapiCacheTag[];

interface StudiesProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Studies(props: StudiesProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(props: StudiesProps): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::studies-general.studies-general'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/studies`;

  return formatMetadata(data, pathname);
}
