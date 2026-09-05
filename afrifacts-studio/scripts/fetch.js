/**
 * `npm run fetch` — pull every seed article into _cache/.
 * `npm run fetch -- --force` refetches even what is cached.
 *
 * Thin. The work is in lib/pipeline/fetch.js so the studio can run the
 * same thing from a button.
 */

import { runFetch } from '../lib/pipeline/fetch.js';

const force = process.argv.includes('--force');
console.log('');
const summary = await runFetch({ force }, (line) => console.log(`  ${line}`));
console.log('\n  --force to refetch everything\n');
if (summary.failed > 0) process.exitCode = 1;
