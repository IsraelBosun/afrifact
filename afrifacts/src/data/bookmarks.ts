/**
 * What the reader has saved, kept on the device.
 *
 * This used to be a `Record<string, boolean>` in the home screen's own
 * state, which meant a bookmark did not survive leaving the tab, and the
 * Saved tab — which returned the entire corpus — could not see it either.
 * The button and the tab that button feeds were two unrelated pieces of
 * code.
 *
 * WHY IT IS NOT IN THE CORPUS CACHE
 *
 * `cache.ts` is throwaway: a `Fact` shape change makes the whole entry
 * unreachable on purpose, because a stale fact is worse than a refetch.
 * Saves are the opposite — they are the only thing in the app the user
 * made themselves, and losing them to a content migration would be
 * unforgivable. Different lifetime, different key, different file.
 *
 * ORDER
 *
 * Newest first, so the Saved tab opens on what you just kept rather than
 * on whatever happens to sit earliest in the corpus. That is why this is
 * an array with a Set beside it rather than a Set alone.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const KEY = 'afrifacts.saved.v1';

/** Newest first. */
let order: string[] = [];
let lookup = new Set<string>();

const listeners = new Set<() => void>();

/*
  A stable reference between changes.

  `useSyncExternalStore` compares snapshots by identity and will loop
  forever if handed a fresh array every render, so the snapshot is rebuilt
  when the data changes and at no other time.
*/
let snapshot: readonly string[] = order;

function commit() {
  lookup = new Set(order);
  snapshot = order;
  for (const listener of listeners) listener();
  AsyncStorage.setItem(KEY, JSON.stringify(order)).catch(() => {
    /*
      A save that cannot be written is still a save for this session. The
      alternative — refusing the bookmark because the disk is full — is a
      worse answer to a tap than quietly keeping it in memory.
    */
  });
}

/**
 * Read the saved list off the device. Called once, at launch.
 *
 * Never throws, for the same reason `readCache` never does: every failure
 * here means the same thing, which is that there is nothing saved yet.
 */
export async function loadBookmarks(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    order = parsed.filter((id): id is string => typeof id === 'string');
    lookup = new Set(order);
    snapshot = order;
  } catch {
    // No saves, then.
  }
}

export function isSaved(id: string): boolean {
  return lookup.has(id);
}

/** Save if it is not saved, unsave if it is. Returns the state it landed in. */
export function toggleSaved(id: string): boolean {
  const nowSaved = !lookup.has(id);
  // A new array each time, never a mutation: the snapshot is compared by
  // identity, so mutating in place would change nothing on screen.
  order = nowSaved ? [id, ...order] : order.filter((saved) => saved !== id);
  commit();
  return nowSaved;
}

export function savedIds(): readonly string[] {
  return snapshot;
}

/**
 * Replace the whole list. Newest first, as everywhere else.
 *
 * Only `sync.ts` calls this: after merging the account's saves with the
 * phone's, and with an empty list when someone signs out. Duplicates are
 * dropped here so a merge that got one wrong cannot show a fact twice.
 */
export function replaceSaved(ids: readonly string[]): void {
  order = [...new Set(ids)];
  commit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The saved ids, re-rendering whatever calls it when they change.
 *
 * A hook rather than a context because there is no tree to scope this to:
 * the feed, the Saved tab and the profile all want the same one list, and
 * a provider would only be a wrapper that never varies.
 */
export function useSavedIds(): readonly string[] {
  return useSyncExternalStore(subscribe, savedIds, savedIds);
}
