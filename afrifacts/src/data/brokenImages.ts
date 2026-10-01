/**
 * Image URLs that failed to load, so a card can stop pretending.
 *
 * `hasImage` answers from the data: the fact names a picture. It cannot
 * know the picture will arrive. Fourteen facts went live with Facebook and
 * Instagram links that hand a phone a login page instead of a photo, and
 * each drew a photo card with an empty photo and a credit for a picture
 * nobody could see. The studio now refuses those hosts, but a link can
 * also die later, on a site nobody controls.
 *
 * So the image reports its own failure here, and every card asks
 * `showsImage` instead of `hasImage`. A fact whose picture failed falls
 * back to the typographic card, which is a designed variant rather than
 * an error state, and drops a credit that would otherwise point at
 * nothing.
 *
 * Kept for the session, not stored. A link that was down this morning may
 * be back tonight, and the cost of finding out again is one failed
 * request per launch.
 */

import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { hasImage, type Fact, type FactImage } from '@/src/types';

let broken = new Set<string>();
const listeners = new Set<() => void>();

/*
  Who is asking, on every image request.

  Most of the corpus's photographs are on Wikimedia, which refuses
  requests whose User-Agent is a bare library name. Android's image loader
  sends `okhttp/4.x` by default, and Wikimedia answers that with a 403, so
  a phone got an empty photo where a browser got the picture. Wikimedia's
  policy asks for a name and a way to reach the app's maker, which is
  exactly this.

  Native only. On web, expo-image turns any `headers` into a cross-origin
  fetch, which works only where the server sends Access-Control-Allow-
  Origin. Wikimedia does; the news, blog and travel sites behind most
  web-search pictures do not, so every one of those failed in the browser
  and fell back to a text card. A browser will not let a page set
  User-Agent anyway, so on web there was nothing to gain and a plain
  `<img>` request is what loads them.
*/
const IMAGE_HEADERS = {
  'User-Agent': 'AfriFacts/1.0 (Android; https://bluehydralabs.com/)',
};

/** The `source` for an expo-image `Image`. Always use this, never a bare `{ uri }`. */
export function imageSource(url: string): { uri: string; headers?: Record<string, string> } {
  if (Platform.OS === 'web') return { uri: url };
  return { uri: url, headers: IMAGE_HEADERS };
}

/** Called from an image's `onError`. */
export function markImageBroken(url: string): void {
  if (broken.has(url)) return;
  // A new set each time: the snapshot is compared by identity.
  broken = new Set(broken).add(url);
  for (const listener of listeners) listener();
}

/** Does this fact have a picture that is not known to be broken? */
export function showsImage(fact: Fact): fact is Fact & { image: FactImage } {
  return hasImage(fact) && !broken.has(fact.image.url);
}

/**
 * Re-renders the caller when a picture fails, so a card already on screen
 * switches to its typographic layout instead of keeping the empty frame.
 */
export function useBrokenImages(): ReadonlySet<string> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => broken,
    () => broken,
  );
}
