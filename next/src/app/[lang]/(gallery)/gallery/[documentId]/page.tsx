import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import { getGallery } from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { lang as language } from 'next/root-params';
import { Suspense, ViewTransition } from 'react';

interface Props {
  params: Promise<{ documentId: string }>;
}

export default function GalleryPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <GalleryContent params={params} />
    </Suspense>
  );
}

async function GalleryContent({ params }: Props) {
  const { documentId } = await params;
  const lang = await language();
  const gallery = await getGallery(lang, documentId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1>{gallery.Title}</h1>
        <article className="prose prose-custom max-w-full">
          <BlockRendererClient content={gallery.Description} />
        </article>
      </div>

      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {gallery.Images.map((image, i) => (
          <li key={image.documentId} className="mb-4 break-inside-avoid">
            <Link
              className="block overflow-hidden rounded-lg bg-gradient-to-tr from-white/5 to-white/10"
              href={`/${lang}/gallery/${gallery.documentId}/${image.documentId}`}
              transitionTypes={['nav-forward']}
            >
              <ViewTransition
                default="none"
                name={`photo-${image.documentId}`}
                share="morph"
              >
                <Image
                  alt={image.alternativeText || `${gallery.Title} ${i + 1}`}
                  className="h-auto w-full transition-opacity hover:opacity-90"
                  height={image.height}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  src={getStrapiUrl(image.formats?.small?.url ?? image.url)}
                  width={image.width}
                />
              </ViewTransition>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documentId } = await params;
  const lang = await language();
  const gallery = await getGallery(lang, documentId);

  return {
    title: gallery.Title,
    openGraph: {
      images: gallery.Images[0] ? [getStrapiUrl(gallery.Images[0].url)] : [],
    },
  };
}
