/**
 * `npm run push`   the corpus into Supabase
 *
 * Free — no model calls. Upserts by primary key, so running it twice
 * does the same as running it once.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, and the
 * schema created first: paste supabase/schema.sql into the SQL editor,
 * then add `afrifacts` to Settings -> API -> Exposed schemas.
 *
 * Ctrl-C stops between tables. What already went up stays up.
 */

import { runPush } from '../lib/pipeline/push-to-supabase.js';

const controller = new AbortController();
let asked = false;
process.on('SIGINT', () => {
  if (asked) process.exit(130);
  asked = true;
  console.log('\n  Stopping after the current table. Ctrl-C again to quit now.\n');
  controller.abort();
});

console.log('');
try {
  const summary = await runPush({ signal: controller.signal }, (line) => console.log(`  ${line}`));
  console.log('');
  for (const [table, n] of Object.entries(summary.live)) {
    console.log(`  ${String(n).padStart(5)}  ${table}`);
  }
  console.log('');
} catch (error) {
  console.log('');
  console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  console.log('');
  process.exitCode = 1;
}
