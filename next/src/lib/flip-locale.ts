import { SupportedLanguage } from '@/models/locale';
import { ApiBlogBlog } from '@/types/contentTypes';

function flipBoardLocale(lang: SupportedLanguage, data: any) {
  return lang === 'en'
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
}

function flipBlogLocale(lang: SupportedLanguage, data: ApiBlogBlog[]) {
  return lang === 'en'
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
}

export { flipBlogLocale, flipBoardLocale };
