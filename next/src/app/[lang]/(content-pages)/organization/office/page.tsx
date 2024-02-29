import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationOfficeOrganizationOffice } from '@/types/contentTypes';
import { Metadata } from 'next';

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

  const pathname = `/${params.lang}/organization/office`;

  return formatMetadata(data, pathname);
}
