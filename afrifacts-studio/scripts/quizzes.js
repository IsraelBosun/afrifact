/**
 * `npm run quizzes`            questions for publishable facts that have none
 * `npm run quizzes -- --force` rewrite questions for facts that already have them
 *
 * Costs money: one short model call per fact. Writes data/quiz.json, and
 * never overwrites a fact's existing questions unless you pass --force.
 *
 * This exists because enrich used to leave its questions in
 * `_generated/enriched-quiz.json`, which the next run overwrote. Re-running
 * enrich does not fix that — enrich mints a new fact id every time, so it
 * would create second copies of 146 facts rather than refilling their
 * quizzes. This writes against the ids that already exist.
 *
 * Ctrl-C stops after the current fact. Everything written so far is saved.
 */

import { runQuizzes } from '../lib/pipeline/quiz-backfill.js';

const force = process.argv.slice(2).includes('--force');

const controller = new AbortController();
let asked = false;
process.on('SIGINT', () => {
  if (asked) process.exit(130);
  asked = true;
  console.log('\n  Stopping after the current fact. Ctrl-C again to quit now.\n');
  controller.abort();
});

console.log('');
const summary = await runQuizzes({ force, signal: controller.signal }, (line) =>
  console.log(`  ${line}`),
);
console.log('');

if (summary.failed > 0 && summary.questions === 0) process.exitCode = 1;
