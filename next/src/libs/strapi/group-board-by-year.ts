import { ApiBoardBoard } from '@/types/contentTypes';
import 'server-only';

/**
 * Group board members by year
 * @param data Board members data
 * @returns Board members grouped by year
 */
export const groupBoardByYear = (data: ApiBoardBoard[]) => {
  const groupedData = data.reduce(
    (acc, item) => {
      const year = item.attributes.year;
      acc[year] = item;
      return acc;
    },
    {} as Record<string, ApiBoardBoard>,
  );

  return groupedData;
};
