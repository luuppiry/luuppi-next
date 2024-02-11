'use client';
import { getDictionary } from '@/dictionaries';
import { ApiCompanyCompany } from '@/types/contentTypes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SidePartnersProps {
  partnersData: ApiCompanyCompany[];
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function SidePartners({
  partnersData,
  dictionary,
}: SidePartnersProps) {
  const [randomPartners, setRandomPartners] = useState<ApiCompanyCompany[]>([]);
  useEffect(() => {
    setRandomPartners(partnersData.sort(() => Math.random() - 0.5).slice(0, 3));
  }, [partnersData]);
  return (
    <div className="flex w-full flex-col gap-2 px-4">
      <h6 className="text-lg font-bold">{dictionary.general.partners}</h6>
      <div className="flex flex-col gap-4">
        {randomPartners.map((partner) => (
          <Link
            key={partner.attributes.createdAt}
            className={`relative w-full ${partner.attributes.homepageUrl.includes('tietokonepalveluhietaniemi') ? 'h-16' : 'h-8'}`}
            href={partner.attributes.homepageUrl}
          >
            <Image
              alt="Logo"
              className="w-auto object-contain object-left"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${partner.attributes.logo.data.attributes.url}`}
              fill
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
