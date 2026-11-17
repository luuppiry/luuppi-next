import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse, APIResponseCollection } from '@/types/types';
import { cacheLife } from 'next/cache';
import qs from 'qs';

const populate = qs.stringify({
  populate: {
    Images: {
      fields: [
        'documentId',
        'url',
        'width',
        'height',
        'alternativeText',
        'name',
        'formats',
      ],
    },
  },
});

export async function getGalleries(lang: string) {
  'use cache';
  cacheLife('max');

  const { data } = await getStrapiData<
    APIResponseCollection<'api::gallery.gallery'>
  >({
    lang,
    url: `/api/galleries?${populate}&sort=createdAt:desc&pagination[pageSize]=100`,
    collection: 'gallery',
  });

  return data;
}

export async function getGallery(lang: string, documentId: string) {
  'use cache';
  cacheLife('max');

  const { data } = await getStrapiData<APIResponse<'api::gallery.gallery'>>({
    lang,
    url: `/api/galleries/${documentId}?${populate}`,
    collection: 'gallery',
  });

  return data;
}
