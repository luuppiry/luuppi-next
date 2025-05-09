import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

interface MeetingMinutesProps {
  params: { lang: SupportedLanguage };
}

export default async function MeetingMinutes(props: MeetingMinutesProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const yearsData = await getStrapiData<
    APIResponseCollection<'api::meeting-minutes-year.meeting-minutes-year'>
  >(
    params.lang,
    '/api/meeting-minutes-years?populate[meetingMinuteDocuments][populate][0]=image&populate[meetingMinuteDocuments][populate][1]=pdf',
    ['meeting-minutes-year', 'meeting-minute-document']
  );

  const years = yearsData.data.sort((a, b) => b.attributes.year - a.attributes.year);

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.meeting_minutes}</h1>
      <div className="grid grid-cols-4 gap-12 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {years.map((year) => (
          <Link
            className="group relative flex cursor-pointer flex-col gap-4 hover:scale-105 transition-transform duration-300"
            href={`/${params.lang}/organization/meeting-minutes/${year.attributes.year}`}
            key={year.id}
          >
            <div className="relative aspect-[210/297] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300">
              {year.attributes.meetingMinuteDocuments?.[0]?.attributes.image?.data?.attributes.url && (
                <Image
                  alt={`Meeting minutes ${year.attributes.year}`}
                  className="h-full w-full rounded-lg object-cover"
                  src={getStrapiUrl(
                    year.attributes.meetingMinuteDocuments[0].attributes.image.data.attributes.url
                  )}
                  fill
                />
              )}
            </div>
            <div className="absolute bottom-0 right-0 z-20 rounded-br-lg rounded-tl-lg bg-accent-400 px-2 py-1 font-bold text-white">
              {year.attributes.year}
            </div>
            <div className="absolute bottom-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black to-transparent opacity-25" />
            <div className="absolute -bottom-1.5 left-1.5 -z-10 h-full w-full transform rounded-lg bg-gray-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:rotate-1" />
            <div className="absolute -bottom-3 left-3 -z-20 h-full w-full transform rounded-lg bg-gray-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-2" />
          </Link>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(props: MeetingMinutesProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const pathname = `/${params.lang}/organization/meeting-minutes`;

  return {
    title: `${dictionary.navigation.meeting_minutes} | Luuppi ry`,
    description: dictionary.pages_meeting_minutes_year.seo_description,
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title: dictionary.navigation.meeting_minutes,
      description: dictionary.pages_meeting_minutes_year.seo_description,
      url: pathname,
      siteName: 'Luuppi ry',
    },
    twitter: {
      title: dictionary.navigation.meeting_minutes,
      description: dictionary.pages_meeting_minutes_year.seo_description,
    },
  };
}