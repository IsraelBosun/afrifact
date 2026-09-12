/**
 * The corpus. One file per category, plus the pipeline's output.
 *
 * This is the only place facts are defined. The app's dummy data is UI
 * scaffolding and is not part of the corpus — real facts reach the app
 * through the database, never by hand-editing the app project.
 *
 * Two doors, one standard. Hand-authored facts live in the category
 * files; pipeline facts arrive in `_generated/enriched.json`. Both are
 * SourcedFact, both run through the same `validate()`, and both need a
 * named reviewer before they are publishable. What differs is who wrote
 * them, not what is asked of them.
 *
 * Why this is async now: the enriched facts used to be a TypeScript
 * module the corpus imported, which meant the enrich stage rewriting them
 * mid-run would recompile a module the Next dev server is watching. They
 * are read from disk at call time instead — out of the module graph, and
 * a finished enrich run shows up without a restart.
 *
 * The enriched file is regenerated on every enrich run, so nothing may be
 * hand-edited there. Review decisions survive that: they live in
 * `data/reviews.json`, keyed by fact id, never inside the corpus.
 */

import { readFile } from 'node:fs/promises';

import { ENRICHED_PATH } from '../lib/paths.js';
import { storedFacts } from '../lib/studio/facts.js';
import { cultureFacts } from './culture.js';
import { historyFacts } from './history.js';
import { recordFacts } from './records.js';

export { cultureFacts, historyFacts, recordFacts };

/**
 * Facts written by the pipeline, awaiting or holding a review decision.
 *
 * A missing file is the normal state before the first enrich run, not an
 * error. A corrupt one is worth shouting about, because silently
 * returning nothing would look identical to "the pipeline found nothing"
 * and would quietly drop 131 facts out of `check`.
 *
 * @returns {Promise<import('../lib/types/provenance.js').SourcedFact[]>}
 */
export async function loadEnriched() {
  let raw;
  try {
    raw = await readFile(ENRICHED_PATH, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${ENRICHED_PATH} is not an array of facts.`);
  }
  return parsed;
}

/**
 * Every fact, hand-authored and generated alike.
 *
 * Three sources, in order of authority:
 *
 *   1. `corpus/*.js`   — hand-authored, the only facts still defined in code.
 *   2. `data/facts.json` — the store. Authoritative for every id it holds,
 *      because it is the only one of the three that survives an edit.
 *   3. `_generated/enriched.json` — the last enrich run, for any fact that
 *      has not been promoted yet. Enrich promotes at the end of its own
 *      run, so this is normally empty of anything new; it is here so that
 *      a run interrupted between writing and promoting loses nothing.
 *
 * The store wins over the enriched file for a shared id. It has to: the
 * enriched file is regenerated wholesale, so it holds the fact as the
 * model first wrote it, while the store holds it as it now stands.
 *
 * @returns {Promise<import('../lib/types/provenance.js').SourcedFact[]>}
 */
export async function loadCorpus() {
  const [enriched, stored] = await Promise.all([loadEnriched(), storedFacts()]);

  const promoted = new Set(stored.map((entry) => entry.fact.id));
  const unpromoted = enriched.filter((entry) => !promoted.has(entry?.fact?.id));

  return [...historyFacts, ...cultureFacts, ...recordFacts, ...stored, ...unpromoted];
}
