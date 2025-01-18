/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  singleQuote: true,
  trailingComma: 'all',
  endOfLine: 'auto',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
