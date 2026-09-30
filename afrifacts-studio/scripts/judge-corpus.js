/**
 * `npm run judge:corpus`   judge every live fact, list the weak ones
 *
 * Costs money: three model calls per live fact. Writes
 * `_generated/corpus-verdicts.json`. Changes nothing in `data/` and
 * unpublishes nothing; see lib/judge/corpus.js for why.
 *
 * Ctrl-C stops the run. Nothing is written on a stop.
 */

import { runJudgeCorpus } from '../lib/judge/corpus.js';
import { hasApiKey } from '../lib/llm/index.js';

if (!(await hasApiKey())) {
  console.error('\n  No DEEPSEEK_API_KEY in afrifacts-studio/.env. Nothing was run.\n');
  process.exit(1);
}

const controller = new AbortController();
process.on('SIGINT', () => {
  console.log('\n  Stopping. Nothing will be written.\n');
  controller.abort();
});

console.log('');
const { total, passed, weak } = await runJudgeCorpus({ signal: controller.signal }, (line) =>
  console.log(`  ${line}`),
);

const byCategory = {};
for (const w of weak) byCategory[w.category] = (byCategory[w.category] ?? 0) + 1;

console.log('');
console.log(`  ${passed}/${total} passed. ${weak.length} weak.`);
console.log(`  Weak by category: ${Object.entries(byCategory).map(([c, n]) => `${c} ${n}`).join(', ')}`);
console.log('');
for (const w of weak) {
  const note = w.label ? `  (you said ${w.label})` : '';
  console.log(`  ${w.id}  ${w.votes}/3  ${w.text.slice(0, 100)}${note}`);
  const why = w.readings.find((r) => !r.vote);
  if (why) console.log(`           ${why.persona}: ${why.kind}. ${why.why.slice(0, 120)}`);
}
console.log('');
