import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import 'server-only';
import { getStrapiUrl } from './get-strapi-url';

/**
 * Fetch data from Strapi and revalidate it with given tags.
 * @param lang 'en' or 'fi'
 * @param url API endpoint URL
 * @param revalidateTags Tags for revalidation
 * @returns Data from Strapi
 */
export const getStrapiData = async <T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: string[],
): Promise<T> => {
  try {
    let res = await fetch(getStrapiUrl(`${url}&locale=${lang}`), {
      next: { tags: revalidateTags },
    });

    /**
     * Strapi does not have any feature to fallback language? (or does it?)
     * This is a workaround to fetch data from default language if the current
     * language does not have any data.
     * TODO: Remove this when Strapi has an automatic fallback
     */
    if (!res.ok && res.status === 404) {
      res = await fetch(getStrapiUrl(`${url}?locale=fi`), {
        next: { tags: revalidateTags },
      });
    }

    const data = await res.json();

    if (!data?.data) {
      logger.error(`Failed to fetch data from ${url}`, data);
      throw new Error(`Failed to fetch data from ${url}`);
    }

    return data;
  } catch (error) {
    logger.error('Error fetching data from Strapi', error);
    throw new Error('Failed to fetch data from Strapi');
  }
};
