/* eslint-disable no-unused-vars */
import { SupportedLanguage } from '@/models/locale';
import 'server-only';
import { logger } from '../utils/logger';
import { getStrapiUrl } from './get-strapi-url';

// Define the function overloads
export function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: string[],
  ignoreError: true,
): Promise<T | null>;

export function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: string[],
  ignoreError?: false,
): Promise<T>;

export async function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: string[],
  ignoreError?: boolean,
): Promise<T | null> {
  try {
    let res = await fetch(
      getStrapiUrl(
        `${url}${url.includes('?') ? '&' : '?'}locale=${lang}&publicationState=${
          process.env.NEXT_PUBLIC_BASE_URL?.includes('beta.luuppi.fi') ||
          process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost')
            ? 'preview'
            : 'live'
        }`,
      ),
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
        },
        next: { tags: revalidateTags },
      },
    );

    /**
     * Strapi does not have any feature to fallback language? (or does it?)
     * This is a workaround to fetch data from default language if the current
     * language does not have any data.
     * TODO: Remove this when Strapi has an automatic fallback
     */
    if (!res.ok && res.status === 404 && !ignoreError) {
      res = await fetch(
        getStrapiUrl(`${url}${url.includes('?') ? '&' : '?'}locale=fi`),
        {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
          },
          next: { tags: revalidateTags },
        },
      );
    }

    const data = await res.json();

    if (!data?.data) {
      if (ignoreError) return null;
      logger.error(`Failed to fetch data from ${url}`, data);
      throw new Error(`Failed to fetch data from ${url}`);
    }

    return data as T;
  } catch (error) {
    if (ignoreError) return null;
    logger.error('Error fetching data from Strapi', error);
    throw new Error('Failed to fetch data from Strapi');
  }
}
