import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiCollaborationGeneralCollaborationGeneral } from '@/types/contentTypes';
import { Metadata } from 'next';

const url =
  '/api/collaboration-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['collaboration-general'];

interface CollaborationGeneralProps {
  params: { lang: SupportedLanguage };
}

export default async function CollaborationGeneral({
  params,
}: CollaborationGeneralProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData =
    await getStrapiData<ApiCollaborationGeneralCollaborationGeneral>(
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
}: CollaborationGeneralProps): Promise<Metadata> {
  const data = await getStrapiData<ApiCollaborationGeneralCollaborationGeneral>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/collaboration`;

  return formatMetadata(data, pathname);
}
