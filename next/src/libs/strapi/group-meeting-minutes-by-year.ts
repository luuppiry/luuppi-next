import { APIResponseData } from '@/types/types';
import 'server-only';

/**
 * Group meeting-minutes members by year
 * @param data meeting-minutes members data
 * @returns meeting-minutes members grouped by year
 */
export const groupMeetingMinutesByYear = (
  data: APIResponseData<'api::meeting-minutes-year.meeting-minutes-year'>[],
) => {
  const groupedData = data.reduce(
    (acc, item) => {
      const year = item.attributes.year;
      acc[year] = item;
      return acc;
    },
    {} as Record<string, APIResponseData<'api::meeting-minutes-year.meeting-minutes-year'>>,
  );

  return groupedData;
};