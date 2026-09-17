import ContentPage from '@/components/ContentPage/ContentPage';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, StrapiCacheTag } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/tutoring-faq?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['tutoring-faq'] as const satisfies StrapiCacheTag[];

interface TutoringFaqProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function TutoringFaq(props: TutoringFaqProps) {
  return <ContentPage fetchTags={tags} params={props.params} url={url} />;
}

export async function generateMetadata(
  props: TutoringFaqProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::tutoring-faq.tutoring-faq'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/tutoring/faq`;

  return formatMetadata(data, pathname);
}
