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
    ? ((data?.boardMembers as any)?.map((member: any) => {
        const flippedLocales = member?.boardRoles?.map((role: any) => {
          const localeEn = role?.localizations?.[0];
          return {
            ...role,
            ...localeEn,
          };
        });
        return {
          ...member,
          boardRoles: flippedLocales,
        };
      }) as APIResponseData<'api::board-member.board-member'>[])
    : (data?.boardMembers as any as APIResponseData<'api::board-member.board-member'>[]);

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
    ? (data.map((news) => {
        const localeEn = (news?.localizations as any)?.[0];
        return {
          ...news,
          ...localeEn,
          banner: news?.banner,
          authorImage: news?.authorImage,
          slug: news?.slug,
          Seo: {
            ...localeEn?.Seo,
          },
        };
      }) as APIResponseData<'api::news-single.news-single'>[])
    : (data as APIResponseData<'api::news-single.news-single'>[]);

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
    ? (data.map((publication) => {
        const localeEn = (publication?.localizations as any)?.[0];
        return {
          ...publication,
          attributes: {
            ...localeEn,
            id: publication.id,
            image: publication?.image,
            pdf: publication?.pdf,
            Seo: {
              ...localeEn?.Seo,
            },
          },
        };
      }) as APIResponseData<'api::luuppi-sanomat.luuppi-sanomat'>[])
    : (data as APIResponseData<'api::luuppi-sanomat.luuppi-sanomat'>[]);
