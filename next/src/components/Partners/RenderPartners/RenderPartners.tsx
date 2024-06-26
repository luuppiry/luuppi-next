import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';

interface RenderPartnersProps {
  lang: SupportedLanguage;
}

export default async function RenderPartners({ lang }: RenderPartnersProps) {
  const partnersData = await getStrapiData<
    APIResponseCollection<'api::company.company'>
  >(lang, '/api/companies?populate=*', ['company']);

  return (
    <Marquee className="mt-4 h-32 max-md:mt-8" autoFill>
      {partnersData.data.map((partner) => (
        <Link
          key={partner.attributes.createdAt!.toString()}
          className="btn btn-link relative mx-6 flex h-32 w-48 opacity-65 brightness-0 filter transition-all duration-300 hover:opacity-100 hover:brightness-100 max-md:h-20"
          href={partner.attributes.homepageUrl}
        >
          <Image
            alt="Partner company logo"
            className="object-contain"
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={getStrapiUrl(partner.attributes.logo?.data.attributes.url)}
            fill
            priority
          />
        </Link>
      ))}
    </Marquee>
  );
}
