/**
 * How a phone's progress and an account's progress become one.
 *
 * Pure functions with no imports, so every rule here can be run against
 * real-shaped data in a bare Node process, the same way `streak.ts` and
 * `quiz/challenge.ts` are. `sync.ts` does the fetching and the writing;
 * this file only decides.
 *
 * Almost everything is a set, and a set merges by union: a fact seen on
 * either phone was seen, a day read on either phone was read. Saves are
 * the exception, because a save can be taken back, and a plain union
 * would bring every unsaved fact back on the next sync.
 */

/** Everything in `local`, in its order, then whatever only `remote` has. */
export function union(local: readonly string[], remote: readonly string[]): string[] {
  const out = [...local];
  const have = new Set(local);
  for (const id of remote) {
    if (!have.has(id)) {
      have.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Day keys, oldest first and newest last, which is how `Progress.days` keeps them. */
export function unionDays(local: readonly string[], remote: readonly string[]): string[] {
  return [...new Set([...local, ...remote])].sort();
}

/** The earlier of two day keys, where an empty string means "not yet". */
export function earliestDay(a: string, b: string): string {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  return a < b ? a : b;
}

export interface RemoteSave {
  fact_id: string;
  saved_at: string;
}

/**
 * Saves, merged three ways.
 *
 * `base` is what the account held after this phone's last sync. Against
 * it, a fact is kept when both sides have it, or when one side added it
 * since. A fact that was in `base` and is now missing from either side was
 * unsaved there, and stays unsaved. Without `base` there is no telling an
 * unsave on one phone from a save on the other, and the union would win
 * every time.
 *
 * Order is newest first. The phone's own order is kept as it is, and what
 * arrives only from the account follows it, newest first by `saved_at`.
 */
export function mergeSaved(
  local: readonly string[],
  remote: readonly RemoteSave[],
  base: readonly string[],
): string[] {
  const inLocal = new Set(local);
  const inRemote = new Set(remote.map((row) => row.fact_id));
  const inBase = new Set(base);

  const keep = (id: string) =>
    (inLocal.has(id) && inRemote.has(id)) ||
    (inLocal.has(id) && !inBase.has(id)) ||
    (inRemote.has(id) && !inBase.has(id));

  const fromLocal = local.filter(keep);
  const fromRemote = remote
    .filter((row) => !inLocal.has(row.fact_id) && keep(row.fact_id))
    .sort((a, b) => (a.saved_at < b.saved_at ? 1 : a.saved_at > b.saved_at ? -1 : 0))
    .map((row) => row.fact_id);

  return [...new Set([...fromLocal, ...fromRemote])];
}

/**
 * What to change on the account so it matches `saved`.
 *
 * `known` is the account's list as last seen: freshly fetched after a
 * pull, or `base` on a routine push that did not fetch.
 */
export function savedChanges(
  saved: readonly string[],
  known: readonly string[],
): { add: string[]; remove: string[] } {
  const want = new Set(saved);
  const have = new Set(known);
  return {
    add: saved.filter((id) => !have.has(id)),
    remove: known.filter((id) => !want.has(id)),
  };
}

/**
 * A `saved_at` for each new save that keeps newest-first order.
 *
 * The phone keeps an order rather than a time, so times are made up here:
 * the first in the list gets `now` and each after it a second earlier.
 * Another phone sorting by `saved_at` then sees the same order this one
 * shows. Only new rows are sent, and an existing row keeps its time.
 */
export function stampSaves(ids: readonly string[], now: number): RemoteSave[] {
  return ids.map((fact_id, i) => ({ fact_id, saved_at: new Date(now - i * 1000).toISOString() }));
}

/** Totals over a log of quiz runs. */
export function quizTotals(runs: readonly { correct: number; total: number }[]): {
  quizAnswered: number;
  quizCorrect: number;
} {
  let quizAnswered = 0;
  let quizCorrect = 0;
  for (const run of runs) {
    quizAnswered += run.total;
    quizCorrect += run.correct;
  }
  return { quizAnswered, quizCorrect };
}
