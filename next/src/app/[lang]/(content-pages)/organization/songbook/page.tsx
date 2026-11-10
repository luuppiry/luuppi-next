import { promises as fs } from 'fs';
import path from 'path';
import { getDictionary } from '@/dictionaries';
import Songbook, {
  type SongbookCategory,
} from '@/components/Songbook/Songbook';
import { cacheLife } from 'next/cache';

async function getSongbook(): Promise<SongbookCategory[]> {
  'use cache';
  cacheLife('max');

  const file = await fs.readFile(
    path.join(process.cwd(), 'public/data/songbook.json'),
    'utf-8',
  );
  return JSON.parse(file);
}

export default async function SongbookPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [dictionary, songbook] = await Promise.all([
    getDictionary(lang),
    getSongbook(),
  ]);

  return <Songbook dictionary={dictionary} songbook={songbook} />;
}
