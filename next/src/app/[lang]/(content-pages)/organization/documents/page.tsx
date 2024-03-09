import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-document?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-document'];

interface OrganizationDocumentsProps {
  params: { lang: SupportedLanguage };
}

export default async function OrganizationDocuments({
  params,
}: OrganizationDocumentsProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::organization-document.organization-document'>
  >(params.lang, url, tags);

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
}: OrganizationDocumentsProps): Promise<Metadata> {
  const data = await getStrapiData<
    APIResponseCollection<'api::organization-document.organization-document'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/documents`;

  return formatMetadata(data, pathname);
}
