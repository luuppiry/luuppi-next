import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/contact?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['contact'] as const satisfies StrapiCacheTag[];

interface ContactProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Contact(props: ContactProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(props: ContactProps): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<APIResponse<'api::contact.contact'>>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/contact`;

  return formatMetadata(data, pathname);
}
