/**
 * Promote the last enrich run into the fact store.
 *
 * Enrich does this itself at the end of a run. This exists for the facts
 * that were enriched before the store existed, and as the manual repair
 * if a run is interrupted between writing enriched.json and promoting it.
 *
 * Idempotent: an id already in the store is skipped, never overwritten.
 * Running it twice is a no-op, which is the property that makes it safe
 * to run when unsure.
 */

import { loadEnriched } from '../corpus/index.js';
import { loadFactStore, promote } from '../lib/studio/facts.js';
import { FACTS_PATH } from '../lib/paths.js';

const enriched = await loadEnriched();
if (enriched.length === 0) {
  console.log('Nothing in _generated/enriched.json. Run enrich first.');
  process.exit(0);
}

const before = Object.keys(await loadFactStore()).length;
const { added, skipped } = await promote(enriched);
const after = Object.keys(await loadFactStore()).length;

console.log(`${enriched.length} facts in the last enrich run`);
console.log(`  ${added.length} promoted`);
console.log(`  ${skipped.length} already in the store, left untouched`);
console.log(`store: ${before} -> ${after} records`);
console.log(`  -> ${FACTS_PATH}`);
