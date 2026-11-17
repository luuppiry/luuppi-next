const SKEW_PATTERNS = [
  /module factory is not available/i, // Turbopack
  /failed to load chunk/i, // Turbopack
  /failed to fetch dynamically imported module/i, // Chrome
  /error loading dynamically imported module/i, // Firefox
  /importing a module script failed/i, // Safari
];

const STORAGE_KEY = 'skew-recovered-deployment';

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

  // The deployment id baked into the *currently running* bundle
  const deploymentId = process.env.NEXT_DEPLOYMENT_ID ?? 'unknown';

  try {
    // Already tried a reload for this build and it still fails -> don't loop
    if (sessionStorage.getItem(STORAGE_KEY) === deploymentId) return false;
    sessionStorage.setItem(STORAGE_KEY, deploymentId);
  } catch {
    // Storage blocked: we can't guard against a loop, so don't reload
    return false;
  }

  window.location.reload();
  return true;
}
