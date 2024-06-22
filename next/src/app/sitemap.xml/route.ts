import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { SitemapItemLoose, SitemapStream, streamToPromise } from 'sitemap';

/**
 * Get static pages for sitemap. There is no clean way
 * to get all static pages automatically, so this is something that
 * needs to be maintained manually. :(
 * @param lang "fi" or "en
 * @returns array of static pages
 */
const getStaticPages = (lang: SupportedLanguage) => {
  const staticPages = [
    // General
    `/${lang}`,

    // Organization
    `/${lang}/organization`,
    `/${lang}/organization/rules`,
    `/${lang}/organization/board`,
    `/${lang}/organization/office`,
    `/${lang}/organization/tradition-guidelines`,
    `/${lang}/organization/honorary-members`,
    `/${lang}/organization/benefits`,
    `/${lang}/organization/documents`,

    // Studies
    `/${lang}/studies`,
    `/${lang}/studies/workshops`,

    // Tutoring
    `/${lang}/tutoring`,
    `/${lang}/tutoring/larpake`,
    `/${lang}/tutoring/faq`,

    // Collaboration
    `/${lang}/collaboration`,
    `/${lang}/collaboration/companies`,

    // Events
    `/${lang}/events`,

    // News
    `/${lang}/news`,

    // Sanomat
    `/${lang}/luuppi-sanomat`,

    // Sports
    `/${lang}/sports`,

    // Contact
    `/${lang}/contact`,

    // Feedback
    `/${lang}/feedback`,

    // Privacy policy
    `/${lang}/privacy-policy`,
  ];

  return staticPages;
};

