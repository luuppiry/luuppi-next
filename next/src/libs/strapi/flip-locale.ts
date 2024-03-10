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
export const flipBoardLocale = (lang: SupportedLanguage, data: any) =>
  lang === 'en'
    ? data.attributes.boardMembers.data.map((member: any) => {
        const flippedLocales = member.attributes.boardRoles.data.map(
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
      })
    : data.attributes.boardMembers.data;

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
    ? data.map((news) => {
        const localeEn = news.attributes.localizations?.data[0];
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
      })
    : data;
