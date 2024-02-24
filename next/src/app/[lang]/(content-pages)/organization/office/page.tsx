import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationOfficeOrganizationOffice } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

const url =
  '/api/organization-office?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-office'];

interface OrganizationOfficeProps {
  params: { lang: SupportedLanguage };
}

export default async function OrganizationOffice({
  params,
}: OrganizationOfficeProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiOrganizationOfficeOrganizationOffice>(
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
}: OrganizationOfficeProps): Promise<Metadata> {
  const data = await getStrapiData<ApiOrganizationOfficeOrganizationOffice>(
    params.lang,
    url,
    tags,
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
