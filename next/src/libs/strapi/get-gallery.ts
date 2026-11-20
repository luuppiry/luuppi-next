import { SupportedLanguage } from '@/models/locale';
import {
  APIResponse,
  APIResponseCollectionMetadata,
  APIResponseData,
} from '@/types/types';
import qs from 'qs';
import 'server-only';
import { getStrapiData } from './get-strapi-data';
import { cacheLife, cacheTag } from 'next/cache';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';

const DEFAULT_LOCALE: SupportedLanguage = 'fi';
const PAGE_SIZE = 9999;

export interface GalleryMedia {
  url: string;
  alternativeText?: string | null;
  blurDataUrl?: string;
}

/** Shape of a list item for the `fields`/`populate` used in listQuery. */
interface GalleryListItem {
  documentId: string;
  Title: string;
  Slug: string;
  Order: number | null;
  Date: string | null;
  Parent: { documentId: string } | null;
  Cover: GalleryMedia | null;
  Images: GalleryMedia[] | null;
}

interface GalleryListResponse {
  data: GalleryListItem[];
  meta: APIResponseCollectionMetadata;
}

/** Lightweight gallery used in trees, cards and breadcrumbs. */
export interface GalleryNode {
  documentId: string;
  Title: string;
  Slug: string;
  Order: number;
  Date: string | null;
  Cover: GalleryMedia | null;
  imageCount: number;
  parentId: string | null;
  children: GalleryNode[];
}

/** Alias for components that import `Gallery` (e.g. GalleryCard). */
export type Gallery = GalleryNode;

export interface GalleryTree {
  roots: GalleryNode[];
  nodes: Map<string, GalleryNode>;
}

export type GalleryEntity = APIResponseData<'api::gallery.gallery'>;

/** Full gallery entity with `Children` filled in from the tree. */
export type GalleryWithChildren = Omit<GalleryEntity, 'Children'> & {
  Children: GalleryNode[];
};

interface ResolvedBase {
  gallery: GalleryWithChildren;
  /** Root -> ... -> this gallery (includes the gallery itself) */
  chain: GalleryNode[];
}

export type ResolvedPath =
  | ({ type: 'gallery' } & ResolvedBase)
  | ({ type: 'image'; imageIndex: number } & ResolvedBase);

export function galleryHref(lang: string, slugs: string[]): string {
  const path = slugs.map(encodeURIComponent).join('/');
  return path ? `/${lang}/gallery/${path}` : `/${lang}/gallery`;
}

export function galleryImageHref<T extends { url: string; formats?: any }>(
  image: T,
) {
  return getStrapiUrl(image.formats?.large?.url ?? image.url);
}

function listQuery(page: number) {
  return qs.stringify({
    fields: ['Title', 'Slug', 'Order', 'Date'],
    populate: {
      Parent: { fields: ['documentId'] },
      Cover: { fields: ['url', 'alternativeText', 'formats', 'blurDataUrl'] },
      Images: {
        fields: ['url', 'alternativeText', 'formats', 'blurDataUrl', 'exif'],
      },
    },
    sort: ['Order:asc', 'Title:asc'],
    pagination: { page, pageSize: PAGE_SIZE },
  });
}

/** Fetches every gallery in one locale, following pagination. */
async function fetchAllGalleries(
  lang: SupportedLanguage,
): Promise<GalleryListItem[]> {
  'use cache';
  cacheLife('max');
  cacheTag('gallery');

  const fetchPage = (page: number) =>
    getStrapiData<GalleryListResponse>({
      lang,
      url: `/api/galleries?${listQuery(page)}`,
      collection: 'gallery',
    });

  const first = await fetchPage(1);
  const { pageCount } = first.meta.pagination;
  if (pageCount <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, i) => fetchPage(i + 2)),
  );
  return [first, ...rest].flatMap((r) => r.data);
}

/**
 * Builds the full gallery tree for a locale.
 *
 * Structure (parent, slug, order, cover) always comes from the default
 * locale, so the tree is identical in every language. Translated titles are
 * overlaid from `lang` where they exist. Relies on Slug and Parent being
 * non-localized.
 */
