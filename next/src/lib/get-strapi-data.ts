import { Colors } from '@/models/colors';
import { SupportedLanguage } from '@/models/locale';
import { getStrapiUrl } from './get-url';

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
): Promise<{ data: T }> => {
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
      logConsoleError('no_data', data);
      throw new Error(`Failed to fetch data from ${url}`);
    }

    return data;
  } catch (error) {
    logConsoleError('fetch_failed', error);
    throw new Error('Failed to fetch data from Strapi');
  }
};

function logConsoleError(type: 'fetch_failed' | 'no_data', error: any) {
  console.error(
    `${Colors.FgRed}Error fetching data from Strapi. This is not necessarily a frontend error. Frontend requires running Strapi instance with valid data to operate. Code: ${type}, Error: ${error}${Colors.Reset}`,
  );
}
