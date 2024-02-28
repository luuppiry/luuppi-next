import { getDictionary } from '@/dictionaries';
import {
  dateFormat,
  flipNewsLocale,
  getStrapiData,
  getStrapiUrl,
} from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiNewsSingleNewsSingle } from '@/types/contentTypes';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserAlt } from 'react-icons/fa';

interface NewsPreviewProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default async function NewsPreview({
  dictionary,
  lang,
}: NewsPreviewProps) {
  const pageData = await getStrapiData<ApiNewsSingleNewsSingle[]>(
    'fi',
    '/api/news?populate[0]=banner&populate[1]=authorImage&populate[3]=localizations&pagination[pageSize]=100',
    ['news-single'],
  );

  const newsLocaleFlipped = flipNewsLocale(lang, pageData.data);

  const sortedNews = newsLocaleFlipped
    .sort(
      (a, b) =>
        new Date(b.attributes.createdAt).getTime() -
        new Date(a.attributes.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20">
      <p className="mb-1 text-xl font-bold max-md:text-base">
        {dictionary.pages_home.news.subtitle}
      </p>
      <h2 className="mb-8 text-4xl font-extrabold max-md:text-3xl">
        {dictionary.pages_home.news.title}
      </h2>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {sortedNews.map((news, i) => (
            <article
              key={i}
              className={`${i === 0 ? 'col-span-3 max-lg:col-span-1 max-lg:flex-col' : 'col-span-1 flex-col'} flex gap-4 rounded-lg border border-gray-200/50 shadow-sm`}
            >
              <div
                className={`${i !== 0 ? 'shrink-0 rounded-t-lg' : 'rounded-l-lg max-lg:shrink-0 max-lg:rounded-l-none max-lg:rounded-t-lg'} relative aspect-video w-full bg-gradient-to-r from-secondary-400 to-primary-300
                `}
              >
                <Image
                  alt="News banner"
                  className={`${i !== 0 ? 'rounded-t-lg' : 'rounded-l-lg max-lg:rounded-l-none max-lg:rounded-t-lg'} object-cover`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={getStrapiUrl(news.attributes.banner.data.attributes.url)}
                  fill
                />
              </div>
              <div className="flex h-full w-full flex-col justify-between gap-12 p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold uppercase text-accent-400">
                    {news.attributes.category}
                  </span>
                  <Link
                    className={`inline-block font-bold ${i === 0 ? 'text-2xl max-lg:text-xl' : 'text-xl'} hover:underline`}
                    href={`/${lang}/news/${news.attributes.slug}`}
                  >
                    {news.attributes.title}
                  </Link>
                  <p className="line-clamp-3 text-sm">
                    {news.attributes.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {news.attributes.authorImage.data?.attributes.url ? (
                    <Image
                      alt="News author avatar"
                      className="rounded-full bg-gradient-to-r from-secondary-400 to-primary-300"
                      height={50}
                      src={getStrapiUrl(
                        news.attributes.authorImage.data?.attributes.url,
                      )}
                      width={50}
                    />
                  ) : (
                    <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-r from-secondary-400 to-primary-300">
                      <FaUserAlt color="white" size={20} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {news.attributes.authorName}
                    </span>
                    <span className="text-sm opacity-60">
                      {new Date(news.attributes.createdAt).toLocaleDateString(
                        lang,
                        dateFormat,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            className="btn btn-primary text-lg font-bold text-white max-md:text-base"
            href={`/${lang}/news`}
          >
            {dictionary.pages_home.news.see_all}
          </Link>
        </div>
      </div>
    </section>
  );
}
