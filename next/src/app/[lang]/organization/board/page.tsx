import BoardMember from '@/components/BoardMember/BoardMember';
import { getDictionary } from '@/dictionaries';
import getStrapiData from '@/lib/get-strapi-data';
import groupByYear from '@/lib/group-by-year';
import { SupportedLanguage } from '@/models/locale';
import { ApiBoardBoard } from '@/types/contentTypes';
import Link from 'next/link';

export default async function Board({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
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
  );

  const boardGroupedByYear = groupByYear(boardData.data);
  const boardSortedByYear = Object.keys(boardGroupedByYear).sort(
    (a, b) => Number(b) - Number(a),
  );
  const latestBoard = boardGroupedByYear[boardSortedByYear[0]];
  const otherBoards = boardSortedByYear.filter(
    (year) => parseInt(year, 10) !== latestBoard.attributes.year,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="mb-14 text-5xl font-extrabold max-md:text-4xl">
          {dictionary.navigation.board}
        </h1>
        {Boolean(otherBoards.length) && (
          <div className="dropdown">
            <div className="btn m-1" role="button" tabIndex={0}>
              {dictionary.pages_board.other_boards}
            </div>
            <ul
              className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
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
      <div className="grid grid-cols-2 gap-12 lg:grid-cols-3">
        {latestBoard.attributes.boardMembers.data.map((member: any) => (
          <BoardMember
            key={member.attributes.createdAt}
            dictionary={dictionary}
            member={member}
          />
        ))}
      </div>
    </div>
  );
}
