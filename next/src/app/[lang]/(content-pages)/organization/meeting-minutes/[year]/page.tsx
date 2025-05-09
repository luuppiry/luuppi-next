import { getDictionary } from '@/dictionaries';
import { flipMeetingMinutesLocale } from '@/libs/strapi/flip-locale';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

interface MeetingMinutesYearProps {
  params: { year: string; lang: SupportedLanguage };
}

export default async function MeetingMinutesYear({ params }: MeetingMinutesYearProps) {
  const dictionary = await getDictionary(params.lang);

  const yearData = await getStrapiData<
    APIResponseCollection<'api::meeting-minutes-year.meeting-minutes-year'>
  >(
    params.lang,
    `/api/meeting-minutes-years?filters[year][$eq]=${params.year}&populate[meetingMinuteDocuments][populate][0]=image&populate[meetingMinuteDocuments][populate][1]=pdf&populate[meetingMinuteDocuments][populate][2]=localizations`,
    ['meeting-minutes-year', 'meeting-minute-document']
  );

  if (!yearData.data.length) {
    redirect(`/${params.lang}/404`);
  }

  const year = yearData.data[0];
  const documents = flipMeetingMinutesLocale(params.lang, year.attributes.meetingMinuteDocuments || []);

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.meeting_minutes} {params.year}</h1>
      <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={`/${params.lang}/organization/meeting-minutes/${params.year}/${doc.id}`}
            className="group relative flex cursor-pointer flex-col gap-4 hover:scale-105 transition-transform duration-300"
          >
            <div className="relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300">
              {doc.attributes.image?.data?.attributes.url && (
                <Image
                  alt={`Meeting minutes ${new Date(doc.attributes.meetingDate).toLocaleDateString(params.lang)}`}
                  className="h-full w-full rounded-lg object-cover"
                  src={getStrapiUrl(doc.attributes.image.data.attributes.url)}
                  fill
                />
              )}
            </div>
            <div className="absolute bottom-0 right-0 z-20 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
              {new Date(doc.attributes.meetingDate).toLocaleDateString(params.lang, {
                day: 'numeric',
                month: 'short',
              })}
            </div>
            <div className="absolute bottom-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black to-transparent opacity-25" />
            <div className="absolute -bottom-1.5 left-1.5 -z-10 h-full w-full transform rounded-lg bg-gray-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:rotate-1" />
            <div className="absolute -bottom-3 left-3 -z-20 h-full w-full transform rounded-lg bg-gray-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-2" />
          </a>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata({ params }: MeetingMinutesYearProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);
  const pathname = `/${params.lang}/organization/meeting-minutes/${params.year}`;

  return {
    title: `${dictionary.navigation.meeting_minutes} ${params.year} | Luuppi ry`,
    description: `${dictionary.pages_meeting_minutes_year.seo_description} ${params.year}`,
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title: `${dictionary.navigation.meeting_minutes} ${params.year}`,
      description: `${dictionary.pages_meeting_minutes_year.seo_description} ${params.year}`,
      url: pathname,
      siteName: 'Luuppi ry',
    },
    twitter: {
      title: `${dictionary.navigation.meeting_minutes} ${params.year}`,
      description: `${dictionary.pages_meeting_minutes_year.seo_description} ${params.year}`,
    },
  };
}

export async function generateStaticParams() {
  const yearsData = await getStrapiData<
    APIResponseCollection<'api::meeting-minutes-year.meeting-minutes-year'>
  >('fi', '/api/meeting-minutes-years', ['meeting-minutes-year']);

  return yearsData.data.map((year) => ({
    year: year.attributes.year.toString(),
  }));
}