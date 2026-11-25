import GalleryCard from '@/app/[lang]/(gallery)/GalleryCard';
import { getDictionary } from '@/dictionaries';
import { galleryHref, getGalleries } from '@/libs/strapi/get-gallery';
import { lang as language } from 'next/root-params';

export default async function GalleryOverview() {
  const lang = await language();
  const dictionary = await getDictionary();
  const galleries = await getGalleries(lang);

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.gallery}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <GalleryCard
            key={gallery.documentId}
            dictionary={dictionary}
            gallery={gallery}
            href={galleryHref(lang, [gallery.Slug])}
          />
        ))}
      </div>
    </div>
  );
}
