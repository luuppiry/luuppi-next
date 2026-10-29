import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { lang as language } from 'next/root-params';

const url =
  '/api/tutoring-faq?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';

export default async function TutoringFaq() {
  return <ContentPage collection="tutoring-faq" url={url} unique />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const data = await getStrapiData<
    APIResponse<'api::tutoring-faq.tutoring-faq'>
  >({
    lang,
    url,
    collection: 'tutoring-faq',
    unique: true,
  });

  const pathname = `/${lang}/tutoring/faq`;

  return formatMetadata(data, pathname);
}
