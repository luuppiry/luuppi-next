import { getDictionary } from '@/dictionaries';
import { dateFormat, getStrapiData, getStrapiUrl } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiCompanyCompany } from '@/types/contentTypes';
import Image from 'next/image';
import Link from 'next/link';
import BlockRendererClient from '../BlockRendererClient/BlockRendererClient';
import SideNavigator from '../SideNavigator/SideNavigator';
import SidePartners from '../SidePartners/SidePartners';

interface ContentPageProps {
  contentData: any;
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
  const imageUrl = getStrapiUrl(imagePath);

  return (
    <div className="flex w-full gap-12">
      <div className="flex w-full flex-col gap-12">
        <div className="relative h-64 rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 max-md:h-44">
          <Image
            alt="Page banner image"
            className="rounded-lg object-cover"
            src={imageUrl}
            fill
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1>{contentData.attributes.Content.title}</h1>
          <div className="flex flex-col opacity-40">
            <p className="text-sm">
              {dictionary.general.content_updated}:{' '}
              {new Date(contentData.attributes.updatedAt).toLocaleString(
                lang,
                dateFormat,
              )}
            </p>
          </div>
        </div>
        <article className="organization-page prose prose-custom max-w-full decoration-secondary-400 transition-all duration-300 ease-in-out">
          <BlockRendererClient
            content={contentData.attributes.Content.content}
          />
        </article>
        {contentData.attributes.ContactBanner && (
          <div className="luuppi-questions-bg flex flex-col items-center justify-center gap-4 rounded-xl bg-secondary-400 p-6 text-center text-white shadow-sm">
            <h2 className="text-2xl font-bold">
              {contentData.attributes.ContactBanner.title}
            </h2>
            <p className="max-w-md">
              {contentData.attributes.ContactBanner.description}
            </p>
            <Link
              className="link text-white"
              href={`mailto:${contentData.attributes.ContactBanner.email}`}
            >
              {contentData.attributes.ContactBanner.email}
            </Link>
          </div>
        )}
      </div>
      <div className="sticky top-36 h-full w-full max-w-80 max-lg:hidden">
        <div className="flex flex-col gap-4">
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
    </div>
  );
}
