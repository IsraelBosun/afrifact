/**
 * `npm run judge:eval`                 measure the judge, default sample
 * `npm run judge:eval -- --sample 40`  more facts per pool
 * `npm run judge:eval -- --pairs 15`   more comparisons per matchup
 * `npm run judge:eval -- --no-pairs`   skip the comparison test
 * `npm run judge:eval -- --seed 7`     a different sample
 *
 * Costs money: three model calls per fact assessed and two per pair. The
 * default run is about 250 calls. Writes `_generated/judge-eval.json`
 * with every reading, so a disagreement can be read, not just counted.
 *
 * WHAT IT TESTS AGAINST. There is almost no record of facts a person
 * rejected for being dull (one, at the time of writing), so the judge is
 * tested on pools whose right answer is known for other reasons:
 *
 *   gold      Founder exemplars the judge was NOT shown. Odd-numbered
 *             exemplars go in the prompt; even-numbered are tested.
 *   approved  Facts that passed human review. Mostly good, not all great,
 *             so a pass rate below gold is expected, not a failure.
 *   known     Facts everyone in Nigeria knows, written in the same style
 *             as the corpus. This is the README's measured failure: a
 *             judge that passes these is the judge that rated
 *             everything 4-5.
 *   source    Plain sentences lifted from the cached source documents.
 *             True and specific, but nobody chose them. A caveat: they
 *             read like an encyclopedia, not like a fact card, so a judge
 *             can beat this pool on style alone. `known` has no such
 *             tell, which is why it is the harder and more honest test.
 *   declined  Facts a reviewer marked rejected or needs-work, if any
 *             survive. Too few to score; listed for reading.
 *
 * Ctrl-C stops after the calls in flight. Nothing is written on a stop.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { EXEMPLARS } from '../lib/calibration/exemplars.js';
import { assess, compare, exemplarsForJudge, mapLimit } from '../lib/judge/index.js';
import { MODELS, hasApiKey } from '../lib/llm/index.js';
import { CACHE_DIR, DATA_DIR, FACTS_PATH, GENERATED_DIR, REVIEWS_PATH, ensureDirs } from '../lib/paths.js';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : Number(args[i + 1]);
};
const SAMPLE = flag('--sample', 20);
const PAIRS = args.includes('--no-pairs') ? 0 : flag('--pairs', 8);
const SEED = flag('--seed', 1);
const CONCURRENCY = 4;

/**
 * Well-known facts, as the negative control.
 *
 * Hand-written for this test, not by the founder. Every one is true and
 * every one is something most Nigerians learned in school or hear weekly.
 * Phrased like corpus facts on purpose, so the judge cannot fail them on
 * style and has to fail them on content.
 */
const KNOWN = [
  'Nigeria gained independence from Britain on 1 October 1960.',
  "Abuja replaced Lagos as Nigeria's capital in 1991.",
  'Nigeria is the most populous country in Africa.',
  'Jollof rice is one of the most popular dishes in Nigeria and across West Africa.',
  "Nigeria's three largest ethnic groups are the Hausa-Fulani, the Yoruba and the Igbo.",
  "Nollywood, Nigeria's film industry, is one of the largest in the world by the number of films it makes.",
  'Chinua Achebe wrote Things Fall Apart, one of the most widely read African novels ever published.',
  'The naira is the currency of Nigeria.',
  'Wole Soyinka won the Nobel Prize in Literature in 1986.',
  'Crude oil is Nigeria’s largest export and a major source of government revenue.',
  "Lagos is Nigeria's largest city and its commercial centre.",
  'Nigeria is made up of 36 states and the Federal Capital Territory.',
  'Fela Kuti is widely credited as a pioneer of Afrobeat music.',
  "The Super Eagles are Nigeria's men's national football team.",
  'The Niger River flows through Nigeria and gives the country its name.',
].map((text) => ({ text, country: 'NG' }));

/** Small seeded RNG, so a rerun with the same seed tests the same facts. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @template T @param {T[]} list @param {number} n @param {() => number} rand */
function sample(list, n, rand) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Sentences from the cache that could be a fact but were never chosen.
 *
 * Kept to single sentences with something specific in them (a digit, or
 * a name after the first word), and never one that sits inside a passage
 * a real fact was built from.
 */
