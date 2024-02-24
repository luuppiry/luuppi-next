import { getLuuppiEvents, getStrapiData } from '@/libs';
import { SupportedLanguage } from '@/models/locale';
import { ApiBlogBlog, ApiBoardBoard } from '@/types/contentTypes';
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
    `/${lang}/organization/documents`,

    // Studies
    `/${lang}/studies`,
    `/${lang}/studies/fields-of-study`,
    `/${lang}/studies/workshops`,

    // Tutoring
    `/${lang}/tutoring`,
    `/${lang}/tutoring/larpake`,
    `/${lang}/tutoring/faq`,

    // Collaboration
    `/${lang}/collaboration`,
    `/${lang}/collaboration/companies`,
    `/${lang}/collaboration/benefits`,

    // Events
    `/${lang}/events`,

    // Blog
    `/${lang}/blog`,

    // Sports
    `/${lang}/sports`,

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

  const blogData = await getStrapiData<ApiBlogBlog[]>('fi', '/api/blogs', [
    'blog',
  ]);
  const blogPosts = blogData.data.map((blog) => ({
    url: `/fi/blog/${blog.attributes.slug}`,
    lastmod: new Date(blog.attributes.updatedAt).toISOString(),
  }));

  const boardData = await getStrapiData<ApiBoardBoard[]>('fi', '/api/boards', [
    'board',
  ]);

  const eventsData = await getLuuppiEvents('fi');

  const eventPagesSiteMap: SitemapItemLoose[] = eventsData
    .filter((e) => e.start)
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .map((event) => ({
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
    }));

  const eventPagesSiteMapEn: SitemapItemLoose[] = eventsData
    .filter((e) => e.start)
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .map((event) => ({
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
    }));

  const boardPages: SitemapItemLoose[] = boardData.data
    .sort((a, b) => b.attributes.year - a.attributes.year)
    .map((board) => ({
      url: `/fi/organization/board/${board.attributes.year}`,
      lastmod: new Date(board.attributes.updatedAt).toISOString(),
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

  const blogPostsSiteMap: SitemapItemLoose[] = blogPosts.map((post) => ({
    url: post.url,
    lastmod: post.lastmod,
    links: [
      { hreflang: 'fi', url: post.url, lang: 'fi' },
      { hreflang: 'en', url: post.url.replace('/fi/', '/en/'), lang: 'en' },
    ],
  }));

  const blogPostsSiteMapEn: SitemapItemLoose[] = blogPosts.map((post) => ({
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

  const sitemap: SitemapItemLoose[] = [
    ...blogPostsSiteMap,
    ...boardPagesSiteMap,
    ...blogPostsSiteMapEn,
    ...boardPagesSiteMapEn,
    ...staticFinnishSitemap,
    ...staticEnglishSitemap,
    ...eventPagesSiteMap,
    ...eventPagesSiteMapEn,
  ];

  const smStream = new SitemapStream({
    hostname: baseUrl,
  });

  sitemap.forEach((item) => {
    smStream.write(item);
  });

  smStream.end();

  const sitemapXml = (await streamToPromise(smStream)).toString();

  // Thanks to this comment:
  // https://github.com/ekalinin/sitemap.js/issues/397#issuecomment-1438062056
  const sitemapXmlHttps = sitemapXml.replace(
    new RegExp('http://', 'g'),
    'https://',
  );

  const res = new Response(sitemapXmlHttps, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  return res;
}
