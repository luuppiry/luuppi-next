import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-document?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-document'] as const satisfies StrapiCacheTag[];

interface OrganizationDocumentsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function OrganizationDocuments(
  props: OrganizationDocumentsProps,
) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: OrganizationDocumentsProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-document.organization-document'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/documents`;

  return formatMetadata(data, pathname);
}
