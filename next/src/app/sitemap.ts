import getStrapiData from '@/lib/get-strapi-data';
import { ApiBlogBlog, ApiBoardBoard } from '@/types/contentTypes';
import { MetadataRoute } from 'next';

// TODO: Waiting for this to be addressed: https://github.com/vercel/next.js/pull/53765

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const staticPages = [
    // General
    `${baseUrl}/fi`,

    // Organization
    `${baseUrl}/fi/organization`,
    `${baseUrl}/fi/organization/rules`,
    `${baseUrl}/fi/organization/board`,
    `${baseUrl}/fi/organization/office`,
    `${baseUrl}/fi/organization/tradition-guidelines`,
    `${baseUrl}/fi/organization/honorary-members`,
    `${baseUrl}/fi/organization/documents`,

    // Studies
    `${baseUrl}/fi/studies`,
    `${baseUrl}/fi/studies/fields-of-study`,
    `${baseUrl}/fi/studies/workshops`,

    // Tutoring
    `${baseUrl}/fi/tutoring`,
    `${baseUrl}/fi/tutoring/larpake`,
    `${baseUrl}/fi/tutoring/faq`,

    // Events
    `${baseUrl}/fi/events`,

    // Blog
    `${baseUrl}/fi/blog`,

    // Sports
    `${baseUrl}/fi/sports`,
  ];

  const staticSitemap = staticPages.map((url) => ({
    url,
  }));

  const blogData = await getStrapiData<ApiBlogBlog[]>('fi', '/api/blogs', [
    'blog',
  ]);
  const blogPosts = blogData.data.map((blog) => ({
    url: `${baseUrl}/fi/blog/${blog.attributes.slug}`,
    lastModified: new Date(blog.attributes.updatedAt).toISOString(),
  }));

  const boardData = await getStrapiData<ApiBoardBoard[]>('fi', '/api/boards', [
    'board',
  ]);

  const boardPages = boardData.data
    .sort((a, b) => b.attributes.year - a.attributes.year)
    .map((board) => ({
      url: `${baseUrl}/fi/organization/board/${board.attributes.year}`,
      lastModified: new Date(board.attributes.updatedAt).toISOString(),
    }))
    .slice(1);

  return [...staticSitemap, ...blogPosts, ...boardPages];
}
