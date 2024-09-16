import { Dictionary, SupportedLanguage } from '@/models/locale';
import { APIResponse, APIResponseData } from '@/types/types';
import {
  EducationalOrganization,
  Event as EventSchema,
  NewsArticle,
  WithContext,
} from 'schema-dts';
import { getPlainText } from '../strapi/blocks-converter';
import { getStrapiUrl } from '../strapi/get-strapi-url';

export const getOrganizationJsonLd = (dictionary: Dictionary) => {
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
      'https://www.linkedin.com/company/luuppi-ry',
    ],
    hasMap:
      'https://www.google.com/maps/d/viewer?mid=1udxC-9jUfnpF5-bZyxiT3SlEcPMRnAh9',
  };

  return jsonLd;
};

export const getEventJsonLd = (
  event: APIResponse<'api::event.event'>,
  lang: SupportedLanguage,
) => {
  const description = getPlainText(
    event.data.attributes[lang === 'en' ? 'DescriptionEn' : 'DescriptionFi'],
  ).slice(0, 300);

  const jsonLd: WithContext<EventSchema> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.data.attributes[lang === 'en' ? 'NameEn' : 'NameFi'],
    url: `https://luuppi.fi/${lang}/events/${event.data.id}`,
    startDate: new Date(event.data.attributes.StartDate).toISOString(),
    endDate: new Date(event.data.attributes.EndDate).toISOString(),
    description: description.slice(0, 300),
    image: event.data.attributes.Image?.data?.attributes?.url
      ? getStrapiUrl(event.data.attributes.Image?.data.attributes.url)
      : undefined,
    location: {
      '@type': 'Place',
      name: event.data.attributes[lang === 'en' ? 'LocationEn' : 'LocationFi'],
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    offers: event.data.attributes.Registration?.TicketTypes.map((ticket) => ({
      '@type': 'Offer',
      name: lang === 'en' ? ticket.NameEn : ticket.NameFi,
      price: ticket.Price,
      priceCurrency: 'EUR',
      url: `https://luuppi.fi/${lang}/events/${event.data.id}`,
      validFrom: new Date(event.data.attributes.StartDate).toISOString(),
      seller: {
        '@type': 'Organization',
        name: 'Luuppi ry',
        url: 'https://luuppi.fi',
      },
    })),
    organizer: {
      '@type': 'Organization',
      name: 'Luuppi ry',
      url: 'https://luuppi.fi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://luuppi.fi/logo.png',
      },
    },
    inLanguage: {
      '@type': 'Language',
      name: lang === 'en' ? 'English' : 'Finnish',
      alternateName: lang === 'en' ? 'en' : 'fi',
    },
  };

  return jsonLd;
};

export const getNewsJsonLd = (
  news: APIResponseData<'api::news-single.news-single'>,
  lang: SupportedLanguage,
) => {
  // eslint-disable-next-line no-console
  const jsonLd: WithContext<NewsArticle> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.attributes.title,
    description: news.attributes.description,
    image: news.attributes.banner?.data?.attributes?.url
      ? getStrapiUrl(news.attributes.banner.data.attributes.url)
      : undefined,
    datePublished: new Date(news.attributes.createdAt!).toISOString(),
    dateModified: new Date(news.attributes.updatedAt!).toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'Luuppi ry',
      logo: {
        '@type': 'ImageObject',
        url: 'https://luuppi.fi/logo.png',
      },
    },
    author: {
      '@type': 'Person',
      name: news.attributes.authorName,
      image: news.attributes.authorImage?.data?.attributes?.url
        ? getStrapiUrl(news.attributes.authorImage.data.attributes.url)
        : undefined,
    },
    inLanguage: {
      '@type': 'Language',
      name: lang === 'en' ? 'English' : 'Finnish',
      alternateName: lang === 'en' ? 'en' : 'fi',
    },
  };

  return jsonLd;
};
