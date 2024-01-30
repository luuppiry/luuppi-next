import { SupportedLanguage } from '@/models/locale';

export default function flipLocale(lang: SupportedLanguage, data: any) {
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
