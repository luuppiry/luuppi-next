import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';

interface SongbookSong {
  title: string;
  verses: string[];
}

interface SongbookCategory {
  category: string;
  songs: SongbookSong[];
}

interface PaginatedResponse {
  songs: SongbookSong[];
  totalCount: number;
  hasMore: boolean;
}

export async function GET(
  request: Request,
): Promise<NextResponse<PaginatedResponse>> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase().trim() || '';
  const category = searchParams.get('category')?.toLowerCase().trim() || '';
  const page = parseInt(searchParams.get('page') || '0');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const file = await fs.readFile(
    process.cwd() + '/src/data/songbook.json',
    'utf-8',
  );

  const songbook: SongbookCategory[] = JSON.parse(file);
  let filteredSongs: SongbookSong[] = [];

  const normalizedQuery = query.replace(/\s+/g, ' ').toLowerCase();

  const textMatches = (text: string, searchTerm: string) =>
    text.toLowerCase().includes(searchTerm);

  songbook.forEach((cat) => {
    if (category && !textMatches(cat.category, category)) {
      return;
    }

    const matchingSongs = cat.songs.filter((song) => {
      if (!normalizedQuery) {
        return true;
      }

      if (textMatches(song.title, normalizedQuery)) {
        return true;
      }

      return song.verses.some((verse) => textMatches(verse, normalizedQuery));
    });

    filteredSongs.push(...matchingSongs);
  });

  filteredSongs = Array.from(new Set(filteredSongs));

  const totalCount = filteredSongs.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const paginatedSongs = filteredSongs.slice(start, end);

  return NextResponse.json({
    songs: paginatedSongs,
    totalCount,
    hasMore: end < totalCount,
  });
}
