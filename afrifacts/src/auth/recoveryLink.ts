/**
 * The link a password-reset email opens, read into something usable.
 *
 * Pure string work with no imports, so it can be exercised in a bare Node
 * process the way `quiz/challenge.ts` is.
 *
 * The client uses Supabase's implicit flow, so the session arrives in the
 * fragment:
 *
 *   afrifacts://auth/reset-password#access_token=...&refresh_token=...&type=recovery
 *
 * and an expired or already-used link arrives as an error instead:
 *
 *   afrifacts://auth/reset-password#error=access_denied&error_description=Email+link+is+invalid
 *
 * Both the query and the fragment are read, so a later move to query
 * parameters keeps working without touching this file.
 */

export type RecoveryLink =
  | { type: 'recovery'; accessToken: string; refreshToken: string }
  | { type: 'error'; message: string };

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function paramsOf(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const start = url.search(/[?#]/);
  if (start === -1) return params;

  for (const pair of url.slice(start + 1).split(/[&?#]/)) {
    if (pair.length === 0) continue;
    const eq = pair.indexOf('=');
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    const value = eq === -1 ? '' : decode(pair.slice(eq + 1));
    // First one wins, so an empty fragment key cannot blank a query value.
    if (!(key in params)) params[key] = value;
  }
  return params;
}

/** A recovery session, the error the link carried, or null for any other link. */
export function parseRecoveryLink(url: string | null | undefined): RecoveryLink | null {
  if (typeof url !== 'string' || url.length === 0) return null;
  const params = paramsOf(url);

  if (params.error || params.error_description) {
    return {
      type: 'error',
      message: params.error_description || params.error || 'This reset link is no longer valid.',
    };
  }
  if (params.type === 'recovery' && params.access_token && params.refresh_token) {
    return {
      type: 'recovery',
      accessToken: params.access_token,
      refreshToken: params.refresh_token,
    };
  }
  return null;
}
