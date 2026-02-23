import 'server-only';

import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Dictionary } from '@/models/locale';
import { APIResponseData } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';

interface SidePartnersProps {
  partnersData: APIResponseData<'api::company.company'>[];
  dictionary: Dictionary;
}

export default async function SidePartners({
  partnersData,
  dictionary,
}: SidePartnersProps) {
  const randomPartners = partnersData
    // eslint-disable-next-line react-hooks/purity
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="flex w-full flex-col gap-2 px-4">
      <h6 className="text-lg font-bold">{dictionary.general.partners}</h6>
      <div className="flex flex-col gap-4">
        {randomPartners.map((partner) => (
          <Link
            key={partner.createdAt!.toString()}
            className={`relative w-full ${
              partner.homepageUrl.includes('tietokonepalveluhietaniemi')
                ? 'h-16'
                : 'h-8'
            }`}
            href={partner.homepageUrl}
          >
            <Image
              alt="Partner company logo"
              className="w-auto object-contain object-left dark:contrast-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={getStrapiUrl(partner.logo?.url)}
              fill
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
