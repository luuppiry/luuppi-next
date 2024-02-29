import ContentPage from '@/components/ContentPage/ContentPage';
import { getDictionary } from '@/dictionaries';
import { formatMetadata, getStrapiData } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationHonoraryMemberOrganizationHonoraryMember } from '@/types/contentTypes';
import { Metadata } from 'next';

const url =
  '/api/organization-honorary-member?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage';
const tags = ['organization-honorary-member'];

interface OrganizationHonoraryMembersProps {
  params: { lang: SupportedLanguage };
}

export default async function OrganizationHonoraryMembers({
  params,
}: OrganizationHonoraryMembersProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData =
    await getStrapiData<ApiOrganizationHonoraryMemberOrganizationHonoraryMember>(
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
}: OrganizationHonoraryMembersProps): Promise<Metadata> {
  const data =
    await getStrapiData<ApiOrganizationHonoraryMemberOrganizationHonoraryMember>(
      params.lang,
      url,
      tags,
    );

  const pathname = `/${params.lang}/organization/honorary-members`;

  return formatMetadata(data, pathname);
}
