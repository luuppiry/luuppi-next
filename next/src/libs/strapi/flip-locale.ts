import { APIResponseData } from '@/types/types';
import 'server-only';

/**
 * Strapi does not support direct localization in a case where we
 * have relations and everything is not localized. Workaround is to
 * populate localizations and then "flip" the locale.
 * @param lang 'en' or 'fi'
 * @param data Board members data
 * @returns Board members data with correct locale
 */
export const flipBoardLocale = (
  lang: string,
  data: APIResponseData<'api::board.board'>,
) =>
  lang === 'en'
    ? (data.boardMembers!?.map((member) => {
        const flippedLocales = member.boardRoles?.map((role) => {
          const localeEn = role.localizations;
          return {
            ...role,
            localeEn,
          };
        });
        return {
          ...member,
          boardRoles: flippedLocales,
        };
      }) as APIResponseData<'api::board-member.board-member'>[])
    : data.boardMembers;

/**
 * Strapi does not support direct localization in a case where we
 * have relations and everything is not localized. Workaround is to
 * populate localizations and then "flip" the locale.
 * @param lang 'en' or 'fi'
 * @param data News data
 * @returns News data with correct locale
 */
export const flipNewsLocale = (
  lang: string,
  data: APIResponseData<'api::news-single.news-single'>[],
) =>
  lang === 'en'
    ? (
        data.map((news) => {
          const localeEn = news.localizations?.[0];
          if (!localeEn) return null;
          return {
            ...news,
            ...localeEn,
            banner: news.banner,
            authorImage: news.authorImage,
            slug: news.slug,
            Seo: {
              ...localeEn?.Seo,
            },
          };
        }) as APIResponseData<'api::news-single.news-single'>[]
      )?.filter((news) => news)
    : data;

/**
 * Strapi does not support direct localization in a case where we
 * have relations and everything is not localized. Workaround is to
 * populate localizations and then "flip" the locale.
 * @param lang 'en' or 'fi'
 * @param data Sanomat data
 * @returns Sanomat data with correct locale
 */
export const flipSanomatLocale = (
  lang: string,
  data: APIResponseData<'api::luuppi-sanomat.luuppi-sanomat'>[],
) =>
  lang === 'en'
    ? (
        data.map((publication) => {
          const localeEn = publication.localizations?.[0];
          if (!localeEn) return null;
          return {
            ...publication,
            ...localeEn,
            Seo: {
              ...localeEn?.Seo,
            },
          };
        }) as APIResponseData<'api::luuppi-sanomat.luuppi-sanomat'>[]
      )?.filter((publication) => publication)
    : data;

/**
 * Strapi does not support direct localization in a case where we
 * have relations and everything is not localized. Workaround is to
 * populate localizations and then "flip" the locale.
 * @param lang 'en' or 'fi'
 * @param data Sanomat data
 * @returns Sanomat data with correct locale
 */
export const flipMeetingMinuteLocale = (
  lang: string,
  data: APIResponseData<'api::meeting-minute-document.meeting-minute-document'>[],
) =>
  lang === 'en'
    ? (
        data.map((publication) => {
          const localeEn = publication.localizations?.[0];
          if (!localeEn) return null;
          return {
            ...publication,
            attributes: {
              ...localeEn,
              id: publication.documentId,
              image: publication.image,
              pdf: publication.pdf,
              Seo: {
                ...localeEn?.Seo,
              },
            },
          };
        }) as APIResponseData<'api::meeting-minute-document.meeting-minute-document'>[]
      )?.filter((publication) => publication)
    : data;
