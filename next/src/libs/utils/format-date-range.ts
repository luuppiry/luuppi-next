import { longDateFormat, shortDateFormat, shortTimeFormat } from '../constants';
import { firstLetterToUpperCase } from './first-letter-uppercase';

export const formatDateRangeLong = (
  start: Date,
  end: Date,
  lang: string,
): string => {
  const startUTC = new Date(
    start.getTime() + start.getTimezoneOffset() * 60000,
  );

  const endUTC = new Date(end.getTime() + end.getTimezoneOffset() * 60000);

  const isMultipleDays = startUTC.toDateString() !== endUTC.toDateString();

  if (!isMultipleDays) {
    if (start.toISOString() === end.toISOString()) {
      return `${firstLetterToUpperCase(
        new Intl.DateTimeFormat(lang, {
          hour: 'numeric',
          minute: 'numeric',
          day: 'numeric',
          month: 'short',
          weekday: 'long',
          timeZone: 'Europe/Helsinki',
        }).format(start),
      )}`;
    }

    return `${firstLetterToUpperCase(
      start.toLocaleString(lang, longDateFormat),
    )} - ${start.toLocaleString(lang, shortTimeFormat)}-${end.toLocaleString(lang, shortTimeFormat)}`;
  }

  return `${firstLetterToUpperCase(
    start.toLocaleString(lang, shortDateFormat),
  )} - ${firstLetterToUpperCase(end.toLocaleString(lang, shortDateFormat))}`;
};

export const formatDateRangeShort = (
  start: Date,
  end: Date,
  lang: string,
): string => {
  const startUTC = new Date(
    start.getTime() + start.getTimezoneOffset() * 60000,
  );
  const endUTC = new Date(end.getTime() + end.getTimezoneOffset() * 60000);
  if (start.toISOString() === end.toISOString()) {
    return `${new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Europe/Helsinki',
    }).format(start)}`;
  }
  if (startUTC.toDateString() === endUTC.toDateString()) {
    return `${new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Europe/Helsinki',
    }).format(start)} - ${new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Europe/Helsinki',
    }).format(end)}`;
  } else {
    return `${new Intl.DateTimeFormat(lang, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Europe/Helsinki',
    }).format(start)} - ${new Intl.DateTimeFormat(lang, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Europe/Helsinki',
    }).format(end)}`;
  }
};
