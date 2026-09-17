import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-honorary-member?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = [
  'organization-honorary-member',
] as const satisfies StrapiCacheTag[];

export default async function OrganizationHonoraryMembers() {
  return <ContentPage fetchTags={tags} url={url} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-honorary-member.organization-honorary-member'>
  >(lang, url, tags);

  const pathname = `/${lang}/organization/honorary-members`;

  return formatMetadata(data, pathname);
}
