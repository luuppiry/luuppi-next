import Songbook from '@/components/Songbook/Songbook';
import { getDictionary } from '@/dictionaries';
import { Metadata } from 'next';

export default async function SongbookPage() {
  const dictionary = await getDictionary();

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

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: dictionary.pages_songbook.seo_title,
    description: dictionary.pages_songbook.seo_description,
  };
}
