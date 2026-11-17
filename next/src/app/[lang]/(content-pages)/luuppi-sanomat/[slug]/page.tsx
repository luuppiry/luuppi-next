import PdfViewer from '@/components/PdfViewer';
import { getDictionary } from '@/dictionaries';
import { toCalendarDate } from '@/libs/constants';
import { flipSanomatLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { lang as language } from 'next/root-params';
import qs from 'qs';

interface LuuppiSanomatProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

const buildQuery = (slug: string) => {
  const startOfDay = `${slug}T00:00:00.000Z`;
  const endOfDay = `${slug}T23:59:59.999Z`;

  return qs.stringify({
    populate: [
      'image',
      'pdf',
      'Seo.openGraph.openGraphImage',
      'Seo.twitter.twitterImage',
      'localizations',
      'localizations.Seo.twitter.twitterImage',
      'localizations.Seo.openGraph.openGraphImage',
    ],
    filters: {
      $or: [
        { firstPublishedAt: { $gte: startOfDay, $lte: endOfDay } },
        // Fallback for older entries, can be removed if every publication has `firstPublishedAt`
        {
          firstPublishedAt: { $null: true },
          publishedAt: { $gte: startOfDay, $lte: endOfDay },
        },
      ],
    },
    pagination: { limit: 1 },
    sort: ['firstPublishedAt:asc'],
  });
};

export default async function LuuppiSanomatPublication(
  props: LuuppiSanomatProps,
) {
  const lang = await language();
  const params = await props.params;
  const dictionary = await getDictionary();

  // If two entries are published within same date this blows up (sorry)
  const pageData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >({
    lang: 'fi',
    url: `/api/luuppi-sanomats?${buildQuery(params.slug)}`,
    collection: 'luuppi-sanomat',
    ignoreError: true,
    unique: true,
  });

  if (!pageData?.data.length) {
    redirect(`/${lang}/404`);
  }

  const sanomatLocaleFlipped = flipSanomatLocale(lang, pageData.data);

  const selectedPublication = sanomatLocaleFlipped[0];

  return (
    <article className="relative flex flex-col gap-12">
      <h1>
        {dictionary.general.publication}{' '}
        {new Date(
          selectedPublication.firstPublishedAt ||
            selectedPublication?.publishedAt ||
            selectedPublication.createdAt!,
        )
          .toLocaleDateString(lang, {
            month: 'short',
            year: 'numeric',
          })
          .toLowerCase()}
      </h1>
      <div className="h-full overflow-x-hidden">
        <PdfViewer
          dictionary={dictionary}
          pdfUrl={getStrapiUrl(selectedPublication.pdf?.url)}
        />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </article>
  );
}

export async function generateMetadata(
  props: LuuppiSanomatProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >({
    lang: 'fi',
    url: `/api/luuppi-sanomats?${buildQuery(params.slug)}`,
    collection: 'luuppi-sanomat',
    unique: true,
  });
  const lang = await language();
  const sanomatLocaleFlipped = flipSanomatLocale(lang, data.data);
  const selectedPublication = sanomatLocaleFlipped[0];
  const pathname = `/${lang}/luuppi-sanomat/${params.slug}`;

  // No version of the content exists in the requested language
  if (!selectedPublication?.Seo?.id) {
    return {};
  }

  return formatMetadata({ data: selectedPublication }, pathname);
}

export async function generateStaticParams() {
  const pageData = await getStrapiData<
    APIResponseCollection<'api::luuppi-sanomat.luuppi-sanomat'>
  >({
    lang: 'fi',
    url: '/api/luuppi-sanomats?pagination[pageSize]=500',
    collection: 'luuppi-sanomat',
  });

  return pageData.data.map((sanomat) => ({
    slug: toCalendarDate(sanomat.firstPublishedAt || sanomat.publishedAt!),
  }));
}
