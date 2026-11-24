const SKEW_PATTERNS = [
  /module factory is not available/i, // Turbopack
  /failed to load chunk/i, // Turbopack
  /failed to fetch dynamically imported module/i, // Chrome
  /error loading dynamically imported module/i, // Firefox
  /importing a module script failed/i, // Safari
  // FIXME: remove this when https://github.com/vercel/next.js/issues/97337 is solved
  /minified react error #412|connection closed/i,
];

const STORAGE_KEY = 'skew-recovered-at';
const LOOP_WINDOW_MS = 10_000;

export function isSkewError(error: unknown): boolean {
  const text =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? `${error.name}: ${error.message}`
        : '';
  return SKEW_PATTERNS.some((p) => p.test(text));
}

/** Returns true if a reload was triggered. */
export function tryRecoverFromSkew(error: unknown): boolean {
  if (!isSkewError(error)) return false;

  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) ?? 0);
    // Reloaded very recently and it still fails
    if (Date.now() - last < LOOP_WINDOW_MS) return false;
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage blocked: can't guard against a loop, so don't reload
    return false;
  }

  window.location.reload();
  return true;
}
