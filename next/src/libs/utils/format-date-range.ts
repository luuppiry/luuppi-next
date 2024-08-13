import { SupportedLanguage } from '@/models/locale';
import { longDateFormat, shortDateFormat, shortTimeFormat } from '../constants';
import { firstLetterToUpperCase } from './first-letter-uppercase';

export const formatDateRangeLong = (
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

export const formatDateRangeShort = (
  start: Date,
  end: Date,
  lang: SupportedLanguage,
): string => {
  if (start.getDate() === end.getDate()) {
    return `${new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(start)} - ${new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(end)}`;
  } else {
    return `${new Intl.DateTimeFormat(lang, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(start)} - ${new Intl.DateTimeFormat(lang, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(end)}`;
  }
};
