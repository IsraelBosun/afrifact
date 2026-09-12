/**
 * How many questions a run asks.
 *
 * Section 4.3 specified three, under thirty seconds, and said long packs
 * come later. This is later: three is still the default and still what the
 * quiz card in the feed offers, but a reader who wants to keep going
 * should not have to leave and come back to do it.
 *
 * Persisted, because it is a preference rather than a fact about a run.
 * Somebody who picks twenty means it, and asking them again on every visit
 * to the tab is the kind of small friction that makes a feature feel
 * unfinished.
 *
 * A challenge is not affected and cannot be. Its code packs exactly three
 * question ids, so a longer run has no challenge to send; the score screen
 * hides that button rather than offering a code that would decode wrong.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const KEY = 'afrifacts.quizLength.v1';

/** The lengths on offer. Three is the default and the one §4.3 named. */
export const RUN_LENGTHS = [3, 10, 20] as const;

export type RunLength = (typeof RUN_LENGTHS)[number];

const DEFAULT: RunLength = 3;

let length: RunLength = DEFAULT;
const listeners = new Set<() => void>();

function isRunLength(value: unknown): value is RunLength {
  return RUN_LENGTHS.some((n) => n === value);
}

/** Read the stored choice. Called at launch, before the quiz tab renders. */
export async function loadQuizLength(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw === null ? null : Number(raw);
    if (isRunLength(parsed)) length = parsed;
  } catch {
    // Three, then.
  }
}

export function quizLength(): RunLength {
  return length;
}

export function setQuizLength(next: RunLength): void {
  if (next === length) return;
  length = next;
  for (const listener of listeners) listener();
  AsyncStorage.setItem(KEY, String(next)).catch(() => {
    // Held for the session; back to three next launch.
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useQuizLength(): RunLength {
  return useSyncExternalStore(subscribe, quizLength, quizLength);
}
