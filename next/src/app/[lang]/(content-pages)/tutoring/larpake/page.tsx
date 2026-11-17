import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/tutoring-larpake?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function TutoringLarpake() {
  return <ContentPage collection="tutoring-larpake" url={url} unique />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::tutoring-larpake.tutoring-larpake'>
  >({
    lang,
    url,
    collection: 'tutoring-larpake',
  });

  const pathname = `/${lang}/tutoring/larpake`;

  return formatMetadata(data, pathname);
}
