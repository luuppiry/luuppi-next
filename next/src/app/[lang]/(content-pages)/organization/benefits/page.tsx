import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-benefit?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-benefit'] as const satisfies StrapiCacheTag[];

interface OrganizationBenefitsProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default function OrganizationBenefits(props: OrganizationBenefitsProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: OrganizationBenefitsProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-benefit.organization-benefit'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/benefits`;

  return formatMetadata(data, pathname);
}
