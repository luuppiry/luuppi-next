import GalleryView from '@/app/[lang]/(gallery)/gallery/[...path]/gallery-view';
import ImageView from '@/app/[lang]/(gallery)/gallery/[...path]/image-view';
import {
  getAllGalleryPaths,
  getGalleryCover,
  resolveGalleryPath,
} from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lang as language } from 'next/root-params';
import { Suspense } from 'react';

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

/**
 * /gallery/a            -> gallery
 * /gallery/a/b/c        -> nested gallery (recursive hierarchy)
 * /gallery/a/b/<image>  -> image of gallery b
 */
export default function GalleryCatchAllPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="skeleton h-dvh w-full bg-white/5" />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Props) {
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
    openGraph: { images: image ? [getStrapiUrl(image.url)] : [] },
  };
}

export async function generateStaticParams() {
  return getAllGalleryPaths(await language());
}
