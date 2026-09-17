import Banner from '@/components/Banner/Banner';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import NewsPreview from '@/components/NewsPreview/NewsPreview';
import Partners from '@/components/Partners/Partners';
import TelegramPreview from '@/components/TelegramPreview/TelegramPreview';
import { getDictionary } from '@/dictionaries';
import { getOrganizationJsonLd } from '@/libs/utils/json-ld';
import { StrapiCacheTag } from '@/types/types';
import { cacheLife, cacheTag } from 'next/cache';
import { lang as language } from 'next/root-params';
import Script from 'next/script';

export default async function Home() {
  'use cache';
  cacheLife('max');
  cacheTag(...(['event', 'news-single'] satisfies StrapiCacheTag[]));

  const lang = await language();
  const dictionary = await getDictionary();

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationJsonLd(dictionary)),
        }}
        id="organization-jsonld"
        type="application/ld+json"
      />
      <Banner lang={lang} />
      <Hero dictionary={dictionary} lang={lang} />
      <Discover dictionary={dictionary} lang={lang} />
      <EventsPreview dictionary={dictionary} lang={lang} />
      <NewsPreview dictionary={dictionary} lang={lang} />
      <TelegramPreview dictionary={dictionary} lang={lang} />
      <Partners dictionary={dictionary} lang={lang} />
    </>
  );
}
