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

const url = '/api/companies?populate=logo';
const tags = ['company'];

interface CollaborationCompaniesProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function CollaborationCompanies(
  props: CollaborationCompaniesProps,
) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(params.lang, url, tags);

  return (
    <div className="relative flex flex-col gap-12">
      <h1>{dictionary.navigation.companies}</h1>
      <div className="flex flex-col gap-8">
        {pageData.data.map((company) => (
          <div
            key={company?.createdAt!.toString()}
            className="flex gap-4 rounded-lg bg-background-50"
          >
            <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
            <div className="flex gap-12 py-4 max-md:flex-col max-md:gap-6">
              <div className="flex shrink-0 flex-col justify-center gap-4">
                <Image
                  alt="Company logo"
                  className="rounded-lg object-contain max-md:w-44"
                  height={100}
                  src={getStrapiUrl(company?.logo?.url)}
                  width={300}
                />
                <div className="flex flex-col gap-1 font-semibold">
                  <p className="flex items-center gap-1">
                    {dictionary.pages_companies.founded}:{' '}
                    <span className="badge badge-primary">
                      {company?.foundedYear}
                    </span>
                  </p>
                  <div>
                    <Link
                      className="link flex items-center gap-1"
                      href={company?.homepageUrl}
                    >
                      {dictionary.pages_companies.homepage}
                      <FaExternalLinkAlt size={14} />
                    </Link>
                  </div>
                  {company?.openJobsUrl && (
                    <div>
                      <Link
                        className="link flex items-center gap-1"
                        href={company?.openJobsUrl}
                      >
                        {dictionary.pages_companies.open_jobs}{' '}
                        <FaExternalLinkAlt size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center pr-4">
                <p>{company?.description}</p>
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
  props: CollaborationCompaniesProps,
): Promise<Metadata> {
  const params = await props.params;
  const url =
    '/api/collaboration-company?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['collaboration-company'];

  const data = await getStrapiData<
    APIResponse<'api::collaboration-company.collaboration-company'>
  >(params.lang, url, tags);

  const pathname = `/${params.lang}/collaboration/companies`;

  return formatMetadata(data, pathname);
}
