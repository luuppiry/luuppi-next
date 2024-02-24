import { SupportedLanguage } from '@/models/locale';
import { ApiBlogBlog } from '@/types/contentTypes';

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
 * @param data Blog data
 * @returns Blog data with correct locale
 */
export const flipBlogLocale = (lang: SupportedLanguage, data: ApiBlogBlog[]) =>
  lang === 'en'
    ? data.map((blog) => {
        const localeEn = blog.attributes.localizations.data[0];
        return {
          ...blog,
          attributes: {
            ...localeEn.attributes,
            banner: blog.attributes.banner,
            authorImage: blog.attributes.authorImage,
            slug: blog.attributes.slug,
          },
        };
      })
    : data;
