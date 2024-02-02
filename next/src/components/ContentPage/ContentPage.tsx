import { getDictionary } from '@/dictionaries';
import getStrapiData from '@/lib/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import {
  ApiCompanyCompany,
  ApiOrganizationGeneralOrganizationGeneral,
} from '@/types/contentTypes';
import Image from 'next/image';
import BlockRendererClient from '../BlockRendererClient/BlockRendererClient';
import SideNavigator from '../SideNavigator/SideNavigator';
import SidePartners from '../SidePartners/SidePartners';

interface ContentPageProps {
  contentData: ApiOrganizationGeneralOrganizationGeneral;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default async function ContentPage({
  contentData,
  dictionary,
  lang,
}: ContentPageProps) {
  const partnersData = await getStrapiData<ApiCompanyCompany[]>(
    lang,
    '/api/companies?populate=*',
    ['company'],
  );

  const imagePath = contentData.attributes.Content.banner.data.attributes.url;
  const imageUrl = `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${imagePath}`;

  const timeOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  } as const;

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
              {contentData.attributes.Content.title}
            </h1>
          </div>
          <div className="flex flex-col opacity-40">
            <p className="text-sm">
              {dictionary.general.content_updated}:{' '}
              {new Date(contentData.attributes.updatedAt).toLocaleString(
                lang,
                timeOptions,
              )}
            </p>
          </div>
        </div>
        <article className="organization-page prose prose-base prose-custom max-w-full decoration-primary-400 transition-all duration-300 ease-in-out max-md:prose-base">
          <BlockRendererClient
            content={contentData.attributes.Content.content}
          />
        </article>
      </div>
      <div className="sticky top-36 h-full w-full max-w-80 max-lg:hidden">
        <SideNavigator
          dictionary={dictionary}
          targetClass="organization-page"
        />
        <SidePartners
          dictionary={dictionary}
          partnersData={partnersData.data}
        />
      </div>
    </div>
  );
}
