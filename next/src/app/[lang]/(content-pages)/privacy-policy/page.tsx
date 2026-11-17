import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/privacy-policy?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function PrivacyPolicy() {
  return <ContentPage collection="privacy-policy" url={url} unique />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::privacy-policy.privacy-policy'>
  >({
    lang,
    url,
    collection: 'privacy-policy',
    unique: true,
  });

  const pathname = `/${lang}/privacy-policy`;

  return formatMetadata(data, pathname);
}
