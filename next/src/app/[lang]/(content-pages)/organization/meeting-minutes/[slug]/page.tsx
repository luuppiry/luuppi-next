import PdfViewer from '@/components/PdfViewer/PdfViewer';
import { getDictionary } from '@/dictionaries';
import { flipMeetingMinuteDocumentLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const baseUrl =
  '/api/meeting-minute-documents?populate[0]=image&populate[1]=pdf&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations&populate=localizations.Seo.twitter.twitterImage&populate=localizations.Seo.openGraph.openGraphImage&filters[id][$eq]=';

interface MeetingMinutesDocumentProps {
  params: Promise<{ slug: string; lang: SupportedLanguage }>;
}

export default async function MeetingMinutesDocument(
  props: MeetingMinutesDocumentProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', `${baseUrl}${params.slug}`, ['meeting-minute-document']);

  const meetingMinuteDocumentLocaleFlipped = flipMeetingMinuteDocumentLocale(params.lang, pageData.data);

  if (!pageData.data.length) {
    redirect(`/${params.lang}/404`);
  }

  const selectedDocument = meetingMinuteDocumentLocaleFlipped[0];

  return (
    <article className="relative flex flex-col gap-12">
      <h1>
        {dictionary.general.meeting_minute}{' '}
        {new Date(
          selectedDocument.attributes?.meetingDate ||
            selectedDocument.attributes.createdAt!,
        )
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
          pdfUrl={getStrapiUrl(
            selectedDocument.attributes.pdf?.data.attributes.url,
          )}
        />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </article>
  );
}

export async function generateMetadata(
  props: MeetingMinutesDocumentProps,
): Promise<Metadata> {
  const params = await props.params;
  const data = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', `${baseUrl}${params.slug}`, ['meeting-minute-document']);
  const meetingMinuteDocumentLocaleFlipped = flipMeetingMinuteDocumentLocale(params.lang, data.data);
  const selectedDocument = meetingMinuteDocumentLocaleFlipped[0];
  const pathname = `/${params.lang}/organization/meeting-minute-document/${params.slug}`;

  // No version of the content exists in the requested language
  if (!selectedDocument?.attributes?.Seo?.id) {
    return {};
  }

  return formatMetadata({ data: selectedDocument }, pathname);
}

export async function generateStaticParams() {
  const pageData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', '/api/meeting-minute-documents?pagination[pageSize]=100', ['meeting-minute-document']);

  return pageData.data.map((sanomat) => ({
    slug: sanomat.id.toString(),
  }));
}
