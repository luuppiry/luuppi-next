import Banner from '@/components/Banner/Banner';
import Discover from '@/components/Discover/Discover';
import EventsPreview from '@/components/EventsPreview/EventsPreview';
import Hero from '@/components/Hero/Hero';
import NewsPreview from '@/components/NewsPreview/NewsPreview';
import Partners from '@/components/Partners/Partners';
import TelegramPreview from '@/components/TelegramPreview/TelegramPreview';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { EducationalOrganization, WithContext } from 'schema-dts';

interface HomeProps {
  params: { lang: SupportedLanguage };
}

export default async function Home({ params }: HomeProps) {
  const dictionary = await getDictionary(params.lang);

  const jsonLd: WithContext<EducationalOrganization> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Luuppi ry',
    description: dictionary.pages_home.hero.description,
    openingHours: 'Mo,Tu,We,Th 09:00-15:00',
    foundingDate: '1969-01-01',
    url: 'https://luuppi.fi',
    keywords: 'Luuppi, Luuppi ry, Tampere, Tampereen yliopisto, Ainejärjestö',
    logo: 'https://luuppi.fi/logo.png',
    address: {
      '@type': 'PostalAddress',
      postalCode: '33100',
      streetAddress: 'Yliopistonkatu 58b',
      addressCountry: 'FI',
      addressLocality: 'Tampere',
    },
    vatID: 'FI05123472',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: dictionary.navigation.board,
      email: 'hallitus@luuppi.fi',
      availableLanguage: ['Finnish', 'English'],
    },
    sameAs: [
      'https://www.facebook.com/luuppiry',
      'https://www.tiktok.com/@luuppiry',
      'https://www.instagram.com/luuppiry/',
      'https://www.linkedin.com/company/luuppi-ry',
      'https://fi.wikipedia.org/wiki/Luuppi_(ainej%C3%A4rjest%C3%B6)',
    ],
    hasMap:
      'https://www.google.com/maps/d/viewer?mid=1udxC-9jUfnpF5-bZyxiT3SlEcPMRnAh9',
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
