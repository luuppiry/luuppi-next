import { Dictionary, SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import RenderEvents from './RenderEvents/RenderEvents';

interface EventsPreviewProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function EventsPreview({
  dictionary,
  lang,
}: EventsPreviewProps) {
  return (
    <section className="relative bg-background-50/50">
      <div className="relative z-[10] mx-auto max-w-[1200px] px-4 py-20">
        <p className="mb-1 text-xl font-bold">
          {dictionary.pages_home.events_preview.subtitle}
        </p>
        <h2 className="mb-8 text-4xl font-extrabold max-md:text-3xl">
          {dictionary.pages_home.events_preview.title}
        </h2>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-6">
          <RenderEvents dictionary={dictionary} lang={lang} />
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            className="btn btn-primary z-10 px-4 py-2 text-lg max-md:text-base"
            href={`/${lang}/events`}
          >
            {dictionary.pages_home.events_preview.see_all}
          </Link>
        </div>
      </div>
      <div className="luuppi-kolmio-pattern absolute left-0 top-0 -z-0 h-full w-full" />
    </section>
  );
}
