import 'server-only';
import { SupportedLanguage } from './models/locale';

const dictionaries = {
  en: () => import('./locales/en.json').then((module) => module.default),
  fi: () => import('./locales/fi.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const supportedLocales = ['fi', 'en'];
  if (!supportedLocales.includes(locale as SupportedLanguage)) {
    locale = 'fi';
  }
  return dictionaries[locale as 'fi' | 'en']();
};
