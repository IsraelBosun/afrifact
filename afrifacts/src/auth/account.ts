/**
 * Accounts, as calls a form can make.
 *
 * A thin layer over `supabase.auth`. Accounts are optional: with no
 * Supabase configured, or nobody signed in, the app is exactly as local as
 * it always was, and §10 still holds, because nothing here stands between
 * anyone and the first fact.
 *
 * Every function returns `{ error }` with a sentence for the reader rather
 * than throwing, because every caller is a form that needs to show it.
 */

import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from './client';

export const accountsAvailable = supabase !== null;

export type Result<T = object> = ({ error?: undefined } & T) | { error: string };

const NOT_CONFIGURED = 'Accounts are not available in this build.';

/*
  Supabase's messages are written for developers ("Invalid login
  credentials", "AuthApiError: ..."). These are the ones readers hit.

  "Already registered" is worded for the shared login: the project serves
  more than one app, so the account an email belongs to may have been made
  somewhere other than AfriFacts, and the password that opens it is the
  one chosen there.
*/
function friendly(error: { message?: string } | null | undefined): string {
  const message = error?.message ?? 'Something went wrong. Try again.';
  if (/invalid login credentials/i.test(message)) {
    return 'That email and password do not match.';
  }
  if (/user already registered/i.test(message)) {
    return 'That email already has an account, possibly from another of our apps. Log in with its password instead.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Confirm your email first. The link is in your inbox.';
  }
  if (/password should be at least/i.test(message)) {
    return 'Passwords need at least 6 characters.';
  }
  if (/email.*invalid|invalid.*email/i.test(message)) {
    return 'That does not look like an email address.';
  }
  if (/rate limit|too many/i.test(message)) {
    return 'Too many tries. Wait a minute and try again.';
  }
  if (/new password should be different/i.test(message)) {
    return 'The new password has to be different from the old one.';
  }
  if (/auth session missing|session.*not.*found|invalid.*(jwt|token)|expired/i.test(message)) {
    return 'This reset link has expired. Ask for a new one from the log in screen.';
  }
  if (/network|fetch/i.test(message)) {
    return 'No connection. Your progress is safe on this phone. Try again later.';
  }
  return message;
}

export async function getSession(): Promise<Session | null> {
  if (supabase === null) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/** Sign in, sign out and token refresh. Returns the unsubscribe. */
export function onSessionChange(callback: (session: Session | null) => void): () => void {
  if (supabase === null) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session ?? null));
  return () => data.subscription.unsubscribe();
}

/**
 * With email confirmation on in the dashboard, sign-up returns a user and
 * no session. The caller tells them to check their inbox.
 *
 * The confirmation link is pointed back at this app. Without it Supabase
 * falls back to the project's Site URL, and the project is shared, so
 * that could be another app's address.
 */
export async function signUp(
  email: string,
  password: string,
): Promise<Result<{ needsConfirmation: boolean }>> {
  if (supabase === null) return { error: NOT_CONFIGURED };
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: Linking.createURL('/') },
  });
  if (error) return { error: friendly(error) };
  return { needsConfirmation: data.session === null };
}

export async function signIn(email: string, password: string): Promise<Result> {
  if (supabase === null) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { error: friendly(error) };
  return {};
}

export async function signOut(): Promise<Result> {
  if (supabase === null) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.signOut();
  if (error) return { error: friendly(error) };
  return {};
}

/**
 * The email links back into the app through the `afrifacts://` scheme,
 * landing on the reset screen with a short-lived session attached. The
 * address must be on the project's allow list (Authentication, URL
 * Configuration, Redirect URLs, as `afrifacts://**`) or Supabase ignores
 * it and sends the reader to the Site URL instead.
 */
export async function sendPasswordReset(email: string): Promise<Result> {
  if (supabase === null) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Linking.createURL('auth/reset-password'),
  });
  if (error) return { error: friendly(error) };
  return {};
}

/** Install the session a recovery link carried, so the password change is authorised. */
export async function beginRecovery(accessToken: string, refreshToken: string): Promise<Result> {
  if (supabase === null) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) return { error: friendly(error) };
  return {};
}

export async function updatePassword(password: string): Promise<Result> {
  if (supabase === null) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error) };
  return {};
}
