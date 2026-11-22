import GalleryView from '@/app/[lang]/(gallery)/gallery/[...path]/GalleryView';
import ImageView from '@/app/[lang]/(gallery)/gallery/[...path]/ImageView';
import {
  getAllGalleryPaths,
  getGalleryCover,
  resolveGalleryPath,
} from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lang as language } from 'next/root-params';

interface Props {
  params: Promise<{ path: string[] }>;
}

function safeDecode(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export const ensureStatic = 'navigation';
export const instant = false;

/**
 * /gallery/a            -> gallery
 * /gallery/a/b/c        -> nested gallery (recursive hierarchy)
 * /gallery/a/b/<image>  -> image of gallery b
 */
export default async function GalleryPage({ params }: Props) {
  const { path } = await params;
  const lang = await language();
  const resolved = await resolveGalleryPath(lang, path.map(safeDecode));

  if (!resolved) notFound();

  return resolved.type === 'image' ? (
    <ImageView lang={lang} resolved={resolved} />
  ) : (
    <GalleryView lang={lang} resolved={resolved} />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const lang = await language();
  const resolved = await resolveGalleryPath(lang, path.map(safeDecode));
  if (!resolved) return {};

  const { gallery } = resolved;
  const image =
    resolved.type === 'image'
      ? gallery.Images![resolved.imageIndex]
      : getGalleryCover(gallery);

  return {
    title: gallery.Title,
    openGraph: {
      images: image
        ? [getStrapiUrl(image.formats?.large.url ?? image.url)]
        : [],
    },
  };
}

export async function generateStaticParams() {
  return await getAllGalleryPaths(await language());
}
