/**
 * `npm run agent`                              open brief, 5 strong facts
 * `npm run agent -- "Nigerian music industry"` a brief
 * `npm run agent -- "..." --target 3`          a different target
 * `npm run agent -- --country GH`              another country (ISO code)
 *
 * Research only. It ends with a shortlist saved in data/agent-runs/ and
 * waits for your answer on the studio's /agent page, where approving
 * develops the facts (deep dive, image, further reading) and publishes
 * them. That page is the one place the agent asks you anything.
 *
 * Costs money: every document read is one extraction plus three to six
 * judge calls per fact. A web search spends up to 4 of the month's 250
 * SerpApi queries; the run is capped at 5.
 *
 * Ctrl-C stops after the step in flight; what was found is still saved.
 */

import { findFacts } from '../lib/agent/index.js';
import { loadRun } from '../lib/agent/runs.js';
import { hasApiKey } from '../lib/llm/index.js';

const args = process.argv.slice(2);
const at = args.indexOf('--target');
const target = at === -1 ? undefined : Number(args[at + 1]);
const ct = args.indexOf('--country');
const country = ct === -1 ? undefined : String(args[ct + 1] ?? '').toUpperCase();
// A flag's value is skipped only when the flag is there: with `at` at -1,
// `i !== at + 1` used to drop the first word of the brief.
const values = new Set([at, ct].filter((i) => i !== -1).map((i) => i + 1));
const brief = args.filter((a, i) => !a.startsWith('--') && !values.has(i)).join(' ');

if (!(await hasApiKey())) {
  console.error('\n  No DEEPSEEK_API_KEY in afrifacts-studio/.env. Nothing was run.\n');
  process.exit(1);
}

const controller = new AbortController();
let asked = false;
process.on('SIGINT', () => {
  if (asked) process.exit(130);
  asked = true;
  console.log('\n  Stopping after the current step. Ctrl-C again to quit now.\n');
  controller.abort();
});

console.log('');
const result = await findFacts(
  { brief, country, target: Number.isInteger(target) && target > 0 ? target : undefined, signal: controller.signal },
  (line) => console.log(`  ${line}`),
);

const run = await loadRun(result.runId);
if (run && run.shortlist.length > 0) {
  console.log('');
  console.log('  SHORTLIST');
  for (const p of run.shortlist) console.log(`    ${p.key}  [${p.category}, ${p.votes}] ${p.fact}`);
  if (run.alternates.length > 0) {
    console.log(`  ${run.alternates.length} alternate(s) set aside for variety.`);
  }
  console.log('');
  console.log('  Choose which to develop on the studio page: http://127.0.0.1:3000/agent');
}
console.log('');
