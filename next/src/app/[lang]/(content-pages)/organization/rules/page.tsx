import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-rule?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-rule'] as const satisfies StrapiCacheTag[];

interface OrganizationRulesProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function OrganizationRules(props: OrganizationRulesProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: OrganizationRulesProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-rule.organization-rule'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/rules`;

  return formatMetadata(data, pathname);
}
