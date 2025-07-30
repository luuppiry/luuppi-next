import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import Image from 'next/image';

interface MeetingMinuteProps {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MeetingMinute(props: MeetingMinuteProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const dictionary = await getDictionary(params.lang);
  const yearParam = Array.isArray(searchParams.year) ? searchParams.year[0] : searchParams.year;
  const selectedYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  const pageData = await getStrapiData<
    APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
  >('fi', '/api/meeting-minute-documents?populate[1]=image&pagination[pageSize]=100', [
    'meeting-minute-document',
  ]);

  const sortedData = pageData.data
    .filter((publication) => {
      const date = publication.attributes.meetingDate;
      return date && new Date(date).getFullYear() === selectedYear;
    })
    .sort((a, b) => {
      const dateA = new Date(a.attributes.meetingDate).getTime();
      const dateB = new Date(b.attributes.meetingDate).getTime();
      return dateB - dateA;
    });

  const currentYear = new Date().getFullYear();
  const startYear = 2018; // <3 Love hardcoding
  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
  /*for (let year = currentYear; year >= startYear; year--) {
    if (year !== selectedYear) {
      years.push(year)}}*/

  return (
    <div className="relative flex flex-col gap-12">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <h1>{dictionary.navigation.meeting_minutes} {selectedYear}</h1>
        <div className="dropdown sm:dropdown-end">
          <div className="btn m-1" role="button" tabIndex={0}>
            {dictionary.pages_meeting_minutes_year.other_meeting_minutes_years}
          </div>
          <ul
            className="menu dropdown-content z-[9999] grid w-80 grid-cols-4 gap-2 rounded-box bg-base-100 p-2 shadow"
            tabIndex={0}
          >
          {years.map((year) => (
            <li key={year}>
              <a href={`/${params.lang}/organization/meeting-minutes?year=${year}`}>
                {year}
              </a>
            </li>
          ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {sortedData.map((publication) => (
          <a
            key={publication.id}
            className="group relative flex cursor-pointer flex-col gap-4 transition-transform duration-300 hover:scale-105"
            href={`/${params.lang}/organization/meeting-minutes/${publication.id}`}
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
              {(() => {
                const date = new Date(publication.attributes?.meetingDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();
                const formattedDate = `${day}.${month}.${year}`;
                return `${formattedDate} | ${publication.attributes?.shortMeetingName ?? ''}`;
              })()}
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