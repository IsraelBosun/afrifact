/**
 * The fact of the day.
 *
 * Derived from the date, never stored and never random. Two people on two
 * phones open AfriFacts on the same morning and get the same fact, which
 * is the only thing that makes "today's fact" a thing anyone can talk
 * about. A random pick would be a fact that merely happened to be first.
 *
 * The same function chooses what the 7am notification carries, so tapping
 * the notification and tapping Today land on the same card. They used to
 * disagree — the notification drew at random — and a reader who saw both
 * would have had no way to tell which one was "today's".
 */

import type { Fact } from '@/src/types';

/**
 * The reader's own day, as `2026-09-09`.
 *
 * Local rather than UTC on purpose: "today" is the day the person holding
 * the phone is having. In Lagos those agree; in Los Angeles UTC would roll
 * the fact over at five in the afternoon.
 */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * FNV-1a, 32-bit.
 *
 * Any stable hash would do. This one is four lines, has no dependency, and
 * scatters adjacent dates — which matters, because consecutive days differ
 * by one character and a weaker hash would walk the corpus in order.
 */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Canonical order: by fact number, ties broken by id.
 *
 * The same comparator the deal uses. The order has to be stable across
 * devices or the hash lands on a different fact on each one, which would
 * cost the whole point of choosing by date.
 */
function canonical(pool: Fact[]): Fact[] {
  return [...pool].sort((a, b) => a.factNumber - b.factNumber || a.id.localeCompare(b.id));
}

/** The fact for a given day, or null when there is no corpus to choose from. */
export function factForDay(date: Date, pool: Fact[]): Fact | null {
  if (pool.length === 0) return null;
  const ordered = canonical(pool);
  return ordered[hash(dayKey(date)) % ordered.length];
}
