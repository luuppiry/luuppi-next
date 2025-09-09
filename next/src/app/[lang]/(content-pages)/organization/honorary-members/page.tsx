import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';

const url =
  '/api/organization-honorary-member?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-honorary-member'];

interface OrganizationHonoraryMembersProps {
  params: Promise<{ lang: string }>;
}

export default async function OrganizationHonoraryMembers(
  props: OrganizationHonoraryMembersProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponse<'api::organization-honorary-member.organization-honorary-member'>
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
  props: OrganizationHonoraryMembersProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponse<'api::organization-honorary-member.organization-honorary-member'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/organization/honorary-members`;

  return formatMetadata(data, pathname);
}
