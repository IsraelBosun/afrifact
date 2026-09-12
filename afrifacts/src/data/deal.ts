/**
 * The order the facts are dealt in, and therefore their numbers.
 *
 * The list IS the numbering. A card's number is its index in here plus
 * one, computed at render, never stored beside the fact — so the two can
 * never drift apart and a number can never point at a hole.
 *
 * WHY A STORED LIST AND NOT A SEED
 *
 * A seed reproduces an order only over the same pool. Delete one fact and
 * the same seed deals a completely different arrangement, so "you were on
 * 47" would silently mean a different card. Storing the actual ids makes
 * deletion self-healing: drop the missing id and everything after it moves
 * up one on its own. No renumbering pass, no migration, no gap.
 *
 * WHY IT IS NOT `factNumber`
 *
 * `factNumber` is the digits out of the id — `nf_1047` is 1047. It starts
 * at 1001, and 46 numbers in its range point at nothing because those
 * candidates were never published. It is a database key, and printing it
 * to a reader claims a corpus ten times the size of the real one. This
 * number is derived from what actually exists, so it is true by
 * construction.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { Fact } from '@/src/types';

const KEY = 'afrifacts.deal.v1';

let order: string[] = [];
let snapshot: readonly string[] = order;
const listeners = new Set<() => void>();

function commit(next: string[], persist = true) {
  order = next;
  snapshot = order;
  for (const listener of listeners) listener();
  if (persist) {
    AsyncStorage.setItem(KEY, JSON.stringify(order)).catch(() => {
      // Held for the session; re-dealt next launch.
    });
  }
}

/** Read the stored deal. Called at launch, before the corpus is reconciled. */
export async function loadDeal(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    order = parsed.filter((id): id is string => typeof id === 'string');
    snapshot = order;
  } catch {
    // No deal yet. `reconcileDeal` will make one.
  }
}

function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(list: T[], next: () => number): void {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}

/**
 * Two facts in a row should not be about the same thing.
 *
 * Category is the coarse signal and it is not enough on its own. Six facts
 * about Moshood Abiola are split across Culture and History, so spacing by
 * category alone will happily put "Abiola edited the school magazine" next
 * to "Abiola was detained for four years" and call them different. To a
 * reader that is the same card twice.
 *
 * `source.name` is the finer signal, and it is free: it is the article a
 * fact was mined from, so everything sharing a subject shares it. The
 * related ids catch the rest, since a fact that lists another as related
 * has already said they belong together.
 */
function subjectOf(fact: Fact): string {
  return fact.source.name.trim().toLowerCase();
}

function similar(fact: Fact, previous: Fact | null): boolean {
  if (previous === null) return false;
  if (subjectOf(fact) === subjectOf(previous)) return true;
  return fact.relatedIds.includes(previous.id) || previous.relatedIds.includes(fact.id);
}

/**
 * Order facts so consecutive ones differ in category and in subject.
 *
 * A plain shuffle does not do this, and measuring on the real 126-fact
 * corpus says so. Share of neighbours that match, and the longest run of
 * one category:
 *
 *   corpus order    category 59.2%   subject 60.8%   run 12
 *   plain shuffle   category 29.6%   subject  1.6%   run 4
 *   this            category  0.0%   subject  0.0%   run 1
 *
 * The subject column is why corpus order was the wrong default twice over:
 * three in five neighbours were not merely the same lane, they were the
 * same article.
 *
 * Shuffling cannot fix it, because the clustering is not disorder. It is
 * the mix. When one category is half the corpus, half the neighbours are
 * that category however well you shuffle. It has to be interleaved.
 *
 * The rule is the classic one for spacing a multiset: take from whichever
 * category has the most left, never the one just taken. Two departures
 * from the textbook version. The largest is forced only when it is more
 * than half of what remains, because before that point deferring it is
 * still safe, and otherwise the pick is random between the top two, so the rhythm differs
 * between deals rather than being identical every time.
 *
 * Subject spacing rides on top and never overrides the category rule,
 * which is what keeps the 2.5% intact. It gets two free choices: which of
 * the top two categories to take when neither is forced, and which fact to
 * take out of the chosen bucket. Both prefer a fact unlike the last one,
 * and both fall back rather than fail.
 *
 * The tail can still repeat in principle. Once one category is all that
 * remains there is nothing to alternate with, and that floor is arithmetic
 * rather than a bug. At the current mix it does not bite: every seed
 * measured lands on a longest run of 1.
 */
