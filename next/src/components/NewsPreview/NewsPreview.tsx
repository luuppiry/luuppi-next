import { Dictionary, SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import RenderNews from './RenderNews/RenderNews';

interface NewsPreviewProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function NewsPreview({ dictionary, lang }: NewsPreviewProps) {
  return (
    <section className="relative mx-auto max-w-[1200px] px-4 py-20">
      <p className="mb-1 text-xl font-bold max-md:text-base">
        {dictionary.pages_home.news.subtitle}
      </p>
      <h2 className="mb-8 text-4xl font-extrabold max-md:text-3xl">
        {dictionary.pages_home.news.title}
      </h2>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <RenderNews dictionary={dictionary} lang={lang} />
        </div>
        <div className="flex justify-center">
          <Link
            className="btn btn-primary text-lg font-bold max-md:text-base"
            href={`/${lang}/news`}
          >
            {dictionary.pages_home.news.see_all}
          </Link>
        </div>
      </div>
      <div className="luuppi-pattern max-md:.test absolute -left-40 top-0 -z-50 h-[801px] w-[901px] max-md:right-0 max-md:top-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </section>
  );
}
