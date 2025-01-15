import Songbook from '@/components/Songbook/Songbook';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';

interface SongbookProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function SongbookPage(props: SongbookProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  return (
    <div className="relative">
      <h1 className="mb-4">{dictionary.pages_songbook.title}</h1>
      <p className="max-w-3xl">{dictionary.pages_songbook.description}</p>
      <div className="mt-6">
        <Songbook dictionary={dictionary} />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(
  props: SongbookProps,
): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.pages_songbook.seo_title,
    description: dictionary.pages_songbook.seo_description,
  };
}
