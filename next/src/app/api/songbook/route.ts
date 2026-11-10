import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

interface SongbookSong {
  title: string;
  verses: string[];
}

interface SongbookCategory {
  category: string;
  songs: SongbookSong[];
}

interface SongsResponse {
  songs: SongbookSong[];
  totalCount: number;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<SongsResponse>> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase().trim() || '';
  const category = searchParams.get('category')?.toLowerCase().trim() || '';

  const file = await fs.readFile(
    process.cwd() + '/public/data/songbook.json',
    'utf-8',
  );

  const songbook: SongbookCategory[] = JSON.parse(file);
  const normalizedQuery = query.replace(/\s+/g, ' ');

  const textMatches = (text: string, searchTerm: string) =>
    text.toLowerCase().includes(searchTerm);

  const songs = songbook
    .filter((cat) => !category || textMatches(cat.category, category))
    .flatMap((cat) =>
      cat.songs.filter(
        (song) =>
          !normalizedQuery ||
          textMatches(song.title, normalizedQuery) ||
          song.verses.some((verse) => textMatches(verse, normalizedQuery)),
      ),
    );

  await new Promise(r => setTimeout(r, 750));

  return NextResponse.json({
    songs,
    totalCount: songs.length,
  });
}