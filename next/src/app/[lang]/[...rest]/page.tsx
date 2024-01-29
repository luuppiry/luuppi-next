import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

export default async function NotFound({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
  const dictionary = await getDictionary(params.lang);

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-6xl font-extrabold">
          {dictionary.pages_404.title}
        </h1>
        <p className="text-lg">{dictionary.pages_404.description}</p>
        <div>
          <Link className="btn btn-primary text-lg text-white" href="/">
            {dictionary.pages_404.return_home}
          </Link>
        </div>
      </div>
    </section>
  );
}
