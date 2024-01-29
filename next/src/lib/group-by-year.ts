import { ApiBoardBoard } from '@/types/contentTypes';

export default function groupByYear(data: ApiBoardBoard[]) {
    const groupedData = data.reduce(
      (acc, item) => {
        const year = item.attributes.year;
        acc[year] = item;
        return acc;
      },
      {} as Record<string, ApiBoardBoard>,
    );

    return groupedData;
  }
