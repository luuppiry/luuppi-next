import Banner from '@/components/Banner/Banner';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import Partners from '@/components/Partners/Partners';

export default function Home() {
  return (
    <>
      <Banner />
      <Hero />
      <Discover />
      <EventsPreview />
      <Partners />
    </>
  );
}
