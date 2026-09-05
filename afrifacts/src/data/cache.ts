/**
 * The last corpus that loaded, kept on the device.
 *
 * Without this the app is offline-hostile: no network means the "no facts
 * right now" screen, on a phone that already downloaded all 148 facts an
 * hour ago. A facts app that cannot open on the underground is a facts
 * app people stop opening.
 *
 * WHAT IS AND IS NOT CACHED
 *
 * The corpus, and nothing else. Bookmarks, the streak and quiz history
 * are user state — they belong in their own store with their own rules,
 * and putting them in a blob that a version bump throws away would lose
 * a month of streak to a shape change.
 *
 * SIZE
 *
 * Measured on the real corpus: 294KB of facts, 159KB of quiz questions.
 * Android's AsyncStorage is SQLite with a 6MB default ceiling, so there
 * is a lot of room, but not an unlimited amount — at a few thousand facts
 * this becomes the same page-as-you-swipe problem as `remote.ts` and gets
 * solved in the same place.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Fact, QuizQuestion } from '@/src/types';

/*
  The version lives in the key, not in a field inside it.

  A shape change then makes the old entry unreachable rather than
  something that has to be recognised and migrated — and the failure mode
  of a missed migration is a card rendering `undefined`, on a device we
  cannot reach. Bump this whenever `Fact` or `QuizQuestion` changes.
*/
const PREFIX = 'afrifacts.corpus.';
const VERSION = 'v1';

const FACTS_KEY = `${PREFIX}${VERSION}.facts`;
const QUIZ_KEY = `${PREFIX}${VERSION}.quiz`;
const SAVED_AT_KEY = `${PREFIX}${VERSION}.savedAt`;

/**
 * How long a cached corpus is used without going back to the database.
 *
 * The corpus changes when a fact is approved in the studio — a few times
 * a day at most, and never urgently. Six hours means someone who opens
 * the app five times a day pays for one 450KB refresh rather than five,
 * and is at worst half a day behind an approval.
 */
export const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type CachedCorpus = {
  facts: Fact[];
  quiz: QuizQuestion[];
  /** Epoch ms of the fetch this came from. */
  savedAt: number;
};

/** Enough of a shape check to keep a half-written blob off the screen. */
function looksLikeCorpus(value: unknown): value is Fact[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first: unknown = value[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    typeof (first as Fact).id === 'string' &&
    typeof (first as Fact).fact === 'string' &&
    typeof (first as Fact).deepDive === 'object'
  );
}

/**
 * What is on the device, or null.
 *
 * Never throws. Every failure here — no entry, unparseable JSON, a blob
 * from a build that stored something else — means the same thing to the
 * caller: go to the network. Turning any of them into an exception would
 * make a corrupt cache indistinguishable from being offline, which is
 * exactly backwards.
 */
export async function readCache(): Promise<CachedCorpus | null> {
  try {
    const entries = await AsyncStorage.multiGet([FACTS_KEY, QUIZ_KEY, SAVED_AT_KEY]);
    const stored = Object.fromEntries(entries) as Record<string, string | null>;

    const rawFacts = stored[FACTS_KEY];
    const rawQuiz = stored[QUIZ_KEY];
    if (rawFacts === null || rawFacts === undefined) return null;

    const facts: unknown = JSON.parse(rawFacts);
    if (!looksLikeCorpus(facts)) return null;

    // Quiz is allowed to be missing. A corpus with no questions is a feed
    // that works and a quiz tab that is empty; refusing the whole cache
    // over it would cost the user the facts too.
    const quiz: unknown = rawQuiz === null || rawQuiz === undefined ? [] : JSON.parse(rawQuiz);

    return {
      facts,
      quiz: Array.isArray(quiz) ? (quiz as QuizQuestion[]) : [],
      savedAt: Number(stored[SAVED_AT_KEY] ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Keep this corpus for next launch.
 *
 * `multiSet` rather than three `setItem` calls: it is one transaction, so
 * the app being killed mid-write cannot leave new facts sitting beside
 * the previous run's quiz questions.
 *
 * An empty corpus is never written. A successful request that returns
 * nothing — every fact unpublished, a policy change, a schema rename —
 * would otherwise quietly replace a good cache with a blank one, and the
 * next offline launch would show a working app with no content.
 */
export async function writeCache(facts: Fact[], quiz: QuizQuestion[]): Promise<void> {
  if (facts.length === 0) return;
  try {
    await AsyncStorage.multiSet([
      [FACTS_KEY, JSON.stringify(facts)],
      [QUIZ_KEY, JSON.stringify(quiz)],
      [SAVED_AT_KEY, String(Date.now())],
    ]);
    await dropOldVersions();
  } catch {
    /*
      A cache that cannot be written is a slow app, not a broken one. The
      corpus is already in memory by the time this runs, so the only cost
      of swallowing this is that the next launch goes to the network —
      which is what would have happened anyway.
    */
  }
}

/** Entries from a previous VERSION, which nothing will ever read again. */
async function dropOldVersions(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const stale = keys.filter((key) => key.startsWith(PREFIX) && !key.startsWith(`${PREFIX}${VERSION}.`));
  if (stale.length > 0) await AsyncStorage.multiRemove(stale);
}

/** True when the cache is old enough to be worth refreshing behind the user. */
export function isStale(savedAt: number): boolean {
  return Date.now() - savedAt > MAX_AGE_MS;
}
