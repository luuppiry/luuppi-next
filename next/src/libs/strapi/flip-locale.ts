import { SupportedLanguage } from '@/models/locale';
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
  lang: SupportedLanguage,
  data: APIResponseData<'api::board.board'>,
) =>
  lang === 'en'
    ? (data.attributes.boardMembers!?.data.map((member) => {
        const flippedLocales = member.attributes.boardRoles?.data.map(
          (role: any) => {
            const localeEn = role.attributes.localizations.data[0];
            return {
              ...role,
              attributes: localeEn.attributes,
            };
          },
        );
        return {
          ...member,
          attributes: {
            ...member.attributes,
            boardRoles: {
              data: flippedLocales,
            },
          },
        };
      }) as APIResponseData<'api::board-member.board-member'>[])
    : data.attributes.boardMembers!?.data;

/**
 * Strapi does not support direct localization in a case where we
 * have relations and everything is not localized. Workaround is to
 * populate localizations and then "flip" the locale.
 * @param lang 'en' or 'fi'
 * @param data News data
 * @returns News data with correct locale
 */
export const flipNewsLocale = (
  lang: SupportedLanguage,
  data: APIResponseData<'api::news-single.news-single'>[],
) =>
  lang === 'en'
    ? (
        data.map((news) => {
          const localeEn = news.attributes.localizations?.data[0];
          if (!localeEn) return null;
          return {
            ...news,
            attributes: {
              ...localeEn?.attributes,
              banner: news.attributes.banner,
              authorImage: news.attributes.authorImage,
              slug: news.attributes.slug,
              Seo: {
                ...localeEn?.attributes.Seo,
              },
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
  lang: SupportedLanguage,
  data: APIResponseData<'api::luuppi-sanomat.luuppi-sanomat'>[],
) =>
  lang === 'en'
    ? (
        data.map((publication) => {
          const localeEn = publication.attributes.localizations?.data[0];
          if (!localeEn) return null;
          return {
            ...publication,
            attributes: {
              ...localeEn?.attributes,
              id: publication.id,
              image: publication.attributes.image,
              pdf: publication.attributes.pdf,
              Seo: {
                ...localeEn?.attributes.Seo,
              },
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
  lang: SupportedLanguage,
  data: APIResponseData<'api::meeting-minute-document.meeting-minute-document'>[],
) =>
  lang === 'en'
    ? (
        data.map((publication) => {
          const localeEn = publication.attributes.localizations?.data[0];
          if (!localeEn) return null;
          return {
            ...publication,
            attributes: {
              ...localeEn?.attributes,
              id: publication.id,
              image: publication.attributes.image,
              pdf: publication.attributes.pdf,
              Seo: {
                ...localeEn?.attributes.Seo,
              },
            },
          };
        }) as APIResponseData<'api::meeting-minute-document.meeting-minute-document'>[]
      )?.filter((publication) => publication)
    : data;
