/**
 * The two strings a challenge needs from the environment.
 *
 * Kept apart from `challenge.ts` so the codec there stays pure. See the
 * note above `message()` for why that separation is worth a second file.
 */

import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/**
 * A link that opens the challenge route.
 *
 * `createURL` picks the right scheme for where the app is running, so the
 * same call gives `exp://…` under Expo Go and `afrifacts://…` in the
 * store build. Hardcoding the scheme would produce links that work only
 * in the build they were generated from.
 */
export function challengeLink(code: string, name: string): string {
  const queryParams: Record<string, string> = { c: code };
  if (name.trim().length > 0) queryParams.n = name.trim();
  return Linking.createURL('/quiz/challenge', { queryParams });
}

/**
 * The store listing.
 *
 * Built from the package name in `app.json` so it cannot drift from what
 * is actually shipped. It resolves the day the listing is published, and
 * until then it is the same promise the share card footer already makes.
 */
export function storeUrl(): string {
  const pkg = Constants.expoConfig?.android?.package ?? 'com.israelbosun.afrifacts';
  return `https://play.google.com/store/apps/details?id=${pkg}`;
}
