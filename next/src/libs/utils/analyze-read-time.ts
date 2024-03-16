import { APIResponseData } from '@/types/types';

/**
 * Analyze read time of a news article based on its content
 * @param news - The news article to analyze
 * @returns The estimated read time in minutes
 */
export const analyzeReadTime = (
  news: APIResponseData<'api::news-single.news-single'>,
) => {
  const content = news.attributes.content
    .map((c) => c.children.map((c) => (c.type === 'text' ? c.text : '')))
    .join(' ');
  const words = content.split(' ').length;
  const readTime = Math.ceil(words / 200);
  return readTime < 1 ? 1 : readTime;
};
