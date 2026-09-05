/**
 * `npm run extract`            every cached document not yet extracted
 * `npm run extract -- nok`     one, by slug
 * `npm run extract -- --force` redo documents already in the ledger
 *
 * Costs money: this is the stage that calls the model on every article.
 * Which is why it now skips documents the ledger says have already been
 * paid for at the same revision, and why redoing them is an explicit flag
 * rather than the default.
 *
 * Ctrl-C stops it the same way the studio's Stop button does: the run
 * settles, keeps the documents it finished, and records them. Pressing it
 * twice does what Ctrl-C always did.
 */

import { runExtract } from '../lib/pipeline/extract.js';

const args = process.argv.slice(2);
const slugs = args.filter((a) => !a.startsWith('-'));
const force = args.includes('--force');

const controller = new AbortController();
let asked = false;
process.on('SIGINT', () => {
  if (asked) process.exit(130);
  asked = true;
  console.log('\n  Stopping after the current document. Ctrl-C again to quit now.\n');
  controller.abort();
});

console.log('');
const summary = await runExtract({ slugs, force, signal: controller.signal }, (line) =>
  console.log(`  ${line}`),
);
console.log('');

// Up to date is success. The old exit code treated "nothing to do" as a
// failure, which is only correct if a run that does nothing is a run that
// went wrong — and with a ledger, it is the normal healthy outcome.
if (!summary.wrote && summary.rows.some((r) => r.error)) process.exitCode = 1;
