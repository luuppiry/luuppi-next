import { getDictionary } from '@/dictionaries';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse, APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';

const url = '/api/job-opportunities?populate=logo';
const tags = ['job-opportunity'];

interface CollaborationJobOpportunitiesProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function CollaborationJobOpportunities(
  props: CollaborationJobOpportunitiesProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::job-opportunity.job-opportunity'>
  >(params.lang, url, tags);

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.job_opportunities}</h1>
      <div className="flex flex-col gap-8">
        {pageData.data.map((job_opportunity) => (
          <div
            key={job_opportunity.attributes.createdAt!.toString()}
            className="flex gap-4 rounded-lg bg-background-50"
          >
            <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
            <div className="flex gap-12 py-4 max-md:flex-col max-md:gap-6">
              <div className="flex shrink-0 flex-col justify-center gap-4">
                <Image
                  alt="Company logo"
                  className="rounded-lg object-contain max-md:w-44"
                  height={100}
                  src={getStrapiUrl(
                    job_opportunity.attributes.logo?.data.attributes.url,
                  )}
                  width={300}
                />
                <div className="flex flex-col gap-1 font-semibold">
                  <div>
                    <Link
                      className="link flex items-center gap-1"
                      href={job_opportunity.attributes.homepageUrl}
                    >
                      {dictionary.pages_companies.homepage}
                      <FaExternalLinkAlt size={14} />
                    </Link>
                  </div>
                  <div>
                    <Link
                      className="link flex items-center gap-1"
                      href={job_opportunity.attributes.jobOpportunityUrl}
                    >
                      {dictionary.pages_companies.job_opportunity}{' '}
                      <FaExternalLinkAlt size={14} />
                    </Link>
                  </div>
                  <p className="flex items-center gap-1">
                    {dictionary.pages_companies.job_opportunity_published}:{' '}
                    <span className="badge badge-primary">
                      {job_opportunity.attributes.jobOpportunityPublished}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    {dictionary.pages_companies.job_opportunity_ending}:{' '}
                    <span className="badge badge-primary">
                      {job_opportunity.attributes.jobOpportunityEnding}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    {dictionary.pages_companies[job_opportunity.attributes['jobOpportunityTargetGroup']]}:{' '}
                    <span className="badge badge-primary">
                      {job_opportunity.attributes['jobOpportunityTargetGroup']}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-top gap-4 pr-4">
                <strong>{job_opportunity.attributes.jobTitle}</strong>
                <p>{job_opportunity.attributes.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(
  props: CollaborationJobOpportunitiesProps,
): Promise<Metadata> {
  const params = await props.params;
  const url =
    '/api/collaboration-job-opportunities?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage&populate=ContactBanner';
  const tags = ['collaboration-job-opportunity'];

  const data = await getStrapiData<
    APIResponse<'api::job-opportunities.job-opportunities'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/collaboration/job-opportunities`;

  return formatMetadata(data, pathname);
}
