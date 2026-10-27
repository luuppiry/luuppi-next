import 'server-only';

import { inspect } from 'node:util';

/* eslint-disable no-console */
const LOGS_ENABLED = process.env.LOGS_ENABLED !== 'false';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const pad = (n: number) => String(n).padStart(2, '0');

const getFormattedDate = () => {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
};

const formatMessage = (parts: unknown[]) =>
  parts
    .map((p) => {
      if (p instanceof Error) return p.stack ?? `${p.name}: ${p.message}`;
      if (typeof p === 'string') return p;
      // Handles circular refs, BigInt, Map/Set, undefined, etc. without throwing
      return inspect(p, { depth: 5, colors: false, breakLength: 80 });
    })
    .join(' ');

type Level = 'info' | 'warn' | 'error';

const levels = {
  info: {
    color: colors.green,
    icon: '✓',
    label: 'INFO',
    out: console.log,
    colorMessage: false,
  },
  warn: {
    color: colors.yellow,
    icon: '⚠',
    label: 'WARN',
    out: console.warn,
    colorMessage: true,
  },
  error: {
    color: colors.red,
    icon: '✖',
    label: 'ERROR',
    out: console.error,
    colorMessage: true,
  },
};

const log = (level: Level, scope: string | undefined, parts: unknown[]) => {
  if (!LOGS_ENABLED) return;
  const { color, icon, label, out, colorMessage } = levels[level];
  const scopeStr = scope ? ` ${colors.yellow}[${scope}]${colors.reset}` : '';
  const message = formatMessage(parts);

  out(
    ` ${colors.bold}${color}${icon}${colors.reset}` +
      ` ${colors.dim}${getFormattedDate()}${colors.reset}` +
      ` ${color}${label}${colors.reset}${scopeStr}` +
      ` ${colorMessage ? color + message + colors.reset : message}`,
  );
};

const createLogger = (scope?: string) => ({
  info: (...m: unknown[]) => log('info', scope, m),
  warn: (...m: unknown[]) => log('warn', scope, m),
  error: (...m: unknown[]) => log('error', scope, m),
  /** Create a logger that prefixes every line with a scope, e.g. "api/users" */
  child: (name: string) => createLogger(scope ? `${scope}:${name}` : name),
});

/** Logger utility to log messages to the console */
export const logger = createLogger();
