import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { Suspense } from 'react';
import PartnersSkeleton from './PartnersSkeleton/PartnersSkeleton';
import RenderPartners from './RenderPartners/RenderPartners';

interface PartnersProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function Partners({ dictionary, lang }: PartnersProps) {
  return (
    <section className="relative overflow-hidden bg-background-50/50 px-4 py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-extrabold max-md:text-3xl">
            {dictionary.pages_home.partners.title}
          </h2>
          <p className="max-w-2xl text-lg transition-all duration-300 max-md:text-base">
            {dictionary.pages_home.partners.description}
          </p>
          <div className="flex">
            <Link
              className="btn btn-primary text-lg font-bold text-white max-md:text-base"
              href={`/${lang}/collaboration`}
            >
              {dictionary.pages_home.partners.read_more}
            </Link>
          </div>
        </div>
        <Suspense fallback={<PartnersSkeleton />}>
          <RenderPartners lang={lang} />
        </Suspense>
      </div>
      <div className="luuppi-patners-pattern absolute left-0 top-0 -z-10 h-full w-full" />
    </section>
  );
}
