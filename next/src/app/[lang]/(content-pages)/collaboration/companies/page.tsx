import { getDictionary } from '@/dictionaries';
import getStrapiData from '@/lib/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiCompanyCompany } from '@/types/contentTypes';
import Image from 'next/image';
import Link from 'next/link';

const url = '/api/companies?populate=logo';
const tags = ['company'];

interface CollaborationCompaniesProps {
  params: { lang: SupportedLanguage };
}

export default async function Organization({
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
      <div className="flex flex-col gap-6">
        {pageData.data.map((company) => (
          <div
            key={company.attributes.createdAt}
            className="flex gap-12 py-8 max-md:flex-col max-md:gap-6"
          >
            <div className="flex shrink-0 flex-col justify-center gap-4">
              <Image
                alt="Company logo"
                className="rounded-lg object-contain max-md:w-44"
                height={100}
                src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${company.attributes.logo.data.attributes.url}`}
                width={300}
              />
              <div className="font-semibold">
                <p>Founded: {company.attributes.foundedYear}</p>
                <div>
                  Homepage:{' '}
                  <Link className="link" href={company.attributes.homepageUrl}>
                    {
                      company.attributes.homepageUrl
                        .replace(/https?:\/\//, '')
                        .split('/')[0]
                    }
                  </Link>
                </div>
                <div>
                  <Link className="link" href={company.attributes.openJobsUrl}>
                    Open Jobs
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p>{company.attributes.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