export async function getGalleryTree(
  lang: SupportedLanguage,
): Promise<GalleryTree> {
  const [base, localized] = await Promise.all([
    fetchAllGalleries(DEFAULT_LOCALE),
    lang === DEFAULT_LOCALE
      ? Promise.resolve<GalleryListItem[]>([])
      : fetchAllGalleries(lang),
  ]);

  const titles = new Map(localized.map((g) => [g.documentId, g.Title]));

  const nodes = new Map<string, GalleryNode>();
  for (const g of base) {
    nodes.set(g.documentId, {
      documentId: g.documentId,
      Title: titles.get(g.documentId) ?? g.Title,
      Slug: g.Slug,
      Order: g.Order ?? 0,
      Date: g.Date ?? null,
      Cover: g.Cover ?? g.Images?.[0] ?? null,
      imageCount: g.Images?.length ?? 0,
      parentId: g.Parent?.documentId ?? null,
      children: [],
    });
  }

  const roots: GalleryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    (parent ? parent.children : roots).push(node);
  }

  // Overlaid titles may have changed the alphabetical order
  const compare = (a: GalleryNode, b: GalleryNode) =>
    a.Order - b.Order || a.Title.localeCompare(b.Title, lang);
  roots.sort(compare);
  for (const node of nodes.values()) node.children.sort(compare);

  return { roots, nodes };
}

/** Top-level galleries, for the overview page. */
export async function getGalleries(
  lang: SupportedLanguage,
): Promise<GalleryNode[]> {
  return (await getGalleryTree(lang)).roots;
}

/** Ancestors from the root down to (and including) the node. */
function getGalleryAncestors(
  node: GalleryNode,
  nodes: Map<string, GalleryNode>,
): GalleryNode[] {
  const chain: GalleryNode[] = [];
  const seen = new Set<string>();
  let current: GalleryNode | undefined = node;

  while (current && !seen.has(current.documentId)) {
    seen.add(current.documentId);
    chain.unshift(current);
    current = current.parentId ? nodes.get(current.parentId) : undefined;
  }
  return chain;
}

async function getGallery(
  lang: SupportedLanguage,
  documentId: string,
): Promise<GalleryEntity> {
  'use cache';
  cacheLife('days');
  cacheTag('gallery', `gallery:${documentId}`);

  const query = qs.stringify({
    populate: { Images: true, Cover: true },
  });

  // Deliberately not ignoreError: getStrapiData only falls back to `fi` on a
  // 404 when ignoreError is off, which we want for untranslated galleries.
  const res = await getStrapiData<APIResponse<'api::gallery.gallery'>>({
    lang,
    url: `/api/galleries/${documentId}?${query}`,
    collection: 'gallery',
    unique: true,
  });

  return res.data;
}

export function getGalleryCover(gallery: {
  Cover?: GalleryMedia | null;
  Images?: GalleryMedia[] | null;
}): GalleryMedia | null {
  return gallery.Cover ?? gallery.Images?.[0] ?? null;
}

/**
 * /gallery/a            -> gallery
 * /gallery/a/b/c        -> nested gallery
 * /gallery/a/b/<image>  -> image of gallery b
 *
 * Child slugs take priority over image ids if they ever collide.
 */
export async function resolveGalleryPath(
  lang: SupportedLanguage,
  path: string[],
): Promise<ResolvedPath | null> {
  if (path.length === 0) return null;

  const tree = await getGalleryTree(lang);

  let level = tree.roots;
  let node: GalleryNode | null = null;
  let matched = 0;

  for (const segment of path) {
    const next = level.find((n) => n.Slug === segment);
    if (!next) break;
    node = next;
    level = next.children;
    matched++;
  }

  if (!node) return null;

  const isImagePath = matched === path.length - 1;
  if (matched !== path.length && !isImagePath) return null;

  const entity = await getGallery(lang, node.documentId);
  const base: ResolvedBase = {
    gallery: { ...entity, Children: node.children },
    chain: getGalleryAncestors(node, tree.nodes),
  };

  if (!isImagePath) return { type: 'gallery', ...base };

  const imageId = path[path.length - 1];
  const imageIndex =
    base.gallery.Images?.findIndex((image) => image.documentId === imageId) ??
    -1;
  if (imageIndex < 0) return null;

  return { type: 'image', imageIndex, ...base };
}

/** Slug paths of every gallery reachable from a root. */
export async function getAllGalleryPaths(lang: SupportedLanguage) {
  const { roots } = await getGalleryTree(lang);
  const result: { path: string[] }[] = [];

  const walk = (list: GalleryNode[], prefix: string[]): Promise<void>[] =>
    list.flatMap((node) => {
      const path = [...prefix, node.Slug];
      result.push({ path });
      return [
        getGallery(lang, node.documentId).then((g) => {
          for (const img of g.Images ?? [])
            result.push({ path: [...path, img.documentId] });
        }),
        ...walk(node.children, path),
      ];
    });

  await Promise.all(walk(roots, []));
  return result;
}
