import { APIResponseData } from '@/types/types';
import 'server-only';

/**
 * Group board members by year
 * @param data Board members data
 * @returns Board members grouped by year
 */
export const groupBoardByYear = (
  data: APIResponseData<'api::board.board'>[],
) => {
  const groupedData = data.reduce(
    (acc, item) => {
      const year = item.attributes.year;
      acc[year] = item;
      return acc;
    },
    {} as Record<string, APIResponseData<'api::board.board'>>,
  );

  return groupedData;
};
