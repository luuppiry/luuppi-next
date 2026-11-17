import { getDictionary } from '@/dictionaries';
import { getGalleries } from '@/libs/strapi/get-gallery';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import Image from 'next/image';
import Link from 'next/link';
import { lang as language } from 'next/root-params';
import { PiImageBroken } from 'react-icons/pi';

export default async function GalleryOverview() {
  const lang = await language();
  const dictionary = await getDictionary();
  const galleries = await getGalleries(lang);

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.gallery}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => {
          const cover = gallery.Images?.[0];
          return (
            <Link
              key={gallery.documentId}
              className="group flex flex-col overflow-hidden rounded-lg"
              href={`/${lang}/gallery/${gallery.documentId}`}
            >
              <div className="relative aspect-[4/3] w-full bg-gradient-to-r from-secondary-400 to-primary-300">
                {cover ? (
                  <Image
                    alt={cover.alternativeText || gallery.Title}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={getStrapiUrl(cover.url)}
                    fill
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PiImageBroken className="text-8xl text-white" />
                  </div>
                )}

                <div className="absolute bottom-0 flex h-full w-full flex-col justify-end gap-1 bg-gradient-to-t from-black via-black/70 p-4">
                  <h2 className="text-xl font-bold group-hover:underline">
                    {gallery.Title}
                  </h2>
                  <span className="text-sm opacity-60">
                    {gallery.Images?.length ?? 0}{' '}
                    {dictionary.pages_gallery.images}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
