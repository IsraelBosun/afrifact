/**
 * Teach the pipeline what it has already done.
 *
 * The ledger and the lineage key are both new, and everything that ran
 * before them looks unrun. Left alone, the first Run would re-extract all
 * 46 cached documents at full price and re-enrich 131 candidates into 131
 * duplicate facts with fresh ids — the exact failure the ledger exists to
 * prevent, committed once on the way in.
 *
 * Neither half guesses.
 *
 *   The ledger is reconstructed from the pipeline's own output. A slug
 *   that appears in candidates.json, rejects.json or culled.json is a slug
 *   the model was paid to read, and the revision it was read at is the one
 *   in the cache — nothing has re-fetched since, or the cache would say so.
 *
 *   The lineage is matched on the PASSAGE. It is copied verbatim from
 *   candidate to stored fact and enrichment never touches it, so an exact
 *   match after whitespace normalisation is an identity rather than a
 *   resemblance. Matching on the claim would be a guess, and a wrong guess
 *   here silently suppresses a real candidate for good.
 *
 * Idempotent. Running it twice changes nothing, which is the property that
 * makes it safe to run when unsure.
 */

import { readFile } from 'node:fs/promises';

import { CANDIDATES_PATH, CULLED_PATH, LEDGER_PATH, REJECTS_PATH } from '../lib/paths.js';
import { MODELS } from '../lib/llm/index.js';
import { backfillLineage } from '../lib/studio/facts.js';
import { keyOf } from '../lib/pipeline/candidate-key.js';
import { loadCached } from '../lib/pipeline/fetch.js';
import { cachedSlugs } from '../lib/pipeline/extract.js';
import { loadLedger, recordExtract } from '../lib/studio/ledger.js';

/** @param {string} path */
async function readArray(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const [candidates, rejects, culled] = await Promise.all([
  readArray(CANDIDATES_PATH),
  readArray(REJECTS_PATH),
  readArray(CULLED_PATH),
]);

/* ---- the ledger ---- */

/** @type {Map<string, { candidates: number, rejected: number }>} */
const worked = new Map();
const bump = (slug, field) => {
  if (typeof slug !== 'string' || slug.length === 0) return;
  const row = worked.get(slug) ?? { candidates: 0, rejected: 0 };
  row[field] += 1;
  worked.set(slug, row);
};

for (const c of candidates) bump(c?.slug, 'candidates');
for (const r of rejects) bump(r?.slug, 'rejected');
// A culled candidate was still extracted and still paid for.
for (const c of culled) bump(c?.candidate?.slug, 'candidates');

const ledger = await loadLedger();
const cached = await cachedSlugs();

let recorded = 0;
let already = 0;
/** @type {string[]} */
const noOutput = [];

for (const slug of cached) {
  if (ledger.extract[slug]) {
    already += 1;
    continue;
  }
  const row = worked.get(slug);
  if (!row) {
    // Cached but with nothing to show for it. That is genuinely ambiguous
    // — extracted and yielded nothing, or never extracted at all — and the
    // ledger must not claim work it cannot evidence. Left pending: the
    // cost of being wrong is one document, not a wrong record.
    noOutput.push(slug);
    continue;
  }
  const doc = await loadCached(slug);
  if (!doc) continue;
  await recordExtract(slug, {
    revisionId: doc.revisionId,
    model: MODELS.extract,
    candidates: row.candidates,
    rejected: row.rejected,
  });
  recorded += 1;
}

console.log('Ledger');
console.log(`  ${recorded} document(s) recorded as already extracted`);
if (already > 0) console.log(`  ${already} already in the ledger, left alone`);
if (noOutput.length > 0) {
  console.log(`  ${noOutput.length} cached with no output — left pending: ${noOutput.join(', ')}`);
}
console.log(`  -> ${LEDGER_PATH}`);

/* ---- the lineage ---- */

const { matched, unmatched } = await backfillLineage(candidates, keyOf);

console.log('\nLineage');
console.log(`  ${matched.length} stored fact(s) traced back to their candidate`);
if (unmatched.length > 0) {
  // Expected for hand-authored facts, which never had a candidate. Also
  // expected for pipeline facts whose candidate has since been culled out
  // of candidates.json. Neither is an error; both mean the corpus dedupe
  // falls back to comparing passages and words, which it can do.
  console.log(`  ${unmatched.length} without a match — hand-authored, or their candidate is gone`);
}
