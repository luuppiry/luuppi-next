import Banner from '@/components/Banner/Banner';
import BlogPreview from '@/components/BlogPreview/BlogPreview';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import Partners from '@/components/Partners/Partners';
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
      <BlogPreview dictionary={dictionary} lang={params.lang} />
      <Partners dictionary={dictionary} lang={params.lang} />
    </>
  );
}
