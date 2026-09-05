/**
 * The identity of a candidate, in one place.
 *
 * This string is how three separate things agree about which candidate is
 * which: the triage page writes verdicts under it, enrich filters the
 * keep list with it, and the fact store records it as `candidateKey` so a
 * promoted fact can be traced back to the candidate it was made from.
 *
 * It was previously written out by hand in all three, including once in a
 * client component that cannot import the server module holding the
 * original. Three copies of a key format is a silent-drift bug waiting to
 * happen: change the slice length in one and every stored verdict stops
 * matching, with no error anywhere.
 *
 * So it lives here, in a file with no imports at all — which is what lets
 * a 'use client' component and a pipeline stage share it.
 *
 * A candidate has no id of its own. It is model output that has not been
 * promoted to a record yet, and inventing an id for it would mean writing
 * to `_generated/` as though it were durable. Slug plus the head of the
 * claim is stable across a re-extract at temperature 0, which is the
 * property that matters.
 *
 * @param {{ slug: string, fact: string }} candidate
 * @returns {string}
 */
export function keyOf(candidate) {
  return `${candidate.slug}::${candidate.fact.slice(0, 60)}`;
}