/**
 * TODO: This is a temporary solution for sitemap generation.
 * Nextjs not supporting languages on it's own sitemap.xml generation.
 * PR: https://github.com/vercel/next.js/pull/53765
 *
 * (There is nothing more permanent than a temporary solution :D)
 *
 * @returns sitemap.xml
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const fiStaticPages = getStaticPages('fi');
  const enStaticPages = getStaticPages('en');

  const staticEnglishSitemap: SitemapItemLoose[] = enStaticPages.map((url) => ({
    url: url,
    links: [
      { hreflang: 'fi', url: url.replace('/en/', '/fi/'), lang: 'fi' },
      { hreflang: 'en', url: url, lang: 'en' },
    ],
  }));

  const staticFinnishSitemap: SitemapItemLoose[] = fiStaticPages.map((url) => ({
    url: url,
    links: [
      { hreflang: 'fi', url: url, lang: 'fi' },
      { hreflang: 'en', url: url.replace('/fi/', '/en/'), lang: 'en' },
    ],
  }));

  const newsData = await getStrapiData<
    APIResponseCollection<'api::news-single.news-single'>
  >('fi', '/api/news', ['news-single']);
  const news = newsData.data.map((news) => ({
    url: `/fi/news/${news.attributes.slug}`,
    lastmod: new Date(news.attributes.updatedAt!).toISOString(),
  }));

  const boardData = await getStrapiData<
    APIResponseCollection<'api::board.board'>
  >('fi', '/api/boards', ['board']);

  const luuppiSanomatData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >('fi', '/api/luuppi-sanomats', ['luuppi-sanomat']);

  const url = '/api/events?pagination[limit]=9999&sort[0]=createdAt:desc';

  const eventsData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >('fi', url, ['event']);

  const eventPagesSiteMap: SitemapItemLoose[] = eventsData.data.map(
    (event) => ({
      url: `/fi/events/${event.id}`,
      links: [
        {
          hreflang: 'fi',
          url: `/fi/events/${event.id}`,
          lang: 'fi',
        },
        {
          hreflang: 'en',
          url: `/en/events/${event.id}`,
          lang: 'en',
        },
      ],
    }),
  );

  const eventPagesSiteMapEn: SitemapItemLoose[] = eventsData.data.map(
    (event) => ({
      url: `/en/events/${event.id}`,
      links: [
        {
          hreflang: 'en',
          url: `/en/events/${event.id}`,
          lang: 'en',
        },
        {
          hreflang: 'fi',
          url: `/fi/events/${event.id}`,
          lang: 'fi',
        },
      ],
    }),
  );

  const boardPages: SitemapItemLoose[] = boardData.data
    .sort((a, b) => b.attributes.year - a.attributes.year)
    .map((board) => ({
      url: `/fi/organization/board/${board.attributes.year}`,
      lastmod: new Date(board.attributes.updatedAt!).toISOString(),
      links: [
        {
          hreflang: 'fi',
          url: `/fi/organization/board/${board.attributes.year}`,
          lang: 'fi',
        },
        {
          hreflang: 'en',
          url: `/en/organization/board/${board.attributes.year}`,
          lang: 'en',
        },
      ],
    }))
    .slice(1);

  const sanomatPages: SitemapItemLoose[] = luuppiSanomatData.data.map(
    (sanomat) => ({
      url: `/fi/luuppi-sanomat/${sanomat.id}`,
      lastmod: new Date(sanomat.attributes.updatedAt!).toISOString(),
      links: [
        {
          hreflang: 'fi',
          url: `/fi/luuppi-sanomat/${sanomat.id}`,
          lang: 'fi',
        },
        {
          hreflang: 'en',
          url: `/en/luuppi-sanomat/${sanomat.id}`,
          lang: 'en',
        },
      ],
    }),
  );

  const newsSiteMap: SitemapItemLoose[] = news.map((post) => ({
    url: post.url,
    lastmod: post.lastmod,
    links: [
      { hreflang: 'fi', url: post.url, lang: 'fi' },
      { hreflang: 'en', url: post.url.replace('/fi/', '/en/'), lang: 'en' },
    ],
  }));

  const newsSiteMapEn: SitemapItemLoose[] = news.map((post) => ({
    url: post.url.replace('/fi/', '/en/'),
    lastmod: post.lastmod,
    links: [
      { hreflang: 'en', url: post.url.replace('/fi/', '/en/'), lang: 'en' },
      { hreflang: 'fi', url: post.url, lang: 'fi' },
    ],
  }));

  const boardPagesSiteMap: SitemapItemLoose[] = boardPages.map((page) => ({
    url: page.url,
    lastmod: page.lastmod,
    links: [
      { hreflang: 'fi', url: page.url, lang: 'fi' },
      { hreflang: 'en', url: page.url.replace('/fi/', '/en/'), lang: 'en' },
    ],
  }));

  const boardPagesSiteMapEn: SitemapItemLoose[] = boardPages.map((page) => ({
    url: page.url.replace('/fi/', '/en/'),
    lastmod: page.lastmod,
    links: [
      { hreflang: 'en', url: page.url.replace('/fi/', '/en/'), lang: 'en' },
      { hreflang: 'fi', url: page.url, lang: 'fi' },
    ],
  }));

  const sanomatPagesSiteMap: SitemapItemLoose[] = sanomatPages.map((page) => ({
    url: page.url,
    lastmod: page.lastmod,
    links: [
      { hreflang: 'fi', url: page.url, lang: 'fi' },
      { hreflang: 'en', url: page.url.replace('/fi/', '/en/'), lang: 'en' },
    ],
  }));

  const sanomatPagesSiteMapEn: SitemapItemLoose[] = sanomatPages.map(
    (page) => ({
      url: page.url.replace('/fi/', '/en/'),
      lastmod: page.lastmod,
      links: [
        { hreflang: 'en', url: page.url.replace('/fi/', '/en/'), lang: 'en' },
        { hreflang: 'fi', url: page.url, lang: 'fi' },
      ],
    }),
  );

  const sitemap: SitemapItemLoose[] = [
    ...newsSiteMap,
    ...boardPagesSiteMap,
    ...newsSiteMapEn,
    ...boardPagesSiteMapEn,
    ...staticFinnishSitemap,
    ...staticEnglishSitemap,
    ...eventPagesSiteMap,
    ...eventPagesSiteMapEn,
    ...sanomatPagesSiteMap,
    ...sanomatPagesSiteMapEn,
  ];

  const smStream = new SitemapStream({
    hostname: baseUrl,
  });

  sitemap.forEach((item) => {
    smStream.write(item);
  });

  smStream.end();

  const sitemapXml = (await streamToPromise(smStream)).toString();

  const res = new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  return res;
}
