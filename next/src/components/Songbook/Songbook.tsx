'use client';

import { Dictionary } from '@/models/locale';
import { useMemo, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { MdClear } from 'react-icons/md';
interface SongbookProps {
  dictionary: Dictionary;
  songbook: SongbookCategory[];
}

interface SongbookSong {
  title: string;
  verses: string[];
}

export interface SongbookCategory {
  category: string;
  songs: SongbookSong[];
}

interface IndexedSong {
  key: string;
  song: SongbookSong;
  titleLower: string;
  versesLower: string[];
}

interface IndexedCategory {
  category: string;
  songs: IndexedSong[];
}

interface ResultSong extends IndexedSong {
  verseMatch: boolean;
}

interface ResultCategory {
  category: string;
  songs: ResultSong[];
}

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function Songbook({ dictionary, songbook }: SongbookProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [toggled, setToggled] = useState<Set<string>>(new Set());

  const query = search.trim().replace(/\s+/g, ' ').toLowerCase();

  const index = useMemo<IndexedCategory[]>(
    () =>
      songbook.map((cat) => ({
        category: cat.category,
        songs: cat.songs.map((song) => ({
          key: `${cat.category}:${song.title}`,
          song,
          titleLower: song.title.toLowerCase(),
          versesLower: song.verses.map((verse) => verse.toLowerCase()),
        })),
      })),
    [songbook],
  );

  const categories = useMemo(
    () => songbook.map((cat) => cat.category),
    [songbook],
  );

  const results = useMemo<ResultCategory[]>(() => {
    const output: ResultCategory[] = [];

    for (const cat of index) {
      if (category && cat.category !== category) {
        continue;
      }

      const songs: ResultSong[] = [];

      for (const entry of cat.songs) {
        const verseMatch =
          !!query && entry.versesLower.some((verse) => verse.includes(query));

        if (!query || verseMatch || entry.titleLower.includes(query)) {
          songs.push({ ...entry, verseMatch });
        }
      }

      if (songs.length > 0) {
        output.push({ category: cat.category, songs });
      }
    }

    return output;
  }, [index, category, query]);

  const highlight = (text: string) => {
    if (!query) {
      return text;
    }

    // With a capture group, split() puts the matches at odd indexes.
    const pattern = new RegExp(`(${escapeRegExp(query)})`, 'gi');

    return text.split(pattern).map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="rounded bg-primary-200 px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const resetToggled = () => setToggled(new Set());

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetToggled();
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    resetToggled();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    resetToggled();
  };

  const toggleSong = (key: string) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between rounded-lg bg-background-50 p-4 max-md:flex-col max-md:justify-center max-md:gap-4 max-md:px-2">
        <div className="flex w-full items-center gap-4 max-md:flex-col max-md:gap-2">
          <div className="relative w-full">
            <input
              className="input input-bordered w-full pl-10 text-base"
              placeholder={`${dictionary.general.search}...`}
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <BiSearch
              className="absolute left-3 top-3 text-gray-400"
              size={24}
            />
          </div>

          <div className="flex w-full items-center gap-2">
            <select
              className="select select-bordered w-full text-base max-md:w-full"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">{dictionary.general.all_categories}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {(search || category) && (
              <button
                aria-label={dictionary.pages_songs.clear_search}
                className="btn btn-square btn-ghost"
                type="button"
                onClick={handleReset}
              >
                <MdClear size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg bg-background-50 px-6 py-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-base-200">
              <BiSearch className="opacity-50" size={32} />
            </div>

            <h2 className="text-lg font-bold">
              {dictionary.pages_songs.no_results_title}
            </h2>

            <p className="mt-2 max-w-md text-sm opacity-60">
              {dictionary.pages_songs.empty_filters}
            </p>

            {(search || category) && (
              <button
                className="btn btn-primary btn-sm mt-6"
                type="button"
                onClick={handleReset}
              >
                {dictionary.pages_songs.clear_search}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {results.map((cat) => (
              <div key={cat.category} className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">{cat.category}</h2>

                <div className="flex flex-col gap-3 sm:gap-4">
                  {cat.songs.map(({ key, song, verseMatch }) => {
                    // Songs matching in their verses open by default;
                    // clicking flips whatever the default is.
                    const isExpanded = verseMatch !== toggled.has(key);

                    return (
                      <div
                        key={key}
                        className="flex rounded-lg bg-background-50 transition-all"
                      >
                        <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
                        <div className="card-body flex-1 p-3 sm:p-4">
                          <button
                            aria-expanded={isExpanded}
                            className="w-full text-left"
                            type="button"
                            onClick={() => toggleSong(key)}
                          >
                            <h3 className="text-base font-bold sm:text-lg">
                              {highlight(song.title)}
                            </h3>
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                              {song.verses.map((verse, verseIndex) => (
                                <p
                                  key={verseIndex}
                                  className="whitespace-pre-line text-xs sm:text-sm"
                                >
                                  {highlight(verse)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