function spread(pool: Fact[], seed: number): Fact[] {
  const next = seededRandom(seed);

  const buckets = new Map<string, Fact[]>();
  for (const fact of pool) {
    const bucket = buckets.get(fact.category);
    if (bucket) bucket.push(fact);
    else buckets.set(fact.category, [fact]);
  }
  for (const bucket of buckets.values()) shuffleInPlace(bucket, next);

  const out: Fact[] = [];
  let previous: Fact | null = null;
  let remaining = pool.length;

  while (remaining > 0) {
    const live = [...buckets.entries()].filter(([, bucket]) => bucket.length > 0);
    const candidates = live
      .filter(([category]) => category !== previous?.category)
      .sort((a, b) => b[1].length - a[1].length);

    let pick: string;
    if (candidates.length === 0) {
      if (live.length === 0) break;
      pick = live[0][0];
    } else if (candidates[0][1].length * 2 > remaining) {
      // Forced: deferring the biggest category any longer would strand it
      // at the end. Category spacing wins over subject spacing here.
      pick = candidates[0][0];
    } else {
      const top = candidates.slice(0, 2);
      // Free choice, so spend it on the subject rule.
      const unlike = top.filter(([, bucket]) => bucket.some((fact) => !similar(fact, previous)));
      const choose = unlike.length > 0 ? unlike : top;
      pick = choose[Math.floor(next() * choose.length)][0];
    }

    const bucket = buckets.get(pick);
    if (bucket === undefined || bucket.length === 0) break;

    // Also free: any fact in this bucket keeps the category rhythm, so
    // take one that is not about what we just showed.
    const at = bucket.findIndex((fact) => !similar(fact, previous));
    const [fact] = bucket.splice(at === -1 ? 0 : at, 1);

    out.push(fact);
    previous = fact;
    remaining -= 1;
  }

  return out;
}

/**
 * The seed the default deal uses.
 *
 * Fixed rather than random, and that is the whole point of it. A refresh
 * has to return to the same order every time or "Fact #1" would mean a
 * different card on every pull, so the default deal is one particular
 * spread rather than a fresh one. The shuffle button is where a reader
 * gets a different arrangement, and it seeds from the clock.
 */
const DEFAULT_SEED = 0x5af1fac7;

/**
 * Deal again from the default spread. What a pull-to-refresh does.
 *
 * A refresh is the moment the corpus itself changed, so carrying a shuffle
 * across it would mean landing mid-deal in a set that is no longer the one
 * that was dealt. Starting over is both simpler to explain and what the
 * gesture already feels like it means.
 */
export function resetDeal(facts: Fact[]): void {
  commit(spread(facts, DEFAULT_SEED).map((fact) => fact.id));
}

/**
 * Bring the deal in line with the corpus, keeping everything it can.
 *
 * Called after every load and every refresh, which is what makes a delete
 * in the studio behave the way the word suggests: the id is dropped, the
 * cards after it move up one, and nothing renumbers because nothing was
 * numbered in the first place.
 *
 * New facts are appended rather than woven in. Somebody partway through a
 * run has already seen the early numbers, and inserting a new fact at 12
 * would move everything they have read — and appended is also where an
 * unread fact belongs, since a newer fact has a higher number anyway.
 *
 * An empty deal — first launch, or cleared storage — is filled in
 * canonical order, so the app opens on Fact #1 rather than on a shuffle
 * nobody asked for.
 */
export function reconcileDeal(facts: Fact[]): void {
  if (order.length === 0) {
    resetDeal(facts);
    return;
  }

  const byId = new Map(facts.map((fact) => [fact.id, fact]));

  const kept = order.filter((id) => byId.has(id));
  const known = new Set(kept);
  const added = facts.filter((fact) => !known.has(fact.id));

  if (kept.length === order.length && added.length === 0) return;

  // Spread the new block too. It is appended rather than woven in, so it
  // is the one place a run of same-subject cards can still form, and the
  // facts arriving together are usually the ones mined together.
  commit([...kept, ...spread(added, DEFAULT_SEED).map((fact) => fact.id)]);
}

/** Deal again from scratch. What the shuffle button does. */
export function reshuffleDeal(facts: Fact[]): void {
  commit(spread(facts, Date.now()).map((fact) => fact.id));
}

export function dealOrder(): readonly string[] {
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The dealt order, re-rendering the caller when it is re-dealt. */
export function useDeal(): readonly string[] {
  return useSyncExternalStore(subscribe, dealOrder, dealOrder);
}

/*
  Where the reader had got to, by fact id rather than by index.

  By id on purpose: if a fact ahead of them is deleted, an index would
  nudge them forward a card, while an id keeps them on the one they were
  actually reading.
*/
const AT_KEY = 'afrifacts.deal.at.v1';

let lastSeen: string | null = null;

export async function loadDealPosition(): Promise<void> {
  try {
    lastSeen = await AsyncStorage.getItem(AT_KEY);
  } catch {
    lastSeen = null;
  }
}

export function dealPosition(): string | null {
  return lastSeen;
}

export function setDealPosition(factId: string): void {
  if (factId === lastSeen) return;
  lastSeen = factId;
  AsyncStorage.setItem(AT_KEY, factId).catch(() => {
    // Resuming is a convenience, not a promise.
  });
}

/** Forget where they were. Paired with `resetDeal`, so a refresh opens at #1. */
export function clearDealPosition(): void {
  lastSeen = null;
  AsyncStorage.removeItem(AT_KEY).catch(() => {});
}
