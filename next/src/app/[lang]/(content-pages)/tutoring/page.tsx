import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiTutoringGeneralTutoringGeneral } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';

const url =
  '/api/tutoring-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['tutoring-general'];

interface TutoringProps {
  params: { lang: SupportedLanguage };
}

export default async function Tutoring({ params }: TutoringProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiTutoringGeneralTutoringGeneral>(
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
}: TutoringProps): Promise<Metadata> {
  const data = await getStrapiData<ApiTutoringGeneralTutoringGeneral>(
    params.lang,
    url,
    tags,
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
