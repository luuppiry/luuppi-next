import { SupportedLanguage } from '@/models/locale';
import { longDateFormat, shortDateFormat, shortTimeFormat } from '../constants';
import { firstLetterToUpperCase } from './first-letter-uppercase';

export const formatDateRange = (
  start: Date,
  end: Date,
  lang: SupportedLanguage,
): string => {
  const isMultipleDays = start.getDate() !== end.getDate();

  if (!isMultipleDays) {
    return `${firstLetterToUpperCase(start.toLocaleString(lang, longDateFormat))} - ${start.toLocaleString(lang, shortTimeFormat)}-${end.toLocaleString(lang, shortTimeFormat)}`;
  }

  return `${firstLetterToUpperCase(start.toLocaleString(lang, shortDateFormat))} - ${firstLetterToUpperCase(end.toLocaleString(lang, shortDateFormat))}`;
};
