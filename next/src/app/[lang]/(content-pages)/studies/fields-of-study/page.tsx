import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/lib';
import { SupportedLanguage } from '@/models/locale';
import { ApiStudiesFieldsOfStudyStudiesFieldsOfStudy } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

const url =
  '/api/studies-fields-of-study?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['studies-fields-of-study'];

interface StudiesFieldsOfStudyProps {
  params: { lang: SupportedLanguage };
}

export default async function StudiesFieldsOfStudy({
  params,
}: StudiesFieldsOfStudyProps) {
  const dictionary = await getDictionary(params.lang);

  const organizationData =
    await getStrapiData<ApiStudiesFieldsOfStudyStudiesFieldsOfStudy>(
      params.lang,
      url,
      tags,
    );

  return (
    <ContentPage
      contentData={organizationData.data}
      dictionary={dictionary}
      lang={params.lang}
    />
  );
}

export async function generateMetadata({
  params,
}: StudiesFieldsOfStudyProps): Promise<Metadata> {
  const data = await getStrapiData<ApiStudiesFieldsOfStudyStudiesFieldsOfStudy>(
    params.lang,
    url,
    tags,
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
