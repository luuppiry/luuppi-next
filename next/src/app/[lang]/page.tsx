import Banner from '@/components/Banner/Banner';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import NewsPreview from '@/components/NewsPreview/NewsPreview';
import Partners from '@/components/Partners/Partners';
import TelegramPreview from '@/components/TelegramPreview/TelegramPreview';
import { getDictionary } from '@/dictionaries';
import { getOrganizationJsonLd } from '@/libs/utils/json-ld';
import Script from 'next/script';

interface HomeProps {
  params: Promise<{ lang: string }>;
}

export default async function Home(props: HomeProps) {
  const params = await props.params;
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
      <TelegramPreview dictionary={dictionary} />
      <Partners dictionary={dictionary} lang={params.lang} />
    </>
  );
}
