import 'server-only';

const dictionaries = {
  en: () => import('./locales/en.json').then((module) => module.default),
  fi: () => import('./locales/fi.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'fi' | 'en') =>
  dictionaries[locale]();
