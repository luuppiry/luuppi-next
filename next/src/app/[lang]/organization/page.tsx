import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import SideNavigator from '@/components/SideNavigator/SideNavigator';
import { SupportedLanguage } from '@/models/locale';
import { ApiOrganizationOrganization } from '@/types/contentTypes';
import Image from 'next/image';

const getOrganizationData = async (
  lang: SupportedLanguage,
): Promise<{ data: ApiOrganizationOrganization }> => {
  let res = await fetch(
    `${process.env.STRAPI_BASE_URL}/api/organization?populate=*&locale=${lang}`,
  );

  if (!res.ok && res.status === 404) {
    res = await fetch(
      `${process.env.STRAPI_BASE_URL}/api/organization?locale=fi`,
    );
  }

  const data = await res.json();
  return data;
};

const links = [
  {
    href: '/',
    title: 'Etusivu (linkki)',
  },
  {
    href: '/',
    title: 'Etusivu (linkki)',
  },
  {
    href: '/',
    title: 'Etusivu (linkki)',
  },
  {
    href: '/',
    title: 'Etusivu (linkki)',
  },
  {
    href: '/',
    title: 'Etusivu (linkki)',
  },
];

export default async function Organization({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
  const organizationData = await getOrganizationData(params.lang);
  return (
    <div className="flex w-full gap-6">
      <div className="flex w-full flex-col gap-14">
        <div className="relative h-64 max-md:h-44">
          <Image
            src="/images/blog.jpg"
            className="rounded-lg object-cover"
            fill
            alt="Blog"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="inline-block rounded-lg bg-primary-400 px-4 py-2 text-5xl font-extrabold text-white max-md:text-4xl">
              {organizationData.data.attributes.title}
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
        <article className="prose prose-lg max-md:prose-base prose-custom organization-page max-w-full decoration-primary-400 transition-all duration-300 ease-in-out">
          <BlockRendererClient
            content={organizationData.data.attributes.content}
          />
        </article>
      </div>
      <SideNavigator targetClass="organization-page" />
    </div>
  );
}
