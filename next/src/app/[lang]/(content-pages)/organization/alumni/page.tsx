import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-alumni?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function OrganizationAlumni() {
  return <ContentPage collection="organization-alumni" url={url} unique />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-alumni.organization-alumni'>
  >({ lang, url, collection: 'organization-alumni', unique: true });

  const pathname = `/${lang}/organization/alumni`;

  return formatMetadata(data, pathname);
}
