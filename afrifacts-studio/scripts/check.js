/**
 * `npm run check`
 *
 * Prints what the standard says about the corpus and exits non-zero if
 * anything has an error, so this can gate a publish step without change.
 *
 * The thinking lives in `lib/check.js`; this only prints. Keeping the CLI
 * is deliberate even though the studio can run the same check in a page:
 * a validation gate should not need a browser, and when a stage misbehaves
 * you want to run it in isolation.
 */

import { runCheck } from '../lib/check.js';

const result = await runCheck();

console.log(`\n  Corpus: ${result.total} fact${result.total === 1 ? '' : 's'}`);
console.log(`  Publishable: ${result.publishable}`);
console.log(`  Errors: ${result.errors.length}   Warnings: ${result.warnings.length}\n`);

for (const [factId, list] of result.byFact) {
  console.log(`  ${factId}`);
  for (const problem of list) {
    const mark = problem.level === 'error' ? 'ERROR  ' : 'warning';
    console.log(`    ${mark}  ${problem.field}: ${problem.message}`);
  }
  console.log('');
}

if (result.total === 0) {
  console.log('  Corpus is empty. Nothing to check yet.\n');
} else if (!result.ok) {
  const n = result.errors.length;
  console.log(`  Not ready. Fix the ${n} error${n === 1 ? '' : 's'} above.\n`);
  process.exitCode = 1;
} else {
  console.log('  No errors.\n');
}