async function sourceSentences(passages) {
  const files = (await readdir(CACHE_DIR)).filter((f) => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    let doc;
    try {
      doc = JSON.parse(await readFile(join(CACHE_DIR, f), 'utf8'));
    } catch {
      continue;
    }
    if (typeof doc?.text !== 'string') continue;
    for (const line of doc.text.split(/\n+/)) {
      if (line.startsWith('=')) continue;
      for (const s of line.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
        const t = s.trim();
        if (t.length < 70 || t.length > 230 || !/[.!?]$/.test(t)) continue;
        if (!/\d/.test(t) && !/\s[A-Z][a-z]/.test(t)) continue;
        const n = norm(t);
        if (passages.some((p) => p.includes(n) || n.includes(p))) continue;
        out.push({ text: t, country: doc.country ?? 'NG', from: doc.slug });
      }
    }
  }
  return out;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

if (!(await hasApiKey())) {
  console.error('\n  No DEEPSEEK_API_KEY in afrifacts-studio/.env. Nothing was run.\n');
  process.exit(1);
}

const controller = new AbortController();
process.on('SIGINT', () => {
  console.log('\n  Stopping. Nothing will be written.\n');
  controller.abort();
});

/**
 * A person's verdicts on facts the judge got "wrong", keyed by exact text.
 * In `data/` because nothing can recompute a person's judgement.
 */
const labels = await readJson(join(DATA_DIR, 'judge-labels.json'), {});

const rand = rng(SEED);
const facts = Object.values(await readJson(FACTS_PATH, {}));
const reviews = await readJson(REVIEWS_PATH, {});
const oldReviews = await readJson(join(GENERATED_DIR, 'reviews.before-drop-rejected.json'), {});

const passages = facts
  .flatMap((f) => f.provenance?.sources ?? [])
  .map((s) => norm(s.passage ?? ''))
  .filter((p) => p.length > 0);

const shown = EXEMPLARS.filter((e) => e.n % 2 === 1).map((e) => e.n);
const exemplars = exemplarsForJudge(shown);

const statusOf = (id) => reviews[id]?.status ?? oldReviews[id]?.status;
const asJudgeFact = (f) => ({ text: f.fact.fact, country: f.fact.country, id: f.fact.id });

/** @type {Record<string, { text: string, country?: string }[]>} */
const pools = {
  gold: EXEMPLARS.filter((e) => e.n % 2 === 0).map((e) => ({ text: e.text, country: 'NG', id: `ex_${e.n}` })),
  approved: sample(facts.filter((f) => statusOf(f.fact.id) === 'approved').map(asJudgeFact), SAMPLE, rand),
  known: KNOWN,
  source: sample(await sourceSentences(passages), SAMPLE, rand),
  declined: facts
    .filter((f) => ['rejected', 'needs-work'].includes(statusOf(f.fact.id)))
    .map(asJudgeFact),
};

const total = Object.values(pools).reduce((n, p) => n + p.length, 0);
console.log('');
console.log(`  Judge eval on ${MODELS.judge}, seed ${SEED}`);
console.log(`  Exemplars shown to the judge: ${shown.join(', ')}. Tested on the rest.`);
for (const [name, items] of Object.entries(pools)) console.log(`    ${name.padEnd(9)} ${items.length}`);
console.log(`  Assessing ${total} facts (${total * 3} calls)...`);

let done = 0;
const opts = { exemplars, signal: controller.signal, onProgress: (l) => console.log(`    ${l}`) };

/** @type {Record<string, any[]>} */
const assessed = {};
for (const [name, items] of Object.entries(pools)) {
  assessed[name] = await mapLimit(items, CONCURRENCY, async (item) => {
    const result = await assess(item, opts);
    done += 1;
    if (done % 10 === 0) console.log(`    ${done}/${total}`);
    return { ...item, ...result };
  });
  if (controller.signal.aborted) process.exit(130);
}

/** Matchups where the answer is known: the first pool should win. */
const MATCHUPS = [
  ['gold', 'known'],
  ['approved', 'known'],
  ['gold', 'source'],
  ['approved', 'source'],
  ['gold', 'approved'],
];

/** @type {Record<string, any[]>} */
const compared = {};
if (PAIRS > 0) {
  console.log(`  Comparing ${MATCHUPS.length} matchups x ${PAIRS} pairs (${MATCHUPS.length * PAIRS * 2} calls)...`);
  for (const [hi, lo] of MATCHUPS) {
    const his = sample(pools[hi], PAIRS, rand);
    const los = sample(pools[lo], PAIRS, rand);
    const pairs = his.slice(0, Math.min(his.length, los.length)).map((h, i) => [h, los[i]]);
    compared[`${hi}>${lo}`] = await mapLimit(pairs, CONCURRENCY, async ([h, l]) => {
      const r = await compare(h, l, opts);
      return { expected: h.text, other: l.text, ...r };
    });
    if (controller.signal.aborted) process.exit(130);
  }
}

/* Report. */

const pct = (n, d) => (d === 0 ? '  -' : `${Math.round((100 * n) / d)}%`.padStart(4));
const summary = { model: MODELS.judge, seed: SEED, shownExemplars: shown, pools: {}, matchups: {} };

console.log('');
console.log('  PANEL (passes with 2 of 3 votes)');
console.log('    pool       n   pass   avg votes   want');
const want = { gold: 'high', approved: 'high', known: 'low', source: 'low', declined: 'read' };
for (const [name, rows] of Object.entries(assessed)) {
  if (rows.length === 0) continue;
  const pass = rows.filter((r) => r.pass).length;
  const avg = rows.reduce((n, r) => n + r.votes, 0) / rows.length;
  summary.pools[name] = { n: rows.length, pass, avgVotes: Number(avg.toFixed(2)) };
  console.log(`    ${name.padEnd(9)} ${String(rows.length).padStart(3)}   ${pct(pass, rows.length)}   ${avg.toFixed(2).padStart(9)}   ${want[name]}`);
}

// Agreement. A fact's pool gives the default answer (gold and approved
// should pass, known and source should fail), and a person's label in
// `data/judge-labels.json` overrides it. The override matters: the first
// eval failed five approved facts, and on reading them they were weak,
// so the pool default was wrong and the judge was right.
const scored = ['gold', 'approved', 'known', 'source'].flatMap((pool) =>
  assessed[pool].map((r) => {
    const label = labels[r.text]?.label;
    const strong = label ? label === 'strong' : pool === 'gold' || pool === 'approved';
    return { ...r, pool, strong, labelled: Boolean(label) };
  }),
);
const good = scored.filter((r) => r.strong);
const bad = scored.filter((r) => !r.strong);
const right = good.filter((r) => r.pass).length + bad.filter((r) => !r.pass).length;
summary.agreement = Number((right / scored.length).toFixed(3));
const knownRight = assessed.known.filter((r) => !r.pass).length;
const labelled = scored.filter((r) => r.labelled);
const labelledRight = labelled.filter((r) => r.pass === r.strong).length;
console.log('');
console.log(`  Agreement with the expected answer: ${pct(right, scored.length)} (${right}/${scored.length})`);
console.log(`  Well-known facts correctly failed:  ${pct(knownRight, assessed.known.length)} (the README's failure mode)`);
if (labelled.length > 0) {
  console.log(`  Your labelled facts in this sample: ${labelledRight}/${labelled.length} agree`);
}

if (PAIRS > 0) {
  console.log('');
  console.log('  COMPARISONS (asked in both orders; a flip is a tie)');
  console.log('    matchup              right  wrong  tie');
  for (const [name, rows] of Object.entries(compared)) {
    const r = rows.filter((x) => x.winner === 'a').length;
    const w = rows.filter((x) => x.winner === 'b').length;
    const t = rows.length - r - w;
    summary.matchups[name] = { n: rows.length, right: r, wrong: w, tie: t };
    console.log(`    ${name.padEnd(20)} ${String(r).padStart(5)}  ${String(w).padStart(5)}  ${String(t).padStart(3)}`);
  }
}

// The misses are the useful part: what did it get wrong, and why.
const misses = [
  ...good.filter((r) => !r.pass).map((r) => ({ side: 'good fact failed', ...r })),
  ...bad.filter((r) => r.pass).map((r) => ({ side: 'dull fact passed', ...r })),
];
if (misses.length > 0) {
  console.log('');
  console.log(`  MISSES (${misses.length}, first 8; all of them are in the report file)`);
  for (const m of misses.slice(0, 8)) {
    console.log(`    [${m.side}, ${m.votes} votes] ${m.text.slice(0, 110)}`);
    const r = m.readings[0];
    if (r) console.log(`      ${r.persona}: ${r.kind}. ${r.why.slice(0, 140)}`);
  }
}

await ensureDirs();
const out = join(GENERATED_DIR, 'judge-eval.json');
await writeFile(out, `${JSON.stringify({ summary, assessed, compared, misses }, null, 2)}\n`);
console.log('');
console.log(`  Full report: ${out}`);
console.log('');
