import LuuppiBird from '@/components/LuuppiBird/LuuppiBird';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Image from 'next/image';
import Link from 'next/link';

interface NotFoundProps {
  params: { lang: SupportedLanguage };
}

export default async function NotFound({ params }: NotFoundProps) {
  const dictionary = await getDictionary(params.lang);

  return (
    <div className="flex items-center justify-between gap-12 max-lg:flex-col max-md:items-start">
      <div className="flex flex-col gap-4">
        <h1>{dictionary.pages_404.title}</h1>
        <p className="max-w-xl text-lg">{dictionary.pages_404.description}</p>
        <div>
          <Link
            className="btn btn-primary text-lg text-white"
            href={`/${params.lang}`}
          >
            {dictionary.pages_404.return_home}
          </Link>
        </div>
        <div>
          <LuuppiBird dictionary={dictionary} />
        </div>
      </div>
      <div>
        <Image alt="404" height={550} src="/robo.svg" width={550} />
      </div>
    </div>
  );
}
