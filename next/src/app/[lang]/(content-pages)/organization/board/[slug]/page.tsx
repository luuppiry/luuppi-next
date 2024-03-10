import BoardMember from '@/components/BoardMember/BoardMember';
import { getDictionary } from '@/dictionaries';
import { flipBoardLocale } from '@/libs/strapi/flip-locale';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { groupBoardByYear } from '@/libs/strapi/group-board-by-year';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface OldBoardProps {
  params: { slug: string; lang: SupportedLanguage };
}

export default async function OldBoard({ params }: OldBoardProps) {
  const dictionary = await getDictionary(params.lang);

  const year = parseInt(params.slug, 10);

  if (isNaN(year)) {
    redirect(`/${params.lang}/404`);
  }

  const boardData = await getStrapiData<
    APIResponseCollection<'api::board.board'>
  >(
    'fi',
    '/api/boards?populate[boardMembers][populate][boardRoles][populate]=localizations&populate[boardMembers][populate]=image',
    ['board', 'board-role', 'board-member'],
  );

  const boardGroupedByYear = groupBoardByYear(boardData.data);
  const wantedBoard = boardGroupedByYear[params.slug];

  if (!wantedBoard) {
    redirect(`/${params.lang}/404`);
  }

  const boardSortedByYear = Object.keys(boardGroupedByYear).sort(
    (a, b) => Number(b) - Number(a),
  );
  const latestBoard = boardGroupedByYear[boardSortedByYear[0]];
  const otherBoards = boardSortedByYear.filter(
    (year) => parseInt(year, 10) !== wantedBoard.attributes.year,
  );

  const boardLanguageFlipped = flipBoardLocale(params.lang, wantedBoard);

  const boardMembers = boardLanguageFlipped.filter(
    (member: any) => member.attributes.isBoardMember === true,
  );
  const officials = boardLanguageFlipped.filter(
    (member: any) => member.attributes.isBoardMember === false,
  );

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2">
        <h1>
          {dictionary.navigation.board} {wantedBoard.attributes.year}
        </h1>
        {!!otherBoards.length && (
          <div className="dropdown sm:dropdown-end">
            <div className="btn m-1" role="button" tabIndex={0}>
              {dictionary.pages_board.other_boards}
            </div>
            <ul
              className="menu dropdown-content z-[9999] w-52 rounded-box bg-base-100 p-2 shadow"
              tabIndex={0}
            >
              {otherBoards.map((year) => (
                <li key={year}>
                  <Link
                    href={`/${params.lang}/organization/board/${year === latestBoard.attributes.year.toString() ? '' : year}`}
                  >
                    {year}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        {Boolean(boardMembers.length) && (
          <>
            <h2 className="mb-6 text-3xl font-bold max-md:text-2xl">
              {dictionary.pages_board.board_members}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-y-12 lg:grid-cols-4">
              {boardMembers.map((member: any) => (
                <BoardMember
                  key={member.attributes.createdAt}
                  dictionary={dictionary}
                  member={member}
                  showEmail={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div>
        {Boolean(officials.length) && (
          <>
            <h2 className="mb-6 text-3xl font-bold max-md:text-2xl">
              {dictionary.pages_board.officials}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-y-12 lg:grid-cols-4">
              {officials.map((member: any) => (
                <BoardMember
                  key={member.attributes.createdAt}
                  dictionary={dictionary}
                  member={member}
                  showEmail={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: OldBoardProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);

  const boardData = await getStrapiData<
    APIResponseCollection<'api::board.board'>
  >(
    'fi',
    '/api/boards?populate[boardMembers][populate][boardRoles][populate]=localizations&populate[boardMembers][populate]=image',
    ['board', 'board-role', 'board-member'],
  );

  const boardGroupedByYear = groupBoardByYear(boardData.data);
  const wantedBoard = boardGroupedByYear[params.slug];

  const pathname = `/${params.lang}/organization/board/${params.slug}`;

  return {
    title: `${dictionary.navigation.board} ${wantedBoard.attributes.year} | Luuppi ry`,
    description: `${dictionary.pages_board.seo_description} ${wantedBoard.attributes.year}`,
    alternates: {
      canonical: pathname,
      languages: {
        fi: `/fi${pathname.slice(3)}`,
        en: `/en${pathname.slice(3)}`,
      },
    },
    openGraph: {
      title: `${dictionary.navigation.board} ${wantedBoard.attributes.year}`,
      description: `${dictionary.pages_board.seo_description} ${wantedBoard.attributes.year}`,
      url: pathname,
      siteName: 'Luuppi ry',
    },
    twitter: {
      title: `${dictionary.navigation.board} ${wantedBoard.attributes.year}`,
      description: `${dictionary.pages_board.seo_description} ${wantedBoard.attributes.year}`,
    },
  };
}

export async function generateStaticParams() {
  const boardData = await getStrapiData<
    APIResponseCollection<'api::board.board'>
  >(
    'fi',
    '/api/boards?populate[boardMembers][populate][boardRoles][populate]=localizations&populate[boardMembers][populate]=image',
    ['board', 'board-role', 'board-member'],
  );

  const boardGroupedByYear = groupBoardByYear(boardData.data);

  return Object.keys(boardGroupedByYear).map((year) => ({
    slug: year,
  }));
}
