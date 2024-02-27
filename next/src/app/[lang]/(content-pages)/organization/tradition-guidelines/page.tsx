import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationTraditionGuidelineOrganizationTraditionGuideline } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

const url =
  '/api/organization-tradition-guideline?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-tradition-guideline'];

interface OrganizationTraditionGuidelinesProps {
  params: { lang: SupportedLanguage };
}

export default async function OrganizationTraditionGuidelines({
  params,
}: OrganizationTraditionGuidelinesProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData =
    await getStrapiData<ApiOrganizationTraditionGuidelineOrganizationTraditionGuideline>(
      params.lang,
      url,
      tags,
    );

  return (
    <ContentPage
      contentData={pageData.data}
      dictionary={dictionary}
      lang={params.lang}
    />
  );
}

export async function generateMetadata({
  params,
}: OrganizationTraditionGuidelinesProps): Promise<Metadata> {
  const data =
    await getStrapiData<ApiOrganizationTraditionGuidelineOrganizationTraditionGuideline>(
      params.lang,
      url,
      tags,
    );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
