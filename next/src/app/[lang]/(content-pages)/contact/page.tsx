import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/contact?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=ContactBanner';
const tags = ['contact'];

interface ContactProps {
  params: { lang: SupportedLanguage };
}

export default async function Contact({ params }: ContactProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<APIResponse<'api::contact.contact'>>(
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
}: ContactProps): Promise<Metadata> {
  const data = await getStrapiData<APIResponse<'api::contact.contact'>>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/contact`;

  return formatMetadata(data, pathname);
}
