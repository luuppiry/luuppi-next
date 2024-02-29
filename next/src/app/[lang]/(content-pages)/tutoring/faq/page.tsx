import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiTutoringFaqTutoringFaq } from '@/types/contentTypes';
import { Metadata } from 'next';

const url =
  '/api/tutoring-faq?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['tutoring-faq'];

interface TutoringFaqProps {
  params: { lang: SupportedLanguage };
}

export default async function TutoringFaq({ params }: TutoringFaqProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiTutoringFaqTutoringFaq>(
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
}: TutoringFaqProps): Promise<Metadata> {
  const data = await getStrapiData<ApiTutoringFaqTutoringFaq>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/tutoring/faq`;

  return formatMetadata(data, pathname);
}
