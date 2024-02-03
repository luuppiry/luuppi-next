import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import formatMetadata from '@/lib/format-metadata';
import getStrapiData from '@/lib/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiStudiesGeneralStudiesGeneral } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

const url =
  '/api/studies-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['studies-general'];

interface StudiesProps {
  params: { lang: SupportedLanguage };
}

export default async function Studies({ params }: StudiesProps) {
  const dictionary = await getDictionary(params.lang);

  const organizationData = await getStrapiData<ApiStudiesGeneralStudiesGeneral>(
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
}: StudiesProps): Promise<Metadata> {
  const data = await getStrapiData<ApiStudiesGeneralStudiesGeneral>(
    params.lang,
    url,
    tags,
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}