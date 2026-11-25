import { SupportedLanguage } from '@/models/locale';
import { StrapiCacheTag } from '@/types/types';
import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { logger } from '../utils/logger';
import { getStrapiUrl } from './get-strapi-url';
import { connection } from 'next/server';
import { unstable_rethrow } from 'next/navigation';

const log = logger.child('lib:strapi/get-strapi-data');

// Expire below 300 so not founds and errors are not included in the prerender shell
const NEGATIVE_TTL = { stale: 30, revalidate: 30, expire: 240 } as const;

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
    log.error(`Failed to fetch data from ${url}`, data);
    throw new Error(`Failed to fetch data from ${url}`);
  }

  return data as T;
}

function logAndWrap(error: unknown, lang: string, url: string): never {
  log.error('Error fetching data from Strapi', {
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

interface StrapiBody {
  data?: { documentId?: string } | { documentId?: string }[] | null;
}

export type StrapiTag = StrapiCacheTag | `${StrapiCacheTag}:${string}`;

export function strapiTag(
  collection: StrapiCacheTag,
  documentId?: string,
): StrapiTag {
  return documentId ? `${collection}:${documentId}` : collection;
}

function inferTags(
  collection: StrapiCacheTag,
  unique: boolean,
  body: unknown,
): StrapiTag[] {
  const data = (body as StrapiBody | null)?.data;

  // GET /api/events/:documentId -> object
  if (data && !Array.isArray(data) && data.documentId) {
    return [strapiTag(collection, data.documentId)];
  }

  // Slug lookup (caller guarantees the filter is unique) -> [entry]
  if (
    unique &&
    Array.isArray(data) &&
    data.length === 1 &&
    data[0].documentId
  ) {
    return [strapiTag(collection, data[0].documentId)];
  }

  // Lists, or "not found" results that a future entry should invalidate
  return [collection];
}

async function handleError(
  error: unknown,
  lang: string,
  url: string,
  ignoreError?: boolean,
  { dynamicOnIgnore = false }: { dynamicOnIgnore?: boolean } = {},
): Promise<null> {
  // Lets Next.js signals through untouched
  unstable_rethrow(error);
  if (ignoreError) {
    if (dynamicOnIgnore) await connection();
    return null;
  }
  return logAndWrap(error, lang, url);
}

function isEmptyBody(body: unknown): boolean {
  const data = (body as StrapiBody | null)?.data;
  return data == null || (Array.isArray(data) && data.length === 0);
}

async function getStrapiDataCached<T>(
  lang: SupportedLanguage,
  url: string,
  collection: StrapiCacheTag,
  overrideTags: StrapiTag[] | null,
  unique: boolean,
  ignoreError?: boolean,
): Promise<T | null> {
  'use cache';
  if (overrideTags) cacheTag(...overrideTags);

  let res = await fetchStrapi(lang, url, 'published');

  if (res.status === 404 && !ignoreError) {
    res = await fetchStrapi('fi', url, 'published');
  }

  // 5xx / auth failures are transient: throw so nothing is cached
  if (!res.ok && res.status !== 404) {
    throw new Error(`Strapi responded ${res.status} for ${url}`);
  }

  const body = await parseStrapiResponse<T>(res, url, ignoreError);

  const negative = !res.ok || isEmptyBody(body);
  if (!overrideTags) cacheTag(...inferTags(collection, unique, body));
  else if (negative) cacheTag(collection);

  if (negative) cacheLife(NEGATIVE_TTL);
  else cacheLife('hours');

  return body;
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
    return handleError(error, lang, url, ignoreError);
  }
}

interface StrapiDataOptions {
  lang: SupportedLanguage;
  url: string;
  /** Collection this request belongs to. `null` = don't cache. */
  collection: StrapiCacheTag | null;
  /** The URL filters on a unique field (slug, documentId); tag by the single entry found. */
  unique?: boolean;
  /** Replaces inference entirely. Use when tags are known before the fetch. */
  overrideTags?: readonly StrapiTag[];
  draftMode?: boolean;
}

export function getStrapiData<T>(
  opts: StrapiDataOptions & { ignoreError: true },
): Promise<T | null>;
export function getStrapiData<T>(
  opts: StrapiDataOptions & { ignoreError?: false },
): Promise<T>;
export async function getStrapiData<T>({
  lang,
  url,
  collection,
  unique = false,
  overrideTags,
  ignoreError,
  draftMode,
}: StrapiDataOptions & { ignoreError?: boolean }): Promise<T | null> {
  if (draftMode) return getStrapiDataDraft<T>(lang, url, ignoreError);

  if (collection === null) {
    try {
      const res = await fetchStrapi(lang, url, 'published');
      return await parseStrapiResponse<T>(res, url, ignoreError);
    } catch (error) {
      return handleError(error, lang, url, ignoreError, {
        dynamicOnIgnore: true,
      });
    }
  }

  try {
    return await getStrapiDataCached<T>(
      lang,
      url,
      collection,
      overrideTags?.length ? [...new Set(overrideTags)] : null,
      unique,
      ignoreError,
    );
  } catch (error) {
    return handleError(error, lang, url, ignoreError, {
      dynamicOnIgnore: true,
    });
  }
}
