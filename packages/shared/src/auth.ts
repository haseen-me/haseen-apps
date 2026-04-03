const AUTH_STORAGE_KEY = 'haseen-auth';
const ACCOUNTS_URL = '/accounts';

/**
 * Check if the user has a valid auth token in localStorage.
 * Returns the token if present, null otherwise.
 */
export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

/**
 * Redirect to the accounts app sign-in page if not authenticated.
 * Call this on app mount for mail/drive/calendar apps.
 * Returns true if authenticated, false if redirecting.
 */
export function requireAuth(): boolean {
  if (getStoredToken()) return true;
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${ACCOUNTS_URL}/sign-in?returnTo=${returnUrl}`;
  return false;
}
