import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-office-hervanta?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function OrganizationOfficeHervanta() {
  return (
    <ContentPage collection="organization-office-hervanta" url={url} unique />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-office-hervanta.organization-office-hervanta'>
  >({
    lang,
    url,
    collection: 'organization-office-hervanta',
    unique: true,
  });

  const pathname = `/${lang}/organization/office-hervanta`;

  return formatMetadata(data, pathname);
}
