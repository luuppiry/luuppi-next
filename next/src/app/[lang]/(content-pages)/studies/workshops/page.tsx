import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/lib';
import { SupportedLanguage } from '@/models/locale';
import { ApiStudiesWorkshopStudiesWorkshop } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

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

  const organizationData =
    await getStrapiData<ApiStudiesWorkshopStudiesWorkshop>(
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
}: StudiesWorkshopProps): Promise<Metadata> {
  const data = await getStrapiData<ApiStudiesWorkshopStudiesWorkshop>(
    params.lang,
    url,
    tags,
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
