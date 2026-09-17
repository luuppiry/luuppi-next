import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { lang as language } from 'next/root-params';
import roboSvg from '../../../../../public/robo_404.svg';

export default async function NotFound() {
  const lang = await language();
  const dictionary = await getDictionary();

  return (
    <div className="relative flex items-center justify-between gap-12 max-lg:flex-col max-md:items-start">
      <div className="flex flex-col gap-4">
        <h1>{dictionary.pages_404.title}</h1>
        <p className="max-w-xl text-lg max-md:text-base">
          {dictionary.pages_404.description}
        </p>
        <div>
          <Link className="btn btn-primary btn-sm text-lg" href={`/${lang}`}>
            {dictionary.pages_404.return_home}
          </Link>
        </div>
      </div>
      <div>
        <Image alt="404" height={550} src={roboSvg} width={550} />
      </div>
      <div className="luuppi-pattern absolute -left-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: dictionary.pages_404.seo_title,
    description: dictionary.pages_404.seo_description,
  };
}
