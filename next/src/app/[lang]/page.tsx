import Banner from '@/components/Banner/Banner';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import NewsPreview from '@/components/NewsPreview/NewsPreview';
import Partners from '@/components/Partners/Partners';
import TelegramPreview from '@/components/TelegramPreview/TelegramPreview';
import { getDictionary } from '@/dictionaries';
import { validLanguage } from '@/libs/i18n';
import { getOrganizationJsonLd } from '@/libs/utils/json-ld';
import { SupportedLanguage } from '@/models/locale';
import { StrapiCacheTag } from '@/types/types';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

interface HomeProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Home(props: HomeProps) {
  'use cache';
  cacheLife('max');
  cacheTag(...(['event', 'news-single'] satisfies StrapiCacheTag[]));

  return (
    <Suspense fallback={null}>
      <LocalizedHome params={props.params} />
    </Suspense>
  );
}

async function LocalizedHome(props: HomeProps) {
  const params = await props.params;
  if (!validLanguage(params.lang)) {
    notFound();
  }

  const dictionary = await getDictionary(params.lang);

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationJsonLd(dictionary)),
        }}
        id="organization-jsonld"
        type="application/ld+json"
      />
      <Banner lang={params.lang} />
      <Hero dictionary={dictionary} lang={params.lang} />
      <Discover dictionary={dictionary} lang={params.lang} />
      <EventsPreview dictionary={dictionary} lang={params.lang} />
      <NewsPreview dictionary={dictionary} lang={params.lang} />
      <TelegramPreview dictionary={dictionary} lang={params.lang} />
      <Partners dictionary={dictionary} lang={params.lang} />
    </>
  );
}
