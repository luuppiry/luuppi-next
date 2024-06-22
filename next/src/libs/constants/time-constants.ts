/** Example: "2021-01-01 14:00" */
export const dateFormat = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
} as const;

/** Example: "14:00" */
export const shortTimeFormat = {
  hour: '2-digit',
  minute: '2-digit',
} as const;

/** Example: "Mon, 1.1. 14:00" */
export const shortDateFormat = {
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
} as const;

/**  Example: "Monday, 1. Jan" */
export const longDateFormat = {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
} as const;
