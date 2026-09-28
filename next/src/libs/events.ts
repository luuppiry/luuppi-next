import { getPlainText } from '@/libs/strapi/blocks-converter';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';

type Event = APIResponseCollection<'api::event.event'>['data'][number];

export const EVENT_POPULATE =
  'populate=Image&populate=ImageEn&populate=Registration.TicketTypes.Role&populate=VisibleOnlyForRoles';

export const getEventImageUrl = (event: Event, lang: SupportedLanguage) => {
  const localized =
    lang === 'en' && event.ImageEn?.url ? event.ImageEn.url : event.Image?.url;
  return localized ? getStrapiUrl(localized) : null;
};

const getLocalized = <K extends 'Name' | 'Location' | 'Description'>(
  event: Event,
  key: K,
  lang: SupportedLanguage,
) => event[`${key}${lang === 'en' ? 'En' : 'Fi'}` as `${K}En` | `${K}Fi`];

export function buildEventMetadata(
  event: Event,
  lang: SupportedLanguage,
  basePath: string,
  slug: string,
  opts: { noIndex?: boolean } = {},
): Metadata {
  const pathname = `/${lang}/${basePath}/${slug}`;
  const plain = getPlainText(getLocalized(event, 'Description', lang));
  const description = plain.slice(0, 300) + (plain.length > 300 ? '...' : '');
  const title = getLocalized(event, 'Name', lang);
  const images = getEventImageUrl(event, lang) ?? undefined;

  return {
    ...(opts.noIndex && { robots: { index: false } }),
    title: `${title} | Luuppi ry`,
    description,
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName: 'Luuppi ry',
      images,
    },
    twitter: { title, description, card: 'summary_large_image', images },
  };
}
