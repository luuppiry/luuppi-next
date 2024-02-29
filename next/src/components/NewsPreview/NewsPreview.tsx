import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import RenderNews from './RenderNews/RenderNews';

interface NewsPreviewProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function NewsPreview({ dictionary, lang }: NewsPreviewProps) {
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
          <RenderNews lang={lang} />
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
