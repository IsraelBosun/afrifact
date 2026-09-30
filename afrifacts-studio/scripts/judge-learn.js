/**
 * `npm run judge:learn`   save the facts that passed the judge as examples
 *
 * Reads the last `npm run judge:corpus` and writes every live fact that
 * passed into `data/learned-facts.json`. The extractor reads that file as
 * a second set of examples beside the founder's 22.
 *
 * Free: no model calls. It is a separate step from judge:corpus on
 * purpose. Judging is a report; this is a decision to let those verdicts
 * shape what the pipeline writes next, and it should be taken deliberately
 * rather than as a side effect of looking.
 *
 * Replaces the file wholesale, so a fact that stops passing on a later
 * judge run also stops being an example.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { LEARNED_PATH } from '../lib/calibration/learned.js';
import { VERDICTS_PATH } from '../lib/judge/corpus.js';
import { ensureDirs } from '../lib/paths.js';

let report;
try {
  report = JSON.parse(await readFile(VERDICTS_PATH, 'utf8'));
} catch {
  console.error('\n  No corpus verdicts yet. Run `npm run judge:corpus` first.\n');
  process.exit(1);
}

// The house style forbids em dashes, and a model's reasoning is full of
// them. The text of the facts is left exactly as reviewed.
const EM_DASH = new RegExp(`\\s*${String.fromCharCode(0x2014)}\\s*`, 'g');
const tidy = (s) => String(s ?? '').replace(EM_DASH, ', ').trim();

const facts = report.verdicts
  .filter((v) => v.pass)
  .sort((a, b) => b.votes - a.votes || a.id.localeCompare(b.id))
  .map((v) => ({
    id: v.id,
    category: v.category,
    text: v.text,
    votes: v.votes,
    why: tidy(v.readings.find((r) => r.vote)?.why),
  }));

await ensureDirs();
await writeFile(
  LEARNED_PATH,
  `${JSON.stringify({ judgedAt: report.judgedAt, model: report.model, facts }, null, 2)}\n`,
);

const byCategory = {};
for (const f of facts) byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
console.log('');
console.log(`  Saved ${facts.length} facts as examples to ${LEARNED_PATH}`);
console.log(`  ${Object.entries(byCategory).map(([c, n]) => `${c} ${n}`).join(', ')}`);
console.log('');
