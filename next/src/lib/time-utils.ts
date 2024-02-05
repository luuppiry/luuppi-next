const dateFormat = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
} as const;

const shortDateFormat = {
  hour: '2-digit',
  minute: '2-digit',
} as const;

const longDateFormat = {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
} as const;

export { dateFormat, longDateFormat, shortDateFormat };
