import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-office-hervanta?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-office-hervanta'];

interface OrganizationOfficeHervantaProps {
  params: Promise<{ lang: string }>;
}

export default async function OrganizationOfficeHervanta(
  props: OrganizationOfficeHervantaProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponse<'api::organization-office-hervanta.organization-office-hervanta'>
  >(params.lang, url, tags);

  return (
    <ContentPage
      contentData={pageData.data}
      dictionary={dictionary}
      lang={params.lang}
    />
  );
}

export async function generateMetadata(
  props: OrganizationOfficeHervantaProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-office-hervanta.organization-office-hervanta'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/office-hervanta`;

  return formatMetadata(data, pathname);
}
