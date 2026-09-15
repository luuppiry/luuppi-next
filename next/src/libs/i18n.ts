const SUPPORTED_LANGUAGES = ['fi', 'en'] as const;

export const validLanguage = (locale: string): locale is 'fi' | 'en' => {
  if (!locale) return false;
  if (typeof locale !== 'string') return false;

  return (<ReadonlyArray<string>>SUPPORTED_LANGUAGES).includes(locale);
};
