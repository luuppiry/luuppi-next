import { auth } from '@/auth';
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
  const session = await auth();
  const dictionary = await getDictionary(params.lang);

  const user = session?.user;
  if (!user?.entraUserUuid || !user?.isLuuppiMember) {
    return (
      <div className="relative flex flex-col gap-12">
        <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <h1>{dictionary.navigation.meeting_minutes}</h1>
        </div>
        <p>{dictionary.pages_meeting_minutes_year.unauthorized}</p>
      </div>
    );
  }

  let page = 1;
  let allDocuments: any[] = [];
  let totalPages = 5;
  do {
    const response = await getStrapiData<
      APIResponseCollection<'api::meeting-minute-document.meeting-minute-document'>
    >(
      'fi',
      `/api/meeting-minute-documents?populate[1]=image&pagination[page]=${page}&pagination[pageSize]=100&sort[0]=meetingDate:desc`,
      ['meeting-minute-document'],
    );
    allDocuments = allDocuments.concat(response.data);
    totalPages = response.meta?.pagination?.pageCount || 1;
    page++;
  } while (page <= totalPages);

  const latestYear =
    allDocuments.length > 0
      ? new Date(allDocuments[0].meetingDate).getFullYear()
      : new Date().getFullYear();

  const yearParam = Array.isArray(searchParams.year)
    ? searchParams.year[0]
    : searchParams.year;

  const yearFromQuery = yearParam ? Number.parseInt(yearParam, 10) : NaN;

  const years = Array.from(
    new Set(
      allDocuments
        .map((doc) => new Date(doc.meetingDate).getFullYear())
        .filter((year) => !isNaN(year)),
    ),
  ).sort((a, b) => b - a);

  const selectedYear =
    Number.isFinite(yearFromQuery) && years.includes(yearFromQuery)
      ? yearFromQuery
      : latestYear;

  const filteredDocuments = allDocuments.filter((doc) => {
    const year = new Date(doc.meetingDate).getFullYear();
    return year === selectedYear;
  });

  const dropdownYears = years.filter((y) => y !== selectedYear);

  return (
    <div className="relative flex flex-col gap-12">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <h1>
          {dictionary.navigation.meeting_minutes} {selectedYear}
        </h1>
        <div className="dropdown sm:dropdown-end">
          <div className="btn m-1 dark:border-primary-500 dark:hover:border-primary-400" role="button" tabIndex={0}>
            {dictionary.pages_meeting_minutes_year.other_meeting_minutes_years}
          </div>
          <ul
            className="menu dropdown-content z-[9999] grid w-80 grid-cols-4 gap-2 rounded-box bg-base-100 p-2 shadow"
            tabIndex={0}
          >
            {dropdownYears.map((year) => (
              <li key={year}>
                <a
                  href={`/${params.lang}/organization/meeting-minutes?year=${year}`}
                >
                  {year}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {filteredDocuments.map((publication) => (
          <a
            key={publication.id}
            className="group relative flex cursor-pointer flex-col gap-4 transition-transform duration-300 hover:scale-105"
            href={`/${params.lang}/organization/meeting-minutes/${publication.id}`}
          >
            {publication.image?.data?.url && (
              <div className="relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300">
                <Image
                  alt={`${dictionary.navigation.meeting_minutes} cover`}
                  className="h-full w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300 object-cover"
                  src={getStrapiUrl(
                    publication.image.data.url,
                  )}
                  fill
                />
              </div>
            )}
            <div className="absolute bottom-0 right-0 z-20 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
              {(() => {
                const date = new Date(publication?.meetingDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}.${month}.${year} | ${publication?.shortMeetingName ?? ''}`;
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
