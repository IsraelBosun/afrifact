/**
 * `npm run reading`              further reading for live facts that have none
 * `npm run reading -- --force`   redo every live fact
 * `npm run reading -- nf_1166`   only the named facts
 *
 * Costs one short model call per fact; the Wikipedia searches are free.
 * Writes `deepDive.furtherReading` into data/facts.json. Reaches the app
 * on the next push, and shows in any app build that renders it.
 */

import { runFurtherReading } from '../lib/pipeline/further-reading.js';

const args = process.argv.slice(2);
const force = args.includes('--force');
const ids = args.filter((a) => !a.startsWith('--'));

const controller = new AbortController();
process.on('SIGINT', () => {
  console.log('\n  Stopping after the facts in flight.\n');
  controller.abort();
});

console.log('');
await runFurtherReading({ ids, force, signal: controller.signal }, (line) => console.log(`  ${line}`));
console.log('');
