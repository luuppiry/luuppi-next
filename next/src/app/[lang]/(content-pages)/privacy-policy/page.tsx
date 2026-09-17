import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/privacy-policy?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['privacy-policy'] as const satisfies StrapiCacheTag[];

interface PrivacyPolicyProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function PrivacyPolicy(props: PrivacyPolicyProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: PrivacyPolicyProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::privacy-policy.privacy-policy'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/privacy-policy`;

  return formatMetadata(data, pathname);
}
