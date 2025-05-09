import { getDictionary } from '@/dictionaries';
import { flipMeetingMinutesYearLocale } from '@/libs/strapi/flip-locale';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { groupMeetingMinutesByYear } from '@/libs/strapi/group-meeting-minutes-by-year';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface MeetingMinutesYearProps {
  params: { 
    lang: SupportedLanguage;
    slug?: string;
  };
}

export default async function MeetingMinutesYear({ params }: MeetingMinutesYearProps) {
  const dictionary = await getDictionary(params.lang);

  const meetingMinutesYearData = await getStrapiData<
    APIResponseCollection<'api::meeting-minutes-year.meeting-minutes-year'>
  >(
    'fi',
    '/api/meeting-minutes-years?populate[meetingMinuteDocuments][populate]=localizations&populate[meetingMinuteDocuments][populate]=image',
    ['meeting-minutes-year', 'meeting-minute-document'],
  );

  const meetingMinutesGroupedByYear = groupMeetingMinutesByYear(meetingMinutesYearData.data);
  const meetingMinutesSortedByYear = Object.keys(meetingMinutesGroupedByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  // Get the selected year from slug or use the latest year
  const selectedYear = params.slug || meetingMinutesSortedByYear[0];
  const selectedMeetingMinutesYear = meetingMinutesGroupedByYear[selectedYear];

  if (!selectedMeetingMinutesYear) {
    redirect(`/${params.lang}/404`);
  }

  const otherMeetingMinuteYears = meetingMinutesSortedByYear.filter(
    (year) => year !== selectedYear,
  );

  const meetingMinuteDocuments = flipMeetingMinutesYearLocale(params.lang, selectedMeetingMinutesYear);

  return (
    <>
      <div className="relative flex flex-col gap-12">
        <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <h1>
            {dictionary.navigation.meeting_minutes} {selectedYear}
          </h1>
          {Boolean(otherMeetingMinuteYears.length) && (
            <div className="dropdown sm:dropdown-end">
              <div className="btn m-1" role="button" tabIndex={0}>
                {dictionary.pages_meeting_minutes_year.other_meeting_minutes_years}
              </div>
              <ul
                className="menu dropdown-content z-[9999] grid w-80 grid-cols-4 gap-2 rounded-box bg-base-100 p-2 shadow"
                tabIndex={0}
              >
                {otherMeetingMinuteYears.map((year) => (
                  <li key={year}>
                    <Link href={`/${params.lang}/organization/meeting-minutes/${year}`}>
                      {year}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
            {Boolean(meetingMinuteDocuments.length) && (
              <>
                <h2 className="mb-6 text-3xl font-bold max-md:text-2xl">
                  {dictionary.pages_meeting_minutes_year.meeting_minutes_documents}
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-y-12 lg:grid-cols-4">
                  {meetingMinuteDocuments.map((publication: any) => (
                    <a
                      key={publication.id}
                      className="group relative flex cursor-pointer flex-col gap-4 transition-transform duration-300 hover:scale-105"
                      href={`/${params.lang}/organization/meeting-minute-document/${publication.id}`}
                    >
                      {publication.attributes.image?.data.attributes.url && (
                        <div
                          className={
                            'relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300'
                          }
                        >
                          <Image
                            alt={`${dictionary.navigation.meeting_minutes} cover`}
                            className="h-full w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                            src={getStrapiUrl(
                              publication.attributes.image?.data.attributes.url,
                            )}
                            fill
                          />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 z-20 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
                        {firstLetterToUpperCase(
                          new Date(
                            publication.attributes.meetingDate,
                          ).toLocaleDateString(params.lang, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }),
                        )}
                      </div>
                      <div className="absolute bottom-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black to-transparent opacity-25" />
                      <div className="absolute -bottom-1.5 left-1.5 -z-10 h-full w-full transform rounded-lg bg-gray-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:rotate-1" />
                      <div className="absolute -bottom-3 left-3 -z-20 h-full w-full transform rounded-lg bg-gray-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-2" />
                    </a>
                  ))}
                </div>
              </>
            )}
        </div>
        <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: MeetingMinutesYearProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);

  const meetingMinutesYearData = await getStrapiData<
    APIResponseCollection<'api::meeting-minutes-year.meeting-minutes-year'>
  >(
    'fi',
    '/api/meeting-minutes-years?populate[meetingMinuteDocuments][populate]=localizations&populate[meetingMinuteDocuments][populate]=image',
    ['meeting-minutes-year', 'meeting-minute-document'],
  );

  const meetingMinutesGroupedByYear = groupMeetingMinutesByYear(meetingMinutesYearData.data);
  const meetingMinutesSortedByYear = Object.keys(meetingMinutesGroupedByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  const selectedYear = params.slug || meetingMinutesSortedByYear[0];
  const pathname = `/${params.lang}/organization/meeting-minutes${params.slug ? `/${params.slug}` : ''}`;

  return {
    title: `${dictionary.navigation.meeting_minutes} ${selectedYear} | Luuppi ry`,
    description: `${dictionary.pages_meeting_minutes_year.seo_description} ${selectedYear}`,
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title: `${dictionary.navigation.meeting_minutes} ${selectedYear}`,
      description: `${dictionary.pages_meeting_minutes_year.seo_description} ${selectedYear}`,
      url: pathname,
      siteName: 'Luuppi ry',
    },
    twitter: {
      title: `${dictionary.navigation.meeting_minutes} ${selectedYear}`,
      description: `${dictionary.pages_meeting_minutes_year.seo_description} ${selectedYear}`,
    },
  };
}

export async function generateStaticParams() {
  const meetingMinutesYearData = await getStrapiData<
    APIResponseCollection<'api::meeting-minutes-year.meeting-minutes-year'>
  >(
    'fi',
    '/api/meeting-minutes-years',
    ['meeting-minutes-year'],
  );

  const meetingMinutesGroupedByYear = groupMeetingMinutesByYear(meetingMinutesYearData.data);
  const meetingMinutesSortedByYear = Object.keys(meetingMinutesGroupedByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  return meetingMinutesSortedByYear.map((year) => ({
    slug: year,
  }));
}