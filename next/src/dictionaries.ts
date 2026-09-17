import 'server-only';
import { lang } from 'next/root-params';

const dictionaries = {
  en: () => import('./locales/en.json').then((module) => module.default),
  fi: () => import('./locales/fi.json').then((module) => module.default),
};

/** Get the dictionary for the current locale, this uses the root layout (i.e. [lang]) by default */
export const getDictionary = async (localeOverride?: string) => {
  let locale = localeOverride || (await lang());

  const supportedLocales = ['fi', 'en'];
  if (!supportedLocales.includes(locale)) {
    locale = 'fi';
  }
  return dictionaries[locale as keyof typeof dictionaries]();
};
