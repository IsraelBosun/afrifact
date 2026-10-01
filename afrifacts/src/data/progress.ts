/**
 * What the reader has actually done, kept on the device.
 *
 * The profile used to be five hardcoded numbers: a 7-day streak, 124 facts
 * learned and 86% quiz accuracy, shown identically to someone who had
 * opened the app ninety seconds ago. §1 puts retention first, and a streak
 * that was never earned is worse than no streak — it is the one number on
 * the screen that is supposed to cost something.
 *
 * WHY IT IS NOT IN THE CORPUS CACHE
 *
 * The same argument as `bookmarks.ts`. `cache.ts` is deliberately
 * throwaway, invalidated whenever the `Fact` shape changes, because a
 * stale fact is worse than a refetch. Progress is the opposite: it is the
 * record of what a person did, and losing a 40-day streak to a content
 * migration would be unforgivable. Different lifetime, different key,
 * different file.
 *
 * The date arithmetic lives in `streak.ts`, which is pure and testable;
 * this file is the state and the storage.
 *
 * The phone stays the source of truth. A signed-in reader's progress is
 * backed up to their account by `sync.ts`, which merges into this record
 * rather than replacing it, so nothing here waits on a network.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { dayKey } from './daily';
import { streakOf, weekOf } from './streak';

const KEY = 'afrifacts.progress.v1';

export interface Progress {
  /** ISO day of the first launch that ever recorded anything. */
  joinedAt: string;
  /** Fact ids the reader has actually had on screen. */
  seen: string[];
  /** Local day keys on which at least one fact was read. Newest last. */
  days: string[];
  quizAnswered: number;
  quizCorrect: number;
  /**
   * Question ids already put to the reader, so a run does not ask them
   * again while unseen questions are still sitting there.
   *
   * Bounded by the corpus rather than by time: every id in here is a
   * question that exists, and the set is cleared once the reader has been
   * through all of them. Ids of questions the studio later deleted are
   * dead weight of a few bytes and are not worth reconciling.
   */
  answeredQuestions: string[];
  /** What they call themselves. Empty until they say. */
  name: string;
}

function empty(): Progress {
  return {
    joinedAt: '',
    seen: [],
    days: [],
    quizAnswered: 0,
    quizCorrect: 0,
    answeredQuestions: [],
    name: '',
  };
}

let state: Progress = empty();
/** Membership without scanning the array on every swipe. */
let seenSet = new Set<string>();
let daySet = new Set<string>();
let answeredSet = new Set<string>();

const listeners = new Set<() => void>();
// `useSyncExternalStore` compares snapshots by identity and loops forever
// if handed a fresh object each render, so this is rebuilt only on change.
let snapshot: Progress = state;

/*
  Writes are debounced.

  `noteFactSeen` fires on every card the reader settles on. Writing the
  whole record to disk per swipe is a lot of I/O for a number nothing reads
  until the profile tab opens, so changes are coalesced. The in-memory
  state updates immediately either way, which is what the UI reads.
*/
let pending: ReturnType<typeof setTimeout> | null = null;
const WRITE_DELAY_MS = 800;

function persist(): void {
  if (pending !== null) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {
      // A streak that cannot be written is still true for this session.
      // Refusing to count the day because the disk is full is a worse
      // answer than quietly keeping it in memory.
    });
  }, WRITE_DELAY_MS);
}

function commit(next: Progress): void {
  state = next;
  snapshot = next;
  seenSet = new Set(next.seen);
  daySet = new Set(next.days);
  answeredSet = new Set(next.answeredQuestions);
  for (const listener of listeners) listener();
  persist();
}

/** Read progress off the device. Called once, at launch, before the feed. */
export async function loadProgress(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      // Spread over a fresh empty record, so a file written by an older
      // build that lacked a field gets the default rather than undefined.
      commit({ ...empty(), ...parsed });
      return;
    }
  } catch {
    // Unreadable or unparseable. Starting from zero loses the record,
    // which is bad; crashing the launch is worse.
  }
  commit(empty());
}

/**
 * The reader had this fact on screen.
 *
 * Called when a card settles under the thumb, not when it scrolls past, so
 * "facts learned" counts facts that were actually looked at. It is also
 * what marks the day active, which makes the streak a record of reading
 * rather than of opening the app and closing it again.
 */
export function noteFactSeen(id: string): void {
  const today = dayKey(new Date());
  const isNewFact = !seenSet.has(id);
  const isNewDay = !daySet.has(today);
  if (!isNewFact && !isNewDay) return;

  commit({
    ...state,
    joinedAt: state.joinedAt.length > 0 ? state.joinedAt : today,
    seen: isNewFact ? [...state.seen, id] : state.seen,
    days: isNewDay ? [...state.days, today] : state.days,
  });
}

/**
 * One finished quiz run. Accuracy is over every question ever answered.
 *
 * Takes the ids rather than a count so the run is remembered as well as
 * tallied. Those two used to be the same number; they stopped being the
 * same the moment a question could be asked twice.
 */
export function recordQuizRun(correct: number, questionIds: string[]): void {
  if (questionIds.length === 0) return;

  const fresh = questionIds.filter((id) => !answeredSet.has(id));

  commit({
    ...state,
    quizAnswered: state.quizAnswered + questionIds.length,
    quizCorrect: state.quizCorrect + correct,
    answeredQuestions: [...state.answeredQuestions, ...fresh],
  });

  for (const listener of runListeners) listener(correct, questionIds.length);
}

/*
  Finished runs, for whoever needs them one at a time.

  The record above only keeps totals, and totals cannot be merged across
  two phones: each would overwrite the other. The account keeps a log of
  runs instead, so `sync.ts` listens here and queues each one. A listener
  rather than an import because sync already imports this file.
*/
type RunListener = (correct: number, total: number) => void;
const runListeners = new Set<RunListener>();

export function onQuizRun(listener: RunListener): () => void {
  runListeners.add(listener);
  return () => runListeners.delete(listener);
}

/**
 * What an account holds, laid over what the phone holds.
 *
 * Only `sync.ts` calls this, with values it has already merged. The quiz
 * record of which questions were asked stays as it is: it is how this
 * phone deals the next run, not part of anybody's history.
 */
export function adoptAccountProgress(
  merged: Pick<Progress, 'joinedAt' | 'seen' | 'days' | 'quizAnswered' | 'quizCorrect' | 'name'>,
): void {
  commit({ ...state, ...merged });
}

/**
 * Hand the phone back empty. Called on sign-out, after the account has
 * everything, so the next person to pick up the phone does not inherit a
 * stranger's streak.
 */
export function resetProgress(): void {
  commit(empty());
}

/** Has this question been put to the reader before? */
export function wasAnswered(id: string): boolean {
  return answeredSet.has(id);
}

/**
 * Start the corpus over.
 *
 * Called when the reader has answered everything. Accuracy is left alone:
 * it is the record of how they have done, not of what is left.
 */
export function resetAnsweredQuestions(): void {
  if (state.answeredQuestions.length === 0) return;
  commit({ ...state, answeredQuestions: [] });
}

export function setDisplayName(name: string): void {
  commit({ ...state, name: name.trim().slice(0, 40) });
}

export function progress(): Progress {
  return snapshot;
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );
}

/** Percentage 0-100, and 0 when nothing has been answered yet. */
export function accuracyOf(p: Progress): number {
  return p.quizAnswered === 0 ? 0 : Math.round((p.quizCorrect / p.quizAnswered) * 100);
}

/** The day set the streak and week functions work over. */
export function daysSetOf(p: Progress): Set<string> {
  return new Set(p.days);
}

export { streakOf, weekOf };
