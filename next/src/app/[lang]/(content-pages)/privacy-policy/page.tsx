import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/privacy-policy?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['privacy-policy'];

interface PrivacyPolicyProps {
  params: { lang: SupportedLanguage };
}

export default async function PrivacyPolicy({ params }: PrivacyPolicyProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::privacy-policy.privacy-policy'>
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
}: PrivacyPolicyProps): Promise<Metadata> {
  const data = await getStrapiData<
    APIResponseCollection<'api::privacy-policy.privacy-policy'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/privacy-policy`;

  return formatMetadata(data, pathname);
}
