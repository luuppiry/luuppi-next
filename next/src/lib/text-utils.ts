/**
 * Converts first letter of a string to uppercase. Useful for
 * finnish month names.
 * @param str string to be converted
 * @returns string with first letter in uppercase
 */
export const firstLetterToUpperCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
