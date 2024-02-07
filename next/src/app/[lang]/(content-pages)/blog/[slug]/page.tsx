import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import SideNavigator from '@/components/SideNavigator/SideNavigator';
import SidePartners from '@/components/SidePartners/SidePartners';
import { getDictionary } from '@/dictionaries';
import { dateFormat, flipBlogLocale, getStrapiData } from '@/lib';
import { SupportedLanguage } from '@/models/locale';
import { ApiBlogBlog, ApiCompanyCompany } from '@/types/contentTypes';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const baseUrl =
  '/api/blogs?populate[0]=banner&populate[1]=authorImage&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations&filters[slug][$eq]=';

interface BlogPostProps {
  params: { slug: string; lang: SupportedLanguage };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiBlogBlog[]>(
    'fi',
    `${baseUrl}${params.slug}`,
    ['blog'],
  );

  const blogLocaleFlipped = flipBlogLocale(params.lang, pageData.data);

  const partnersData = await getStrapiData<ApiCompanyCompany[]>(
    params.lang,
    '/api/companies?populate=*',
    ['company'],
  );

  if (!pageData.data.length) {
    redirect(`/${params.lang}/404`);
  }

  const selectedBlog = blogLocaleFlipped[0];

  return (
    <div className="flex w-full gap-12">
      <div className="flex w-full flex-col gap-14">
        <div className="relative aspect-[2/1] w-full rounded-lg bg-gradient-to-r from-primary-400 to-primary-300">
          <Image
            alt="yes"
            className={'rounded-lg object-cover'}
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${selectedBlog.attributes.banner.data.attributes.url}`}
            fill
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {selectedBlog.attributes.authorImage.data?.attributes.url ? (
              <Image
                alt="avatar"
                className="rounded-full bg-gradient-to-r from-primary-400 to-primary-300"
                height={50}
                src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${selectedBlog.attributes.authorImage.data?.attributes.url}`}
                width={50}
              />
            ) : (
              <div className="h-[50px] w-[50px] rounded-full bg-gradient-to-r from-primary-400 to-primary-300" />
            )}
            <div className="flex flex-col">
              <span className="font-bold">
                {selectedBlog.attributes.authorName}{' '}
                <span className="font-normal">
                  | {selectedBlog.attributes?.authorTitle}
                </span>
              </span>
              <span className="text-sm opacity-75">
                {new Date(selectedBlog.attributes.createdAt).toLocaleString(
                  params.lang,
                  dateFormat,
                )}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold max-md:text-3xl">
              {selectedBlog.attributes.title}
            </h1>
          </div>
          <div className="flex flex-col opacity-40">
            <p className="text-sm">
              {dictionary.general.content_updated}:{' '}
              {new Date(selectedBlog.attributes.createdAt).toLocaleString(
                params.lang,
                dateFormat,
              )}
            </p>
          </div>
        </div>
        <article className="organization-page prose prose-custom max-w-full decoration-primary-400 transition-all duration-300 ease-in-out">
          <BlockRendererClient content={selectedBlog.attributes.content} />
        </article>
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

export async function generateStaticParams() {
  const pageData = await getStrapiData<ApiBlogBlog[]>(
    'fi',
    '/api/blogs?pagination[pageSize]=100',
    ['blog'],
  );

  return pageData.data.map((blog) => ({
    params: {
      slug: blog.attributes.slug,
    },
  }));
}
