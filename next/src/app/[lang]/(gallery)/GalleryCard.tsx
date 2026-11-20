import {
  Gallery,
  galleryImageHref,
  getGalleryCover,
} from '@/libs/strapi/get-gallery';
import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';
import { PiFolder, PiImageBroken } from 'react-icons/pi';

interface Props {
  gallery: Gallery;
  href: string;
  dictionary: Dictionary;
}

/** Works for galleries with images, with only a cover, or with only a title. */
export default function GalleryCard({ gallery, href, dictionary }: Props) {
  const cover = getGalleryCover(gallery);
  const imageCount = gallery.imageCount;
  const childCount = gallery.children.length;

  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-lg"
      href={href}
    >
      <div className="relative aspect-[4/3] w-full bg-gradient-to-r from-secondary-400 to-primary-300">
        {cover ? (
          <Image
            alt=""
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder={cover.blurDataUrl as `data:image/${string}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={galleryImageHref(cover)}
            fill
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {childCount > 0 ? (
              <PiFolder aria-hidden="true" className="text-8xl text-white" />
            ) : (
              <PiImageBroken
                aria-hidden="true"
                className="text-8xl text-white"
              />
            )}
          </div>
        )}

        <div className="absolute bottom-0 flex h-full w-full flex-col justify-end gap-1 bg-gradient-to-t from-black via-black/70 p-4">
          <h2 className="text-xl font-bold group-hover:underline">
            {gallery.Title}
          </h2>
          {(imageCount > 0 || childCount > 0) && (
            <span className="flex items-center gap-3 text-sm opacity-60">
              {childCount > 0 && (
                <span className="flex items-center gap-1">
                  <PiFolder aria-hidden="true" /> {childCount}
                </span>
              )}
              {imageCount > 0 && (
                <span>
                  {imageCount} {dictionary.pages_gallery.images}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
