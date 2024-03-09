import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';

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

  const pageData = await getStrapiData<
    APIResponseCollection<'api::studies-fields-of-study.studies-fields-of-study'>
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
}: StudiesFieldsOfStudyProps): Promise<Metadata> {
  const data = await getStrapiData<
    APIResponseCollection<'api::studies-fields-of-study.studies-fields-of-study'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/studies/fields-of-study`;

  return formatMetadata(data, pathname);
}
