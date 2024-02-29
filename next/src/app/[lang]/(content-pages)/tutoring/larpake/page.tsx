import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiTutoringLarpakeTutoringLarpake } from '@/types/contentTypes';
import { Metadata } from 'next';

const url =
  '/api/tutoring-larpake?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['tutoring-larpake'];

interface TutoringLarpakeProps {
  params: { lang: SupportedLanguage };
}

export default async function TutoringLarpake({
  params,
}: TutoringLarpakeProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiTutoringLarpakeTutoringLarpake>(
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
}: TutoringLarpakeProps): Promise<Metadata> {
  const data = await getStrapiData<ApiTutoringLarpakeTutoringLarpake>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/tutoring/larpake`;

  return formatMetadata(data, pathname);
}
