import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/lib';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationDocumentOrganizationDocument } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

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

  const pageData =
    await getStrapiData<ApiOrganizationDocumentOrganizationDocument>(
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
}: OrganizationDocumentsProps): Promise<Metadata> {
  const data = await getStrapiData<ApiOrganizationDocumentOrganizationDocument>(
    params.lang,
    url,
    tags,
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
