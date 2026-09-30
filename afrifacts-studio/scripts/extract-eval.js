/**
 * `npm run extract:eval`                       default documents
 * `npm run extract:eval -- oyo-empire sokoto`  your own, by cache slug
 *
 * Does teaching the extractor with judged examples make it write better
 * facts? Each document is extracted twice, once with the old prompt and
 * once with the learned examples, and every verified candidate from both
 * goes in front of the judge. Same documents, same verifier, same judge;
 * the only difference is the examples.
 *
 * Writes nothing the pipeline reads: no ledger entry, no candidates, no
 * facts. Only `_generated/extract-eval.json`. Costs two extraction calls
 * per document plus three judge calls per candidate.
 *
 * One bias to know about, and it runs against the new prompt: it is told
 * not to repeat the 73 strong facts, while the old prompt is free to find
 * them again and score them as passes.
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { assess, mapLimit } from '../lib/judge/index.js';
import { hasApiKey } from '../lib/llm/index.js';
import { GENERATED_DIR, ensureDirs } from '../lib/paths.js';
import { extractFrom } from '../lib/pipeline/extract.js';
import { loadCached } from '../lib/pipeline/fetch.js';

const DEFAULT_DOCS = [
  'oyo-empire', 'sokoto', 'nri', 'kanem-bornu', 'awolowo', 'nairaland', 'burna', 'lekki',
];
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const docs = slugs.length > 0 ? slugs : DEFAULT_DOCS;

if (!(await hasApiKey())) {
  console.error('\n  No DEEPSEEK_API_KEY in afrifacts-studio/.env. Nothing was run.\n');
  process.exit(1);
}

const controller = new AbortController();
process.on('SIGINT', () => {
  console.log('\n  Stopping. Nothing will be written.\n');
  controller.abort();
});
const signal = controller.signal;
const log = (line) => console.log(`    ${line}`);

const ARMS = [
  { name: 'before', learned: false },
  { name: 'after', learned: true },
];

console.log('');
console.log(`  Extracting ${docs.length} documents twice, then judging every candidate.`);

/** @type {{ doc: string, arm: string, text: string, pass?: boolean, votes?: number }[]} */
const candidates = [];
const verifyFailed = { before: 0, after: 0 };

await mapLimit(docs, 3, async (slug) => {
  const doc = await loadCached(slug);
  if (!doc) {
    log(`${slug}: not in _cache, skipped`);
    return;
  }
  for (const arm of ARMS) {
    const { kept, rejected } = await extractFrom(doc, log, signal, '', { learned: arm.learned });
    verifyFailed[arm.name] += rejected.length;
    for (const c of kept) candidates.push({ doc: slug, arm: arm.name, text: c.fact, country: c.country });
    log(`${slug} ${arm.name}: ${kept.length} verified, ${rejected.length} failed the verifier`);
  }
});
if (signal.aborted) process.exit(130);

console.log(`  Judging ${candidates.length} candidates (${candidates.length * 3} calls)...`);
await mapLimit(candidates, 4, async (c) => {
  const r = await assess({ text: c.text, country: c.country }, { signal, onProgress: log });
  c.pass = r.pass;
  c.votes = r.votes;
  c.readings = r.readings;
});
if (signal.aborted) process.exit(130);

const pct = (n, d) => (d === 0 ? '-' : `${Math.round((100 * n) / d)}%`);
console.log('');
console.log('    document        before (strong/total)   after (strong/total)');
for (const slug of docs) {
  const cell = (arm) => {
    const rows = candidates.filter((c) => c.doc === slug && c.arm === arm);
    return `${rows.filter((c) => c.pass).length}/${rows.length}`;
  };
  console.log(`    ${slug.padEnd(15)} ${cell('before').padStart(10)}              ${cell('after').padStart(10)}`);
}
const summary = {};
for (const arm of ['before', 'after']) {
  const rows = candidates.filter((c) => c.arm === arm);
  const strong = rows.filter((c) => c.pass).length;
  summary[arm] = { candidates: rows.length, strong, verifyFailed: verifyFailed[arm] };
  console.log('');
  console.log(`  ${arm.toUpperCase()}: ${rows.length} candidates, ${strong} strong (${pct(strong, rows.length)}), ${(strong / docs.length).toFixed(1)} strong per document, ${verifyFailed[arm]} failed the verifier`);
}

console.log('');
console.log('  STRONG FACTS FROM THE NEW PROMPT');
for (const c of candidates.filter((x) => x.arm === 'after' && x.pass)) {
  console.log(`    [${c.doc}, ${c.votes}/3] ${c.text}`);
}

await ensureDirs();
const out = join(GENERATED_DIR, 'extract-eval.json');
await writeFile(out, `${JSON.stringify({ docs, summary, candidates }, null, 2)}\n`);
console.log('');
console.log(`  Full report: ${out}`);
console.log('');
