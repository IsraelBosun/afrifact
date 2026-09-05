/**
 * `npm run enrich`            candidates triage kept that are not yet facts
 * `npm run enrich -- --all`   ignore the keep list
 * `npm run enrich -- --force` re-enrich candidates that are already facts
 *
 * Costs money. Writes _generated/enriched.json, overwriting it whole —
 * the facts themselves are safe because promotion copies them into
 * data/facts.json, and review decisions live in data/reviews.json.
 *
 * `--force` is rarely what you want. Enrichment mints a NEW fact id every
 * run, so re-enriching a promoted candidate does not update the fact it
 * became; it creates a second one saying the same thing.
 */

import { runEnrich } from '../lib/pipeline/enrich.js';

const args = process.argv.slice(2);
const all = args.includes('--all');
const force = args.includes('--force');

const controller = new AbortController();
let asked = false;
process.on('SIGINT', () => {
  if (asked) process.exit(130);
  asked = true;
  console.log('\n  Stopping after the current fact. Ctrl-C again to quit now.\n');
  controller.abort();
});

console.log('');
const summary = await runEnrich({ all, force, signal: controller.signal }, (line) =>
  console.log(`  ${line}`),
);
console.log('');

if (!summary.wrote && summary.failed > 0) process.exitCode = 1;
