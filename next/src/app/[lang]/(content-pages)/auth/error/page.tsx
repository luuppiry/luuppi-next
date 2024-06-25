import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import roboSvg from '../../../../../../public/robo_500.svg';

interface AuthErrorProps {
  params: {
    lang: SupportedLanguage;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AuthError({
  params,
  searchParams,
}: AuthErrorProps) {
  const dictionary = await getDictionary(params.lang);
  const errorSearchParam = searchParams?.error;

  return (
    <div className="flex items-center justify-between gap-12 max-lg:flex-col max-md:items-start">
      <div className="flex flex-col gap-4">
        <h1>{dictionary.pages_error.auth_title}</h1>
        <p className="max-w-xl text-lg">
          {errorSearchParam
            ? errorSearchParam
            : dictionary.pages_error.auth_description}
        </p>
        <div>
          <Link className="btn btn-primary btn-sm" href={`/${params.lang}`}>
            {dictionary.pages_error.return_home}
          </Link>
        </div>
      </div>
      <div>
        <Image alt="404" height={550} src={roboSvg} width={550} />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: AuthErrorProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.pages_error.seo_title,
    description: dictionary.pages_error.seo_description,
  };
}
