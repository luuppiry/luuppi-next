import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import SideNavigator from '@/components/SideNavigator/SideNavigator';
import { getDictionary } from '@/dictionaries';
import formatMetadata from '@/lib/format-metadata';
import getStrapiData from '@/lib/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationGeneralOrganizationGeneral } from '@/types/contentTypes';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';

export default async function Organization({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
  const dictionary = await getDictionary(params.lang);

  const organizationData =
    await getStrapiData<ApiOrganizationGeneralOrganizationGeneral>(
      params.lang,
      '/api/organization-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage',
    );

  const imagePath =
    organizationData.data.attributes.Content.banner.data.attributes.url;
  const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${imagePath}`;

  return (
    <div className="flex w-full gap-12">
      <div className="flex w-full flex-col gap-14">
        <div className="relative h-64 max-md:h-44">
          <Image
            alt="Blog"
            className="rounded-lg object-cover"
            src={imageUrl}
            fill
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="inline-block rounded-lg bg-primary-400 px-4 py-2 text-4xl font-extrabold text-white max-md:text-3xl">
              {organizationData.data.attributes.Content.title}
            </h1>
          </div>
          <div className="flex flex-col opacity-40">
            <p className="text-sm">
              {dictionary.general.content_updated}:{' '}
              {new Date(
                organizationData.data.attributes.updatedAt,
              ).toLocaleString()}
            </p>
          </div>
        </div>
        <article className="organization-page prose prose-base prose-custom max-w-full decoration-primary-400 transition-all duration-300 ease-in-out max-md:prose-base">
          <BlockRendererClient
            content={organizationData.data.attributes.Content.content}
          />
        </article>
      </div>
      <SideNavigator dictionary={dictionary} targetClass="organization-page" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { lang: SupportedLanguage };
}): Promise<Metadata> {
  const data = await getStrapiData<ApiOrganizationGeneralOrganizationGeneral>(
    params.lang,
    '/api/organization-general?populate[0]=Content.banner&populate[1]=Seo.twitter.twitterImage&populate[2]=Seo.openGraph.openGraphImage',
  );

  const pathname = headers().get('x-pathname') as string;

  return formatMetadata(data, pathname);
}
