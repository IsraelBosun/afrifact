/**
 * `npm run images`          propose images for facts with no decision
 * `npm run images -- --force` refetch the candidate pools from Commons first
 *
 * Costs money, but the cheapest stage: short descriptions, and the model
 * is only choosing from a list the licence filter already cleared.
 */

import { runImages } from '../lib/pipeline/harvest-images.js';

const force = process.argv.includes('--force');
console.log('');
const summary = await runImages({ force }, (line) => console.log(`  ${line}`));
console.log('');
if (summary.failed.length > 0) {
  console.log(`  ${summary.failed.length} article(s) failed and were NOT cached as empty.`);
  console.log('  Run again to retry them.\n');
}
