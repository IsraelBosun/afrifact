/**
 * `npm run shorten`   cut every stored fact over the card limit down to size
 *
 * One model call per long fact. Each rewrite must pass the verifier
 * against the fact's own passage, and is saved through `editFact`, which
 * re-verifies it again and records the change in the fact's history. A
 * fact that cannot be shortened honestly is reported and left alone; the
 * validator keeps it off the app until someone rewrites it on /review.
 *
 * Hand-authored facts in corpus/*.js are not touched.
 */

import { loadFactStore, editFact } from '../lib/studio/facts.js';
import { MAX_FACT_CHARS } from '../lib/validate.js';
import { shorten } from '../lib/pipeline/shorten.js';

const store = await loadFactStore();
const long = Object.values(store).filter((e) => e.fact.fact.length > MAX_FACT_CHARS);

console.log('');
console.log(`  ${long.length} stored fact(s) over ${MAX_FACT_CHARS} characters.`);

for (const entry of long) {
  const id = entry.fact.id;
  let short = null;
  for (const source of entry.provenance.sources ?? []) {
    if (!source?.passage) continue;
    short = await shorten(entry.fact.fact, source.passage);
    if (short) break;
  }
  if (!short) {
    console.log(`  x ${id}  no grounded shorter version; left as it is`);
    continue;
  }
  const result = await editFact(
    id,
    { fact: { ...entry.fact, fact: short } },
    { by: 'pipeline', reason: `Shortened from ${entry.fact.fact.length} to ${short.length} characters to fit the card.` },
  );
  if (!result.ok || result.verification?.ok === false) {
    console.log(`  x ${id}  ${result.ok ? result.verification.reason : result.error}`);
    continue;
  }
  console.log(`  + ${id}  ${entry.fact.fact.length} -> ${short.length}  ${short}`);
}
console.log('');
