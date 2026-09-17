import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-honorary-member?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = [
  'organization-honorary-member',
] as const satisfies StrapiCacheTag[];

interface OrganizationHonoraryMembersProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function OrganizationHonoraryMembers(
  props: OrganizationHonoraryMembersProps,
) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: OrganizationHonoraryMembersProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-honorary-member.organization-honorary-member'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/honorary-members`;

  return formatMetadata(data, pathname);
}
