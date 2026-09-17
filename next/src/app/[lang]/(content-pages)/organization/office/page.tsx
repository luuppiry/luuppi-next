import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-office?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-office'] as const satisfies StrapiCacheTag[];

interface OrganizationOfficeProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function OrganizationOffice(
  props: OrganizationOfficeProps,
) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: OrganizationOfficeProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-office.organization-office'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/office`;

  return formatMetadata(data, pathname);
}
