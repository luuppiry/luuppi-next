/** Example: "2021-01-01 14:00" */
export const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'Europe/Helsinki',
} as const;

/** @returns ISO 8601 calendar date (yyyy-mm-dd), does not account for tz */
export function toCalendarDate(date: Date | string): string {
  return (typeof date === 'string' ? date : date.toISOString()).split('T')[0];
}

export function isValidISOCalendarDate(str: string) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return false;
  }

  const [year, month, day] = str.split('-').map(Number);

  if (month < 1 || month > 12) {
    return false;
  }

  // Days in the month, accounting for leap years
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31,
    isLeap ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day >= 1 && day <= daysInMonth[month - 1];
}

/** Example: "14:00" */
export const shortTimeFormat: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Helsinki',
};

/** Example: "Mon, 1.1. 14:00" */
export const shortDateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Helsinki',
};

/**  Example: "Monday, 1. Jan" */
export const longDateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  timeZone: 'Europe/Helsinki',
};
