export const i18n = {
  defaultLocale: 'fi',
  locales: ['en', 'fi'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
