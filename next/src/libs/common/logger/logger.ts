/* eslint-disable no-console */
const LOGS_ENABLED = process.env.NODE_ENV === 'development';

const getFormattedDate = () => {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

const formatMessage = (message: any[]) =>
  message
    .map((m) => {
      if (m instanceof Error) {
        return m.stack;
      }
      if (typeof m === 'object') {
        return JSON.stringify(m, null, 2);
      }
      return m;
    })
    .join(', ');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Logger utility to log messages to the console.
 */
export const logger = {
  info: (...message: any[]) => {
    console.log(process.env.NODE_ENV);
    if (!LOGS_ENABLED) return;
    console.log(
      `${colors.green}✓${colors.reset} ${getFormattedDate()} ${colors.green}[INFO]${colors.reset} ${formatMessage(message)}`,
    );
  },
  warn: (...message: any[]) => {
    if (!LOGS_ENABLED) return;
    console.log(
      `${colors.yellow}⚠${colors.reset} ${getFormattedDate()} ${colors.yellow}[WARN]${colors.reset} ${formatMessage(message)}`,
    );
  },
  error: (...message: any[]) => {
    if (!LOGS_ENABLED) return;
    console.log(
      `${colors.red}✖${colors.reset} ${getFormattedDate()} ${colors.red}[ERROR]${colors.reset} ${formatMessage(message)}`,
    );
  },
};
