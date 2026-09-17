import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-rule?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-rule'] as const satisfies StrapiCacheTag[];

export default async function OrganizationRules() {
  return <ContentPage fetchTags={tags} url={url} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-rule.organization-rule'>
  >(lang, url, tags);

  const pathname = `/${lang}/organization/rules`;

  return formatMetadata(data, pathname);
}
