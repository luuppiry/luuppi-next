import { flipBlogLocale } from '@/lib/flip-locale';
import getStrapiData from '@/lib/get-strapi-data';
import { dateFormat } from '@/lib/time-utils';
import { SupportedLanguage } from '@/models/locale';
import { ApiBlogBlog } from '@/types/contentTypes';
import Image from 'next/image';
import Link from 'next/link';

interface BlogProps {
  params: { lang: SupportedLanguage };
}

export default async function Blog({ params }: BlogProps) {
  const pageData = await getStrapiData<ApiBlogBlog[]>(
    'fi',
    '/api/blogs?populate[0]=banner&populate[1]=authorImage&populate[3]=localizations&pagination[pageSize]=100',
    ['blog'],
  );

  const blogLocaleFlipped = flipBlogLocale(params.lang, pageData.data);

  const sortedBlogs = blogLocaleFlipped.sort(
    (a, b) =>
      new Date(b.attributes.createdAt).getTime() -
      new Date(a.attributes.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-12">
      <h1>Blog</h1>
      <div className="flex flex-col gap-12 max-md:gap-6">
        {sortedBlogs.map((blog) => (
          <article
            key={blog.attributes.title}
            className={
              'flex gap-4 rounded-lg border-[1px] border-gray-200/50 shadow-sm max-sm:flex-col'
            }
          >
            <div
              className={`relative aspect-video w-full rounded-l-lg bg-gradient-to-r from-primary-400 to-primary-300 max-lg:rounded-l-none max-lg:rounded-t-lg
                      `}
            >
              <Image
                alt="yes"
                className={'rounded-t-lg object-cover'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${blog.attributes.banner.data.attributes.url}`}
                fill
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-6 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold uppercase text-accent-400">
                  {blog.attributes.category}
                </span>
                <Link
                  className={
                    'inline-block text-2xl font-bold hover:underline max-lg:text-xl'
                  }
                  href={`/${params.lang}/blog/${blog.attributes.slug}`}
                >
                  {blog.attributes.title}
                </Link>
                <p className="line-clamp-4">{blog.attributes.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {blog.attributes.authorImage.data?.attributes.url ? (
                  <Image
                    alt="avatar"
                    className="rounded-full bg-gradient-to-r from-primary-400 to-primary-300"
                    height={50}
                    src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${blog.attributes.authorImage.data?.attributes.url}`}
                    width={50}
                  />
                ) : (
                  <div className="h-[50px] w-[50px] rounded-full bg-gradient-to-r from-primary-400 to-primary-300" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {blog.attributes.authorName}
                  </span>
                  <span className="text-sm opacity-60">
                    {new Date(blog.attributes.createdAt).toLocaleDateString(
                      params.lang,
                      dateFormat,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
