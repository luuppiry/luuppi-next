import GalleryCard from '@/app/[lang]/(gallery)/gallery-card';
import BlockRendererClient from '@/components/BlockRendererClient/BlockRendererClient';
import { getDictionary } from '@/dictionaries';
import { galleryHref, ResolvedPath } from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';

interface Props {
  lang: string;
  resolved: Extract<ResolvedPath, { type: 'gallery' }>;
}

export default async function GalleryView({ lang, resolved }: Props) {
  const dictionary = await getDictionary();
  const { gallery, chain } = resolved;
  const slugs = chain.map((g) => g.Slug);
  const children = gallery.Children ?? [];
  const images = gallery.Images ?? [];

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Breadcrumb" className="text-sm opacity-70">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link className="link" href={galleryHref(lang, [])}>
              {dictionary.navigation.gallery}
            </Link>
          </li>
          {chain.slice(0, -1).map((g, i) => (
            <li key={g.documentId} className="flex gap-2">
              <span aria-hidden="true">/</span>
              <Link
                className="link"
                href={galleryHref(lang, slugs.slice(0, i + 1))}
              >
                {g.Title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-4">
        <h1>{gallery.Title}</h1>
        {gallery.Description && (
          <article className="prose prose-custom max-w-full">
            <BlockRendererClient content={gallery.Description} />
          </article>
        )}
      </div>

      {children.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <GalleryCard
              key={child.documentId}
              dictionary={dictionary}
              gallery={child}
              href={galleryHref(lang, [...slugs, child.Slug])}
            />
          ))}
        </div>
      )}

      {images.length > 0 && (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((image, i) => (
            <li key={image.documentId} className="mb-4 break-inside-avoid">
              <Link
                className="block overflow-hidden rounded-lg bg-gradient-to-tr from-white/5 to-white/10"
                href={`${galleryHref(lang, slugs)}/${image.documentId}`}
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
                    src={getStrapiUrl(image.url)}
                    width={image.width}
                  />
                </ViewTransition>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
