'use client';
import { Dictionary } from '@/models/locale';
import { useCallback, useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { MdClear } from 'react-icons/md';

// TODO: Should come from the backend
const CATEGORIES = [
  'Luuppi',
  'Isänmaa',
  'Politiikka',
  'Alkoholi',
  'Sitsit',
  'Juomalaulu',
  'Kotimaa',
  'Ulkomaat',
  'Lasten leikki',
  'Pakanajuhla',
  'Happo XXX K-18',
] as const;

interface SongbookProps {
  dictionary: Dictionary;
}

interface SongbookSong {
  title: string;
  verses: string[];
}

interface FetchResponse {
  songs: SongbookSong[];
  totalCount: number;
  hasMore: boolean;
}
export default function Songbook({ dictionary }: SongbookProps) {
  const [songs, setSongs] = useState<SongbookSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expandedSong, setExpandedSong] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          ...(debouncedSearch && { q: debouncedSearch }),
          ...(category && { category: category.trim() }),
        });

        const response = await fetch(`/api/songbook?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data: FetchResponse = await response.json();

        setSongs(data.songs);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setSongs([]);
        setError(dictionary.general.error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSongs();

    return () => controller.abort();
  }, [debouncedSearch, category, dictionary.general.error]);

  const shouldExpandSong = useCallback(
    (song: SongbookSong, searchTerm: string): boolean => {
      if (!searchTerm) {
        return false;
      }

      const normalizedSearchTerm = searchTerm.toLowerCase();

      return song.verses.some((verse) =>
        verse.toLowerCase().includes(normalizedSearchTerm),
      );
    },
    [],
  );

  useEffect(() => {
    if (debouncedSearch) {
      const matchingSongs = songs
        .filter((song) => shouldExpandSong(song, debouncedSearch))
        .map((song) => song.title);
      setExpandedSong(matchingSongs.length === 1 ? matchingSongs[0] : null);
      setManuallyCollapsed(new Set());
    } else {
      setExpandedSong(null);
      setManuallyCollapsed(new Set());
    }
  }, [songs, debouncedSearch, shouldExpandSong]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) {
      return text;
    }

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark
              key={`${part}-${index}`}
              className="rounded bg-primary-200 px-1"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const handleReset = useCallback(() => {
    setSearch('');
    setCategory('');
    setExpandedSong(null);
    setManuallyCollapsed(new Set());
  }, []);

  const groupSongsByCategory = (songsToGroup: SongbookSong[]) => songsToGroup.reduce(
      (acc, song) => {
        const categoryMatch = song.title.match(/^\d+\./);
        const categoryNum = categoryMatch ? parseInt(categoryMatch[0]) : 0;
        let category = 'Muu';

        if (categoryNum >= 1 && categoryNum <= 100) category = 'Luuppi';
        else if (categoryNum >= 101 && categoryNum <= 200) category = 'Isänmaa';
        else if (categoryNum >= 201 && categoryNum <= 300)
          category = 'Politiikka';
        else if (categoryNum >= 301 && categoryNum <= 400)
          category = 'Alkoholi';
        else if (categoryNum >= 401 && categoryNum <= 500) category = 'Sitsit';
        else if (categoryNum >= 501 && categoryNum <= 600)
          category = 'Juomalaulu';
        else if (categoryNum >= 601 && categoryNum <= 700) category = 'Kotimaa';
        else if (categoryNum >= 701 && categoryNum <= 800)
          category = 'Ulkomaat';
        else if (categoryNum >= 801 && categoryNum <= 900)
          category = 'Lasten leikki';
        else if (categoryNum >= 901 && categoryNum <= 1000)
          category = 'Pakanajuhla';
        else if (categoryNum >= 1001) category = 'Happo XXX K-18';

        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(song);
        return acc;
      },
    {} as Record<string, SongbookSong[]>,
  );

  const groupedSongs = groupSongsByCategory(songs);
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
              onChange={(e) => setSearch(e.target.value)}
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
              onChange={(e) => {
                setCategory(e.target.value);
                setExpandedSong(null);
                setManuallyCollapsed(new Set());
              }}
            >
              <option value="">{dictionary.general.all_categories}</option>
              {CATEGORIES.map((cat) => (
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

      {error && (
        <div className="alert alert-error mb-3 mt-4 sm:mb-4">
          {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div aria-live="polite" className="flex min-h-64 flex-col items-center justify-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <div className="text-center">
              <p className="font-medium">{dictionary.pages_songs.loading_title}</p>
            </div>
          </div>
        ) : !error && songs.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg bg-background-50 px-6 py-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-base-200">
              <BiSearch className="opacity-50" size={32} />
            </div>

            <h2 className="text-lg font-bold">
              <p>{dictionary.pages_songs.no_results_title}</p>
            </h2>

            <div className="mt-2 max-w-md text-sm opacity-60">
              <p>{dictionary.pages_songs.empty_filters}</p>
            </div>

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
            {Object.entries(groupedSongs)
              .filter(
                ([categoryName]) =>
                  !category ||
                  categoryName.toLowerCase() === category.toLowerCase(),
              )
              .map(([categoryName, categorySongs]) => (
                <div key={categoryName} className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">
                    {categoryName}
                  </h2>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    {categorySongs.map((song) => {
                      const verseMatchesSearch = shouldExpandSong(
                        song,
                        debouncedSearch,
                      );

                      const isExpanded =
                        expandedSong === song.title ||
                        (verseMatchesSearch &&
                          !manuallyCollapsed.has(song.title));

                      return (
                        <div key={song.title} className="flex rounded-lg bg-background-50 transition-all">
                          <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
                          <div className="card-body flex-1 p-3 sm:p-4">
                            <button
                              aria-expanded={isExpanded}
                              className="w-full text-left"
                              type="button"
                              onClick={() => {
                                if (verseMatchesSearch) {setManuallyCollapsed((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(song.title)) {
                                      next.delete(song.title);
                                    } else {
                                      next.add(song.title);
                                    }
                                    return next;
                                  });
                                  return;
                                }

                                setExpandedSong((current) =>
                                  current === song.title ? null : song.title,
                                );
                              }}
                            >
                              <h3 className="text-base font-bold sm:text-lg">
                                {highlightText(song.title, debouncedSearch)}
                              </h3>
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                                {song.verses.map((verse, verseIndex) => (
                                  <p key={`${song.title}-${verseIndex}`} className="whitespace-pre-line text-xs sm:text-sm">
                                    {highlightText(verse, debouncedSearch)}
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