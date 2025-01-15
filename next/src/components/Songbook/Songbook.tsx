'use client';
import { Dictionary } from '@/models/locale';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expandedSong, setExpandedSong] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<string>>(
    new Set(),
  );
  const isFetchingRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) {
        setPage(0);
        setSongs([]);
        setHasMore(true);
        isFetchingRef.current = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearch !== search) return;
    if (loadingRef.current || isFetchingRef.current) return;

    const fetchSongs = async () => {
      try {
        loadingRef.current = true;
        isFetchingRef.current = true;
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: '20',
          ...(debouncedSearch && { q: debouncedSearch.trim() }),
          ...(category && { category: category.trim() }),
        });

        const response = await fetch(`/api/songbook?${params}`);
        if (!response.ok) throw new Error('Failed to fetch songs');

        const data: FetchResponse = await response.json();

        setSongs((prev) =>
          page === 0 ? data.songs : [...prev, ...data.songs],
        );
        setHasMore(data.hasMore);
        if (data.hasMore && page === 0) {
          setPage(1);
        }
      } catch (err) {
        setError(dictionary.general.error);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
        loadingRef.current = false;
      }
    };

    if (page === 0) {
      setSongs([]);
      setHasMore(true);
    }

    fetchSongs();

    return () => {
      loadingRef.current = false;
      isFetchingRef.current = false;
    };
  }, [page, debouncedSearch, category, search, dictionary.general.error]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingRef.current &&
          !isFetchingRef.current &&
          hasMore &&
          page > 0
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [hasMore, page]);

  const shouldExpandSong = useCallback(
    (song: SongbookSong, searchTerm: string): boolean => {
      if (!searchTerm) return false;
      return song.verses.some((verse) =>
        verse.toLowerCase().includes(searchTerm.toLowerCase()),
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
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="rounded bg-primary-200 px-1">
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
    setPage(0);
    setSongs([]);
    setHasMore(true);
    loadingRef.current = false;
    isFetchingRef.current = false;
  }, []);

  const groupSongsByCategory = (songs: SongbookSong[]) => {
    const groupedSongs = songs.reduce(
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
      {} as Record<string, typeof songs>,
    );
    return groupedSongs;
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between rounded-lg bg-background-50 p-4 max-md:flex-col max-md:justify-center max-md:gap-4 max-md:px-2">
        <div className="flex w-full items-center gap-4 max-md:flex-col max-md:gap-2">
          <div className="relative w-full">
            <input
              className="input input-bordered w-full pl-10 text-base"
              placeholder={dictionary.general.search + '...'}
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
                setPage(0);
                setSongs([]);
                setHasMore(true);
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

      {error && <div className="alert alert-error mb-3 sm:mb-4">{error}</div>}

      <div className="mt-8 flex flex-col gap-12">
        {Object.entries(groupSongsByCategory(songs))
          .filter(
            ([cat]) =>
              !category || cat.toLowerCase() === category.toLowerCase(),
          )
          .map(([categoryName, categorySongs]) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">{categoryName}</h2>
              <div className="flex flex-col gap-3 sm:gap-4">
                {categorySongs.map((song, index) => (
                  <div
                    key={index}
                    className="flex rounded-lg bg-background-50 transition-all"
                  >
                    <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
                    <div className="card-body flex-1 p-3 sm:p-4">
                      <button
                        className="w-full text-left"
                        onClick={() => {
                          if (shouldExpandSong(song, debouncedSearch)) {
                            setManuallyCollapsed((prev) => {
                              const next = new Set(prev);
                              if (next.has(song.title)) {
                                next.delete(song.title);
                              } else {
                                next.add(song.title);
                              }
                              return next;
                            });
                          } else {
                            setExpandedSong(
                              expandedSong === song.title ? null : song.title,
                            );
                          }
                        }}
                      >
                        <h3 className="text-base font-bold sm:text-lg">
                          {highlightText(song.title, debouncedSearch)}
                        </h3>
                      </button>
                      {(expandedSong === song.title ||
                        (shouldExpandSong(song, debouncedSearch) &&
                          !manuallyCollapsed.has(song.title))) && (
                        <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                          {song.verses.map((verse, vIndex) => (
                            <p
                              key={vIndex}
                              className="whitespace-pre-line text-xs sm:text-sm"
                            >
                              {highlightText(verse, debouncedSearch)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse bg-base-100 shadow-lg">
                <div className="card-body p-4">
                  <div className="h-6 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-4 w-full" id="scroll-sentinel" />
      </div>
    </div>
  );
}
