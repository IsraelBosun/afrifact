/**
 * The Supabase client, for accounts and nothing else.
 *
 * `remote.ts` still reads the corpus over plain fetch with the anon key,
 * and that is deliberate: the facts are public, and the feed must not
 * depend on whether anybody is signed in. This client exists because
 * sessions are the part of Supabase not worth rewriting by hand. A
 * session is a short-lived token plus a refresh token, and keeping one
 * alive across app restarts, sleeps and expiries is exactly what the
 * library does and a fetch wrapper would get subtly wrong.
 *
 * THE PROJECT IS SHARED
 *
 * This is the same Supabase project as Native Pandas, with one login
 * across both apps. Everything AfriFacts stores lives in the `afrifacts`
 * schema, which is why the client is pinned to it below: a query here can
 * never land in Pandas' tables in `public` by accident.
 *
 * With no URL or key configured the client is null and the app runs
 * exactly as it did before accounts existed. Every caller checks.
 */

import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const URL_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SCHEMA = process.env.EXPO_PUBLIC_SUPABASE_SCHEMA ?? 'afrifacts';

/*
  The web build is pre-rendered in Node, where there is no `window`. The
  client reads its stored session the moment it is created, and on web
  AsyncStorage is `window.localStorage`, so creating it there crashes the
  render. Nobody is signed in to a page being rendered on a server, so
  there the client simply does not exist, and the browser makes its own
  when the page loads.
*/
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase =
  !isServerRender && URL_BASE.startsWith('https://') && ANON_KEY.length > 0
    ? createClient(URL_BASE, ANON_KEY, {
        db: { schema: SCHEMA },
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // The reset link is read by `recoveryLink.ts` and installed by
          // hand. There is no browser URL for the library to inspect.
          detectSessionInUrl: false,
        },
      })
    : null;

/*
  Refresh only while the app is in front.

  A backgrounded React Native app has its timers frozen, so the refresh
  the library schedules can come due while nothing is running and fire
  late, after the token has already expired. Stopping on background and
  restarting on foreground makes the first thing the app does on return
  a refresh, which is what Supabase's own React Native guide recommends.
*/
if (supabase !== null) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
