/**
 * `npm run export` — write approved facts into the app's dummy data file.
 *
 * Free: no model call. Scaffolding until Supabase lands.
 */

import { runExport } from '../lib/pipeline/export-to-app.js';

console.log('');
const summary = await runExport((line) => console.log(`  ${line}`));
console.log('');
if (!summary.wrote) process.exitCode = 1;
