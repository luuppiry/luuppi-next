import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import {
  APIResponse,
  APIResponseCollection,
  StrapiCacheTag,
} from '@/types/types';
import { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { lang as language } from 'next/root-params';
import { FaExternalLinkAlt } from 'react-icons/fa';

const url = '/api/job-opportunities?populate=logo&populate=logoDark';
const tags = ['job-opportunity'] as const satisfies StrapiCacheTag[];

interface CollaborationJobOpportunitiesProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function CollaborationJobOpportunities(
  props: CollaborationJobOpportunitiesProps,
) {
  'use cache';
  cacheLife('max');
  cacheTag(...tags);

  const lang = await language();
  const dictionary = await getDictionary();

  const pageData = await getStrapiData<
    APIResponseCollection<'api::job-opportunity.job-opportunity'>
  >(lang, url, tags);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openJobOpportunities = pageData.data.filter((job) => {
    const endingDate = new Date(job.jobOpportunityDateEnding);
    return endingDate >= today;
  });

  const formatDate = (date: string | Date) => {
    const formatted = new Date(date);
    return formatted.toLocaleDateString(lang, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.job_opportunities}</h1>
      <div className="flex flex-col gap-8">
        {openJobOpportunities.reverse().map((job_opportunity) => {
          const light = getStrapiUrl(job_opportunity.logo.url);
          const dark = getStrapiUrl(
            (job_opportunity.logoDark ?? job_opportunity.logo).url,
          );

          return (
            <div
              key={job_opportunity.createdAt!.toString()}
              className="flex gap-4 rounded-lg bg-background-50"
            >
              <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
              <div className="flex gap-12 py-4 max-md:flex-col max-md:gap-6">
                <div className="flex shrink-0 flex-col justify-center gap-4">
                  <Image
                    alt="Company logo"
                    className="rounded-lg object-contain object-left max-md:w-44 dark:hidden"
                    height={100}
                    src={light}
                    width={300}
                  />
                  <Image
                    alt="Company logo"
                    className={`hidden rounded-lg object-contain object-left max-md:w-44 dark:block ${
                      job_opportunity.logoDark
                        ? ''
                        : 'dark:drop-shadow-[0_0_.5px_white]'
                    }`}
                    height={100}
                    src={dark}
                    width={300}
                  />

                  <div className="flex flex-col gap-1 font-semibold">
                    <div>
                      <Link
                        className="link flex items-center gap-1"
                        href={job_opportunity.homepageUrl}
                      >
                        {dictionary.pages_companies.homepage}
                        <FaExternalLinkAlt size={14} />
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="link flex items-center gap-1"
                        href={job_opportunity.jobOpportunityUrl}
                      >
                        {dictionary.pages_companies.job_opportunity}
                        <FaExternalLinkAlt size={14} />
                      </Link>
                    </div>
                    <p className="flex items-center gap-1">
                      {dictionary.pages_companies.job_opportunity_published}:{' '}
                      <span className="badge badge-primary">
                        {formatDate(
                          job_opportunity.jobOpportunityDatePublished,
                        )}
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      {dictionary.pages_companies.job_opportunity_ending}:{' '}
                      <span className="badge badge-primary">
                        {formatDate(job_opportunity.jobOpportunityDateEnding)}
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      {dictionary.pages_companies.job_opportunity_target_group}:{' '}
                      <span className="badge badge-primary">
                        {
                          dictionary.pages_companies[
                            job_opportunity['jobOpportunityTargetGroup']
                          ]
                        }
                      </span>
                    </p>
                  </div>
                </div>
                <div className="justify-top flex flex-col gap-4 pr-4">
                  <strong>{job_opportunity.jobTitle}</strong>
                  <p>{job_opportunity.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await language();
  const url =
    '/api/collaboration-job-opportunity?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['collaboration-job-opportunity'] as const;

  const data = await getStrapiData<
    APIResponse<'api::collaboration-job-opportunity.collaboration-job-opportunity'>
  >(lang, url, tags);

  const pathname = `/${lang}/collaboration/job-opportunities`;

  return formatMetadata(data, pathname);
}
