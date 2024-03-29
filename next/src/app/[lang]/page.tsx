import Banner from '@/components/Banner/Banner';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import NewsPreview from '@/components/NewsPreview/NewsPreview';
import Partners from '@/components/Partners/Partners';
import TelegramPreview from '@/components/TelegramPreview/TelegramPreview';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';

interface HomeProps {
  params: { lang: SupportedLanguage };
}

export default async function Home({ params }: HomeProps) {
  const dictionary = await getDictionary(params.lang);
  return (
    <>
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
