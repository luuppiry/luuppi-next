import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/organization-benefit?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default function OrganizationBenefits() {
  return <ContentPage collection="organization-benefit" url={url} unique />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::organization-benefit.organization-benefit'>
  >({
    lang,
    url,
    collection: 'organization-benefit',
    unique: true,
  });

  const pathname = `/${lang}/organization/benefits`;

  return formatMetadata(data, pathname);
}
