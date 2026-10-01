/**
 * The signed-in session, and what changing it does to the phone.
 *
 * Signing in merges this phone's progress into the account. Signing out
 * sends anything outstanding and then hands the phone back empty. Screens
 * see only the session and the calls; the consequences live here, so no
 * screen can sign someone out and forget to clear their streak.
 */

import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { adoptAccount, forgetAccount, syncNow } from '@/src/data/sync';

import * as account from './account';

export interface Auth {
  /** False in a build with no Supabase configured. Hide every account control. */
  available: boolean;
  /** True until the stored session has been read at launch. */
  loading: boolean;
  /** A call is in flight. Forms disable their button on it. */
  busy: boolean;
  session: Session | null;
  email: string | null;
  signedIn: boolean;
  signIn(email: string, password: string): Promise<account.Result>;
  signUp(email: string, password: string): Promise<account.Result<{ needsConfirmation?: boolean }>>;
  /**
   * Sends outstanding progress first. If that fails it stops and says so,
   * unless `force` is set, because signing out wipes the phone and an
   * unsent quiz run would be gone for good.
   */
  signOut(force?: boolean): Promise<account.Result>;
  sendPasswordReset(email: string): Promise<account.Result>;
  beginRecovery(accessToken: string, refreshToken: string): Promise<account.Result>;
  completePasswordReset(password: string): Promise<account.Result>;
}

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(account.accountsAvailable);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!account.accountsAvailable) return undefined;
    account
      .getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
    return account.onSessionChange(setSession);
  }, []);

  /** Runs a call with `busy` set, whatever it returns. */
  const withBusy = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setBusy(true);
    try {
      return await work();
    } finally {
      setBusy(false);
    }
  }, []);

  const signIn = useCallback(
    (email: string, password: string) =>
      withBusy(async () => {
        const result = await account.signIn(email, password);
        if (result.error === undefined) await adoptAccount();
        return result;
      }),
    [withBusy],
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      withBusy(async () => {
        const result = await account.signUp(email, password);
        if (result.error !== undefined) return result;
        // With confirmation on there is no session yet and nothing to sync
        // to. The phone's progress waits, untouched, for the first log in.
        if (!result.needsConfirmation) await adoptAccount();
        return result;
      }),
    [withBusy],
  );

  const signOut = useCallback(
    (force = false) =>
      withBusy(async (): Promise<account.Result> => {
        const synced = await syncNow();
        if (!synced && !force) {
          return {
            error: 'Your latest progress has not reached your account yet. Connect and try again.',
          };
        }
        const result = await account.signOut();
        if (result.error !== undefined && !force) return result;
        await forgetAccount();
        return {};
      }),
    [withBusy],
  );

  const beginRecovery = useCallback(
    (accessToken: string, refreshToken: string) => account.beginRecovery(accessToken, refreshToken),
    [],
  );

  /*
    Mirrors sign-in. Someone resetting a forgotten password on a new phone
    is a returning reader, and their progress should be there the moment
    the new password is.
  */
  const completePasswordReset = useCallback(
    (password: string) =>
      withBusy(async () => {
        const result = await account.updatePassword(password);
        if (result.error === undefined) await adoptAccount();
        return result;
      }),
    [withBusy],
  );

  const value = useMemo<Auth>(
    () => ({
      available: account.accountsAvailable,
      loading,
      busy,
      session,
      email: session?.user.email ?? null,
      signedIn: session !== null,
      signIn,
      signUp,
      signOut,
      sendPasswordReset: account.sendPasswordReset,
      beginRecovery,
      completePasswordReset,
    }),
    [loading, busy, session, signIn, signUp, signOut, beginRecovery, completePasswordReset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (auth === null) throw new Error('useAuth must be used inside AuthProvider');
  return auth;
}
