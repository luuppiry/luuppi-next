import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import roboSvg from '../../../../../../public/robo_500.svg';

interface AuthErrorProps {
  params: Promise<{
    lang: SupportedLanguage;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuthError(props: AuthErrorProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  const errorSearchParam = searchParams?.error;

  return (
    <div className="relative flex items-center justify-between gap-12 max-lg:flex-col max-md:items-start">
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
      <div className="luuppi-pattern absolute -left-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
    </div>
  );
}

export async function generateMetadata(
  props: AuthErrorProps,
): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.pages_error.seo_title,
    description: dictionary.pages_error.seo_description,
  };
}
