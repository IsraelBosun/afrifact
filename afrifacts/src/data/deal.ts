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
 * Order facts so consecutive ones come from different categories.
 *
 * A plain shuffle does not do this, and measuring on the real corpus says
 * so. History is over half the facts, so:
 *
 *   corpus order    57% of neighbours share a category, longest run 11
 *   plain shuffle   44%, longest run 7
 *   this            2.5%, longest run 4
 *
 * Shuffling cannot fix it, because the clustering is not disorder — it is
 * the mix. When one category is half the corpus, half the neighbours are
 * that category however well you shuffle. It has to be interleaved.
 *
 * The rule is the classic one for spacing a multiset: take from whichever
 * category has the most left, never the one just taken. Two departures
 * from the textbook version — the largest is forced only when it is more
 * than half of what remains (before that, deferring it is still safe), and
 * otherwise the pick is random between the top two, so the rhythm differs
 * between deals rather than being identical every time.
 *
 * The tail can still repeat. Once only History is left there is nothing to
 * alternate with, and that floor is arithmetic rather than a bug.
 */
function spreadByCategory(pool: Fact[], seed: number): Fact[] {
  const next = seededRandom(seed);

  const buckets = new Map<string, Fact[]>();
  for (const fact of pool) {
    const bucket = buckets.get(fact.category);
    if (bucket) bucket.push(fact);
    else buckets.set(fact.category, [fact]);
  }
  for (const bucket of buckets.values()) shuffleInPlace(bucket, next);

  const out: Fact[] = [];
  let last: string | null = null;
  let remaining = pool.length;

  while (remaining > 0) {
    const candidates = [...buckets.entries()]
      .filter(([category, bucket]) => bucket.length > 0 && category !== last)
      .sort((a, b) => b[1].length - a[1].length);

    let pick: string;
    if (candidates.length === 0) {
      const found = [...buckets.entries()].find(([, bucket]) => bucket.length > 0);
      if (found === undefined) break;
      pick = found[0];
    } else if (candidates[0][1].length * 2 > remaining) {
      pick = candidates[0][0];
    } else {
      const top = candidates.slice(0, 2);
      pick = top[Math.floor(next() * top.length)][0];
    }

    const fact = buckets.get(pick)?.shift();
    if (fact === undefined) break;
    out.push(fact);
    last = pick;
    remaining -= 1;
  }

  return out;
}

/**
 * Fact #1, then #2, then #3.
 *
 * The default order and the one a refresh returns to. It is the same sort
 * the canonical numbering uses, so the feed reads 1, 2, 3 down the screen
 * and the number on each card is also its place in the queue.
 *
 * Worth knowing what this costs: facts mined from one article are
 * consecutive and share a category, so chronological order is the most
 * clustered order there is — 57% of neighbours share a category and the
 * longest run is 11. `spreadByCategory` takes that to 2.5%, and the
 * shuffle button is how a reader gets it.
 */
function canonicalOrder(facts: Fact[]): Fact[] {
  return [...facts].sort((a, b) => a.factNumber - b.factNumber || a.id.localeCompare(b.id));
}

/**
 * Back to Fact #1, in order. What a pull-to-refresh does.
 *
 * A refresh is the moment the corpus itself changed, so carrying a shuffle
 * across it would mean landing mid-deal in a set that is no longer the one
 * that was dealt. Starting over is both simpler to explain and what the
 * gesture already feels like it means.
 */
export function resetDeal(facts: Fact[]): void {
  commit(canonicalOrder(facts).map((fact) => fact.id));
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

  commit([...kept, ...canonicalOrder(added).map((fact) => fact.id)]);
}

/** Deal again from scratch. What the shuffle button does. */
export function reshuffleDeal(facts: Fact[]): void {
  commit(spreadByCategory(facts, Date.now()).map((fact) => fact.id));
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
