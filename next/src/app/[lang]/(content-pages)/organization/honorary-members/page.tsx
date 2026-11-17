import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-honorary-member?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function OrganizationHonoraryMembers() {
  return (
    <ContentPage collection="organization-honorary-member" url={url} unique />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-honorary-member.organization-honorary-member'>
  >({
    lang,
    url,
    collection: 'organization-honorary-member',
    unique: true,
  });

  const pathname = `/${lang}/organization/honorary-members`;

  return formatMetadata(data, pathname);
}
