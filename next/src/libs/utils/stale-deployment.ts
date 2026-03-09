/**
 * Utilities for detecting and recovering from stale-deployment errors.
 *
 * When the browser has a cached build (common in PWA / standalone display
 * mode) and a new deployment is made, two classes of errors can occur:
 *
 * 1. ChunkLoadError – client-side navigation tries to fetch new content-hashed
 *    JS/CSS chunks that the old bundle references are unaware of (404).
 * 2. Server-action mismatch – Next.js embeds `deploymentId` in action URLs;
 *    the new server rejects calls from the old client.
 *
 * The recovery strategy is a hard reload so the browser fetches the fresh
 * bundle. A sessionStorage counter prevents infinite reload loops when the
 * error persists after refresh (which would indicate a genuine bug).
 */

export function isStaleDeploymentError(
  error: Error & { digest?: string },
): boolean {
  if (error.name === 'ChunkLoadError') return true;
  const msg = error.message ?? '';
  if (msg.includes('Failed to fetch dynamically imported module')) return true;
  if (msg.includes('error loading dynamically imported module')) return true;
  if (/Loading chunk \d+ failed/.test(msg)) return true;
  return false;
}

const RELOAD_COUNT_KEY = 'luuppi_stale_reload_count';
const MAX_RELOADS = 2;

/**
 * Reset the reload counter after a successful render.
 *
 * Call this once per successful page mount so that a future stale-deployment
 * error in the same browser session is still recoverable.
 */
export function resetReloadCount(): void {
  try {
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
  } catch {
    // sessionStorage unavailable in some private-browsing edge cases
  }
}

/**
 * Reload the page if this looks like a stale-deployment error AND we have not
 * already reloaded too many times in this session (loop guard).
 *
 * Returns `true` when a reload was triggered (caller can skip further logic).
 */
export function reloadIfStale(error: Error & { digest?: string }): boolean {
  if (!isStaleDeploymentError(error)) return false;
  try {
    const count = parseInt(
      sessionStorage.getItem(RELOAD_COUNT_KEY) ?? '0',
      10,
    );
    if (count < MAX_RELOADS) {
      sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
      window.location.reload();
      return true;
    }
  } catch {
    // sessionStorage unavailable in some private-browsing edge cases
  }
  return false;
}
