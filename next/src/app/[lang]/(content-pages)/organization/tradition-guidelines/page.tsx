import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-tradition-guideline?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-tradition-guideline'] as const;

interface OrganizationTraditionGuidelinesProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function OrganizationTraditionGuidelines(
  props: OrganizationTraditionGuidelinesProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponse<'api::organization-tradition-guideline.organization-tradition-guideline'>
  >(params.lang, url, tags);

  return (
    <ContentPage
      contentData={pageData.data}
      dictionary={dictionary}
      lang={params.lang}
    />
  );
}

export async function generateMetadata(
  props: OrganizationTraditionGuidelinesProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-tradition-guideline.organization-tradition-guideline'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/tradition-guidelines`;

  return formatMetadata(data, pathname);
}
