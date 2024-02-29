import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiStudiesWorkshopStudiesWorkshop } from '@/types/contentTypes';
import { Metadata } from 'next';

const url =
  '/api/studies-workshop?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['studies-workshop'];

interface StudiesWorkshopProps {
  params: { lang: SupportedLanguage };
}

export default async function StudiesWorkshop({
  params,
}: StudiesWorkshopProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiStudiesWorkshopStudiesWorkshop>(
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
}: StudiesWorkshopProps): Promise<Metadata> {
  const data = await getStrapiData<ApiStudiesWorkshopStudiesWorkshop>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/studies/workshops`;

  return formatMetadata(data, pathname);
}
