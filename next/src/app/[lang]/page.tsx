import Banner from '@/components/Banner/Banner';
import BlogPreview from '@/components/BlogPreview/BlogPreview';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import Partners from '@/components/Partners/Partners';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';

export default async function Home({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
  const dictionary = await getDictionary(params.lang);
  return (
    <>
      <Banner />
      <Hero dictionary={dictionary.pages_home.hero} />
      <Discover dictionary={dictionary.pages_home.discover} />
      <EventsPreview dictionary={dictionary.pages_home.events_preview} />
      <BlogPreview />
      <Partners />
    </>
  );
}
