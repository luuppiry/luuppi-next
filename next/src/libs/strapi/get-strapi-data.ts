import { SupportedLanguage } from '@/models/locale';
import { StrapiCacheTag } from '@/types/types';
import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { logger } from '../utils/logger';
import { getStrapiUrl } from './get-strapi-url';

async function fetchStrapi(
  lang: string,
  url: string,
  status: 'draft' | 'published',
) {
  return fetch(
    getStrapiUrl(
      `${url}${url.includes('?') ? '&' : '?'}locale=${lang}&status=${status}`,
    ),
    {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
    },
  );
}

async function parseStrapiResponse<T>(
  res: Response,
  url: string,
  ignoreError?: boolean,
): Promise<T | null> {
  const data = await res.json();

  if (!data?.data) {
    if (ignoreError) return null;
    logger.error(`Failed to fetch data from ${url}`, data);
    throw new Error(`Failed to fetch data from ${url}`);
  }

  return data as T;
}

function logAndWrap(error: unknown, lang: string, url: string): never {
  logger.error('Error fetching data from Strapi', {
    error: error instanceof Error ? error.message : String(error),
    errorType: error?.constructor?.name,
    cause: error instanceof Error ? error.cause : undefined,
    stack: error instanceof Error ? error.stack : undefined,
    url: getStrapiUrl(`${url}${url.includes('?') ? '&' : '?'}locale=${lang}`),
    strapiBaseUrl: process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
    hasApiKey: !!process.env.STRAPI_API_KEY,
  });

  throw new Error(
    `Failed to fetch data from Strapi: ${error instanceof Error ? error.message : String(error)}`,
    { cause: error },
  );
}

async function getStrapiDataCached<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: StrapiCacheTag[] | readonly StrapiCacheTag[],
  ignoreError?: boolean,
): Promise<T | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(...revalidateTags);

  try {
    let res = await fetchStrapi(lang, url, 'published');

    if (!res.ok && res.status === 404 && !ignoreError) {
      res = await fetchStrapi('fi', url, 'published');
    }

    return await parseStrapiResponse<T>(res, url, ignoreError);
  } catch (error) {
    if (ignoreError) return null;
    return logAndWrap(error, lang, url);
  }
}

async function getStrapiDataDraft<T>(
  lang: SupportedLanguage,
  url: string,
  ignoreError?: boolean,
): Promise<T | null> {
  try {
    const res = await fetchStrapi(lang, url, 'draft');
    return await parseStrapiResponse<T>(res, url, ignoreError);
  } catch (error) {
    if (ignoreError) return null;
    return logAndWrap(error, lang, url);
  }
}

export function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: StrapiCacheTag[] | readonly StrapiCacheTag[],
  ignoreError: true,
  draftMode?: boolean,
): Promise<T | null>;

export function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: StrapiCacheTag[] | readonly StrapiCacheTag[],
  ignoreError?: false,
  draftMode?: boolean,
): Promise<T>;

export async function getStrapiData<T>(
  lang: SupportedLanguage,
  url: string,
  revalidateTags: StrapiCacheTag[] | readonly StrapiCacheTag[],
  ignoreError?: boolean,
  draftMode?: boolean,
): Promise<T | null> {
  if (draftMode) {
    return getStrapiDataDraft<T>(lang, url, ignoreError);
  }

  return getStrapiDataCached<T>(lang, url, revalidateTags, ignoreError);
}
