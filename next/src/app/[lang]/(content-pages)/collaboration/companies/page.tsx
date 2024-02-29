import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { ApiCompanyCompany } from '@/types/contentTypes';
import Image from 'next/image';
import Link from 'next/link';

const url = '/api/companies?populate=logo';
const tags = ['company'];

interface CollaborationCompaniesProps {
  params: { lang: SupportedLanguage };
}

export default async function CollaborationCompanies({
  params,
}: CollaborationCompaniesProps) {
  const dictionary = await getDictionary(params.lang);

  const pageData = await getStrapiData<ApiCompanyCompany[]>(
    params.lang,
    url,
    tags,
  );

  return (
    <div className="flex flex-col gap-12">
      <h1>{dictionary.navigation.companies}</h1>
      <div className="flex flex-col gap-8">
        {pageData.data.map((company) => (
          <div
            key={company.attributes.createdAt}
            className="flex gap-4 rounded-lg bg-background-50/50"
          >
            <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
            <div className="flex gap-12 py-4 max-md:flex-col max-md:gap-6">
              <div className="flex shrink-0 flex-col justify-center gap-4">
                <Image
                  alt="Company logo"
                  className="rounded-lg object-contain max-md:w-44"
                  height={100}
                  src={getStrapiUrl(
                    company.attributes.logo.data.attributes.url,
                  )}
                  width={300}
                />
                <div className="font-semibold">
                  <p>
                    {dictionary.pages_companies.founded}:{' '}
                    {company.attributes.foundedYear}
                  </p>
                  <div>
                    <Link
                      className="link"
                      href={company.attributes.homepageUrl}
                    >
                      {dictionary.pages_companies.homepage}
                    </Link>
                  </div>
                  <div>
                    <Link
                      className="link flex items-center gap-1"
                      href={company.attributes.openJobsUrl}
                    >
                      {dictionary.pages_companies.open_jobs}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center pr-4">
                <p>{company.attributes.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
