import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-office?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function OrganizationOffice() {
  return <ContentPage collection="organization-office" url={url} unique />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-office.organization-office'>
  >({ lang, url, collection: 'organization-office', unique: true });

  const pathname = `/${lang}/organization/office`;

  return formatMetadata(data, pathname);
}
