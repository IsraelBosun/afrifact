/**
 * Which country's facts the feed is showing.
 *
 * It lived in the home screen as `useState('NG')` with no setter, and the
 * picker set a local variable and then navigated away — so choosing a
 * country did nothing at all, and the launch market was written into UI
 * code, which §10 forbids in as many words.
 *
 * Kept here rather than in a route param because two screens need it and
 * neither owns it: the picker writes, the feed reads, and the choice has
 * to outlive both.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const KEY = 'afrifacts.country.v1';

/*
  Null until something sets it, which is not the same as a default.

  The default cannot be a constant in this file: the right one is whichever
  country the corpus actually holds facts for, and this module has never
  seen the corpus. `initCountry` is how the data layer tells it, once, and
  only when the reader has not already chosen for themselves.
*/
let selected: string | null = null;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Read the stored choice. Called at launch, before `initCountry`. */
export async function loadCountry(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (typeof stored === 'string' && stored.length > 0) selected = stored;
  } catch {
    // No stored choice, then. `initCountry` will pick one.
  }
}

/**
 * Offer a default, which is taken only if the reader has not chosen.
 *
 * Called by `loadCorpus` with whichever country has the most facts. An
 * explicit choice always wins — including a choice of a country that has
 * since run out of content, because silently moving someone somewhere else
 * is worse than an empty feed they can see the reason for.
 */
export function initCountry(fallback: string): void {
  if (selected !== null) return;
  selected = fallback;
  emit();
}

export function getCountry(): string {
  // 'AFR' rather than a launch market: if this is ever read before the
  // corpus lands, everything is the honest answer and Nigeria is not.
  return selected ?? 'AFR';
}

export function setCountry(code: string): void {
  if (code === selected) return;
  selected = code;
  emit();
  AsyncStorage.setItem(KEY, code).catch(() => {
    // Kept for this session; re-chosen next launch.
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The selected country, re-rendering the caller when it changes. */
export function useCountry(): string {
  return useSyncExternalStore(subscribe, getCountry, getCountry);
}
