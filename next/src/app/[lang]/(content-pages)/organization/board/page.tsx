import BoardMember from '@/components/BoardMember/BoardMember';
import { getDictionary } from '@/dictionaries';
import { flipBoardLocale, getStrapiData, groupByYear } from '@/lib';
import { SupportedLanguage } from '@/models/locale';
import { ApiBoardBoard } from '@/types/contentTypes';
import Link from 'next/link';

interface BoardProps {
  params: { lang: SupportedLanguage };
}

export default async function Board({ params }: BoardProps) {
  const dictionary = await getDictionary(params.lang);

  /**
   * TODO: This is by far the worst query in our codebase. Should be cached well
   * because basically we have board changes once a year. :D
   *
   * Localization doesn't matter because we have non i18n
   * collections (boards, boardMembers) and only boardRoles are localized.
   * Strapi doesn't support localized queries from non i18n collections. We
   * use workaround by populating boardRoles with localizations.
   */
  const boardData = await getStrapiData<ApiBoardBoard[]>(
    'fi',
    '/api/boards?populate[boardMembers][populate][boardRoles][populate]=localizations&populate[boardMembers][populate]=image',
    ['board', 'board-role', 'board-member'],
  );

  const boardGroupedByYear = groupByYear(boardData.data);
  const boardSortedByYear = Object.keys(boardGroupedByYear).sort(
    (a, b) => Number(b) - Number(a),
  );
  const latestBoard = boardGroupedByYear[boardSortedByYear[0]];
  const otherBoards = boardSortedByYear.filter(
    (year) => parseInt(year, 10) !== latestBoard.attributes.year,
  );

  const boardLanguageFlipped = flipBoardLocale(params.lang, latestBoard);

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
          {dictionary.navigation.board} {latestBoard.attributes.year}
        </h1>
        {Boolean(otherBoards.length) && (
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
                  <Link href={`/${params.lang}/organization/board/${year}`}>
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
