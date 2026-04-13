const ACCOUNTS_URL = '/accounts';

/**
 * Returns true if the browser has a valid auth session (HTTP-only cookie).
 * Uses the identity service `/me` endpoint with credentials.
 */
export async function hasSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Redirect to the accounts app sign-in page if not authenticated.
 * Call this on app mount for mail/drive/calendar apps.
 * Returns true if authenticated, false if redirecting.
 */
export async function requireAuth(): Promise<boolean> {
  if (await hasSession()) return true;
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${ACCOUNTS_URL}/sign-in?returnTo=${returnUrl}`;
  return false;
}
