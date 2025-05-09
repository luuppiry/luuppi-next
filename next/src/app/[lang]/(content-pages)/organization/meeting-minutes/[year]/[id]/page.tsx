import PdfViewer from '@/components/PdfViewer/PdfViewer';
import { getDictionary } from '@/dictionaries';
import { flipMeetingMinutesLocale } from '@/libs/strapi/flip-locale';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface MeetingMinutesDocumentProps {
  params: { year: string; id: string; lang: SupportedLanguage };
}

export default async function MeetingMinutesDocument({ params }: MeetingMinutesDocumentProps) {
  const dictionary = await getDictionary(params.lang);

  const documentData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >(
    params.lang,
    `/api/meeting-minute-documents/${params.id}?populate[0]=image&populate[1]=pdf&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations`,
    ['meeting-minute-document']
  );

  if (!documentData.data) {
    redirect(`/${params.lang}/404`);
  }

  const document = flipMeetingMinutesLocale(params.lang, documentData.data)[0];

  return (
    <article className="relative flex flex-col gap-12">
      <h1>
        {dictionary.navigation.meeting_minutes} -{' '}
        {new Date(document.attributes.meetingDate).toLocaleDateString(params.lang, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </h1>
      <div className="h-full overflow-x-hidden">
        <PdfViewer
          dictionary={dictionary}
          pdfUrl={getStrapiUrl(document.attributes.pdf?.data?.attributes.url)}
        />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </article>
  );
}

export async function generateMetadata({ params }: MeetingMinutesDocumentProps): Promise<Metadata> {
  const documentData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >(
    params.lang,
    `/api/meeting-minute-documents/${params.id}?populate[0]=image&populate[1]=pdf&populate[2]=Seo.openGraph.openGraphImage&populate[3]=Seo.twitter.twitterImage&populate[4]=localizations`,
    ['meeting-minute-document']
  );

  const document = flipMeetingMinutesLocale(params.lang, [documentData.data])[0];
  const pathname = `/${params.lang}/organization/meeting-minutes/${params.year}/${params.id}`;

  if (!document?.attributes?.Seo?.id) {
    return {};
  }

  return formatMetadata({ data: document }, pathname);
}

export async function generateStaticParams() {
  const documentsData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', '/api/meeting-minute-documents?pagination[pageSize]=100', ['meeting-minute-document']);

  return documentsData.data.map((doc) => ({
    year: doc.attributes.year.toString(),
    id: doc.id.toString(),
  }));
}