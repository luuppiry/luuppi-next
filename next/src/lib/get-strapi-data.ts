import { Colors } from '@/models/colors';
import { SupportedLanguage } from '@/models/locale';

export default async function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: string[],
  revalidateTime?: number,
): Promise<{ data: T }> {
  try {
    let res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${url}&locale=${lang}`,
      { next: { tags: revalidateTags, revalidate: revalidateTime } },
    );

    /**
     * Strapi does not have any feature to fallback language? (or does it?)
     * This is a workaround to fetch data from default language if the current
     * language does not have any data.
     * TODO: Remove this when Strapi has an automatic fallback
     */
    if (!res.ok && res.status === 404) {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${url}?locale=fi`,
        { next: { tags: revalidateTags, revalidate: revalidateTime } },
      );
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
}

function logConsoleError(type: 'fetch_failed' | 'no_data', error: any) {
  console.error(
    `${Colors.FgRed}Error fetching data from Strapi. This is not necessarily a frontend error. Frontend requires running Strapi instance with valid data to operate. Code: ${type}, Error: ${error}${Colors.Reset}`,
  );
}
