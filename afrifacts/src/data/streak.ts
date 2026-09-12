/**
 * Turning a set of days into a streak and a week.
 *
 * Split out of `progress.ts` because these are the only part of the record
 * with real edge cases — midnight, month ends, the week boundary — and
 * that file cannot be loaded outside React Native. Here they are pure
 * functions over a set of day keys, so they can be reasoned about and run
 * on their own.
 */

import { dayKey } from './daily';

/** A day key relative to today. `0` is today, `1` is yesterday. */
function keyDaysAgo(n: number, now: Date): string {
  const date = new Date(now);
  date.setDate(date.getDate() - n);
  return dayKey(date);
}

/**
 * Consecutive days of reading, ending today.
 *
 * A streak not yet kept TODAY still counts while yesterday is intact. The
 * day is not over, and zeroing someone at midnight for not having read yet
 * turns a streak into a punishment — §10's rule against shaming is about
 * the quiz, but the same logic applies to the one number people build.
 * It breaks only once a whole day has passed with nothing read.
 */
export function streakOf(days: Set<string>, now: Date = new Date()): number {
  let start = 0;
  if (!days.has(keyDaysAgo(0, now))) {
    if (!days.has(keyDaysAgo(1, now))) return 0;
    start = 1;
  }

  let count = 0;
  for (let n = start; days.has(keyDaysAgo(n, now)); n++) count++;
  return count;
}

/**
 * The current week as seven booleans, Monday first, to match §4.5's row.
 *
 * Days later in the week than today come back false rather than missing:
 * the row is a week of markers, and a row that grew through the week would
 * be a different shape every day.
 */
export function weekOf(days: Set<string>, now: Date = new Date()): boolean[] {
  // getDay() is Sunday-first; the row is Monday-first.
  const sinceMonday = (now.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - sinceMonday + i);
    return days.has(dayKey(date));
  });
}
