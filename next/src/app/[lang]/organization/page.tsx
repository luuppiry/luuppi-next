import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import SideNavigator from '@/components/SideNavigator/SideNavigator';
import getStrapiData from '@/lib/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationGeneralOrganizationGeneral } from '@/types/contentTypes';
import Image from 'next/image';

export default async function Organization({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
  const organizationData =
    await getStrapiData<ApiOrganizationGeneralOrganizationGeneral>(
      params.lang,
      '/api/organization-general?populate=*',
    );

  const imagePath =
    organizationData.data.attributes.Banner.data[0].attributes.url;
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
            <h1 className="inline-block rounded-lg bg-primary-400 px-4 py-2 text-5xl font-extrabold text-white max-md:text-4xl">
              {organizationData.data.attributes.Title}
            </h1>
          </div>
          <div className="flex flex-col opacity-40">
            <p className="text-sm">
              Sisältö luotu:{' '}
              {new Date(
                organizationData.data.attributes.createdAt,
              ).toLocaleString()}
            </p>
            <p className="text-sm">
              Sisältö päivitetty:{' '}
              {new Date(
                organizationData.data.attributes.updatedAt,
              ).toLocaleString()}
            </p>
          </div>
        </div>
        <article className="organization-page prose prose-lg prose-custom max-w-full decoration-primary-400 transition-all duration-300 ease-in-out max-md:prose-base">
          <BlockRendererClient
            content={organizationData.data.attributes.Content}
          />
        </article>
      </div>
      <SideNavigator targetClass="organization-page" />
    </div>
  );
}
