import PdfViewer from '@/components/PdfViewer/PdfViewer';
import { getDictionary } from '@/dictionaries';
import { flipMeetingMinuteLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const baseUrl =
  '/api/meeting-minute-documents?populate[0]=image&populate[1]=pdf&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations&populate=localizations.Seo.twitter.twitterImage&populate=localizations.Seo.openGraph.openGraphImage&filters[documentId][$eq]=';

interface LuuppiSanomatProps {
  params: Promise<{ slug: string; lang: string }>;
}

export default async function LuuppiSanomatPublication(
  props: LuuppiSanomatProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', `${baseUrl}${params.slug}`, ['meeting-minute-document']);

  const meetingMinuteLocaleFlipped = flipMeetingMinuteLocale(
    params.lang,
    pageData.data,
  );

  if (!pageData.data.length) {
    redirect(`/${params.lang}/404`);
  }

  const selectedPublication = meetingMinuteLocaleFlipped[0];

  return (
    <article className="relative flex flex-col gap-12">
      <h1>
        {dictionary.general.meeting_minute}{' '}
        {new Date(selectedPublication?.meetingDate)
          .toLocaleDateString(params.lang, {
            day: 'numeric',
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
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', `${baseUrl}${params.slug}`, ['meeting-minute-document']);
  const meetingMinuteLocaleFlipped = flipMeetingMinuteLocale(
    params.lang,
    data.data,
  );
  const selectedPublication = meetingMinuteLocaleFlipped[0];
  const pathname = `/${params.lang}/organization/meeting-minutes/${params.slug}`;

  // No version of the content exists in the requested language
  if (!selectedPublication?.Seo?.id) {
    return {};
  }

  return formatMetadata({ data: selectedPublication }, pathname);
}

export async function generateStaticParams() {
  const pageData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', '/api/meeting-minute-documents?pagination[pageSize]=100', [
    'meeting-minute-document',
  ]);

  return pageData.data.map((meetingMinuteDocument) => ({
    slug: meetingMinuteDocument.documentId.toString(),
  }));
}
