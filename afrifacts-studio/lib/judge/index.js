/**
 * Deciding which facts are interesting, without a person.
 *
 * The README measured the model as a bad judge: asked "would an educated
 * Nigerian already know this", it rated almost everything 4 or 5. That
 * finding still stands, and this file does not argue with it. It changes
 * the QUESTION, in three ways that each target a known failure:
 *
 *   1. NO SCORES. A 1-5 scale lets the model hedge upward on everything.
 *      `assess` asks for specific, falsifiable answers instead: what would
 *      you have assumed, does this overturn it, what would you text a
 *      friend. A reader who cannot write the text message has told you
 *      the fact is flat, whatever they call it.
 *
 *   2. OBSCURE IS NAMED. The measured failure was scoring obscure when
 *      the question was surprising. So "obscure" is one of the four
 *      answers the model must choose between, and only "surprising"
 *      passes. The confusion is made into a choice it has to make out
 *      loud.
 *
 *   3. A PANEL, NOT A JUDGE. Three personas read each fact and a fact
 *      needs two votes. One model playing three people is weaker than
 *      three models, but it still breaks the single-voice habit of rating
 *      everything the same way.
 *
 * And `compare` exists because comparisons are far more stable than
 * absolute judgements. "Which of these two" is a question the model
 * answers consistently even when "how good is this" is noise. Each pair
 * is asked twice with the order swapped, and a pair that flips with the
 * order is recorded as a tie rather than a win, which is how position
 * bias is kept out of the ranking.
 *
 * Whether any of this worked is not asserted here. `npm run judge:eval`
 * runs the judge against the founder's exemplars, the approved corpus and
 * facts everyone knows, and reports how often it agrees. Trust the
 * number, not this comment.
 */

import { EXEMPLARS } from '../calibration/exemplars.js';
import { MODELS, completeJson, loadPrompt } from '../llm/index.js';

/**
 * The panel. Written in `{{country}}` terms so the same three people work
 * for every country the corpus reaches, not just Nigeria.
 */
export const PERSONAS = [
  {
    id: 'scroller',
    text: 'Someone in their early twenties living in a big city in {{country}}. You scroll fast, you have seen every "did you know" post, and you only share things that will make your group chat reply "no way".',
  },
  {
    id: 'teacher',
    text: 'A secondary-school history teacher in {{country}}. You have read widely, you know the textbook story of the country well, and you are hard to impress with anything that is in the textbook.',
  },
  {
    id: 'diaspora',
    // Was "hungry for the stories behind them", and was the soft vote:
    // it passed 9 of 20 plain encyclopedia sentences on the first eval,
    // twice the rate of either other reader. The next version, "only
    // forward one when it changes how you see home", overcorrected and
    // dismissed the founder's own Merlin exemplar. This sits between.
    text: 'Someone from {{country}} who grew up abroad. You follow the headlines and know the big names. Your family group chat is full of forwarded "did you know" posts and you ignore the vague ones, but a real name, a real number or an unexpected link between two things you know will get you to forward it.',
  },
];

/** A fact passes the panel with this many "surprising, would share" votes. */
export const VOTES_TO_PASS = 2;

const COUNTRY_NAMES = {
  NG: 'Nigeria',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  EG: 'Egypt',
  ET: 'Ethiopia',
  TZ: 'Tanzania',
  GN: 'Guinea',
  AO: 'Angola',
  BW: 'Botswana',
  MZ: 'Mozambique',
  ZM: 'Zambia',
  SL: 'Sierra Leone',
  CM: 'Cameroon',
  RW: 'Rwanda',
  GM: 'Gambia',
};

/** The countries the agent can research, in the order the studio lists them. */
export const AGENT_COUNTRIES = [
  'NG', 'AO', 'BW', 'CM', 'GM', 'GH', 'GN', 'KE', 'MZ', 'RW', 'SL', 'ZA', 'TZ', 'ZM',
];

/** @param {string} [code] */
export function countryName(code) {
  return COUNTRY_NAMES[code ?? 'NG'] ?? code ?? 'Nigeria';
}

/**
 * The exemplars as the judge sees them.
 *
 * `only` exists for the eval: an exemplar the judge was shown cannot also
 * be used to test it, so the eval shows one half and tests on the other.
 * In real use every exemplar goes in.
 *
 * @param {number[]} [only] Exemplar numbers to include.
 */
export function exemplarsForJudge(only) {
  return EXEMPLARS.filter((e) => !only || only.includes(e.n))
    .map((e) => `- ${e.text}\n  (why it works: ${e.works})`)
    .join('\n\n');
}

/**
 * @typedef {object} JudgeFact
 * @property {string} text
 * @property {string} [country] ISO code. Defaults to NG.
 */

/**
 * @typedef {object} JudgeOptions
 * @property {string} [exemplars] Preformatted exemplar block. Defaults to all.
 * @property {AbortSignal} [signal]
 * @property {(line: string) => void} [onProgress]
 */

/**
 * @typedef {object} Reading One persona's answer.
 * @property {string} persona
 * @property {boolean} standalone
 * @property {string} assumption
 * @property {boolean} overturns
 * @property {boolean} alreadyKnown
 * @property {string} retell
 * @property {boolean} hasBecause
 * @property {'surprising' | 'obscure' | 'known' | 'flat'} kind
 * @property {boolean} share
 * @property {string} why
 * @property {boolean} vote The one bit that counts, decided here in code.
 */

/**
 * @typedef {object} Assessment
 * @property {boolean} pass
 * @property {number} votes
 * @property {number} counted Readings that came back well-formed.
 * @property {Reading[]} readings
 */

const KINDS = ['surprising', 'obscure', 'known', 'flat'];

/**
 * Check a reading's shape and turn it into a vote.
 *
 * The vote is decided HERE, from the answers, not taken from the model's
 * `share` alone. A reader who says "surprising, would share" but also
 * "I already knew this" or who cannot write the retell line has
 * contradicted themselves, and a contradiction counts against the fact.
 *
 * @param {any} raw
 * @param {string} persona
 * @returns {Reading | null}
 */
function parseReading(raw, persona) {
  if (!raw || typeof raw !== 'object' || !KINDS.includes(raw.kind)) return null;
  const retell = typeof raw.retell === 'string' ? raw.retell.trim() : '';
  const reading = {
    persona,
    // Missing counts as standalone: only an explicit `false` fails.
    standalone: raw.standalone !== false,
    assumption: String(raw.assumption ?? ''),
    overturns: raw.overturns === true,
    alreadyKnown: raw.alreadyKnown === true,
    retell,
    hasBecause: raw.hasBecause === true,
    kind: raw.kind,
    share: raw.share === true,
    why: String(raw.why ?? ''),
  };
  reading.vote =
    reading.standalone &&
    reading.kind === 'surprising' &&
    reading.share &&
    reading.overturns &&
    !reading.alreadyKnown &&
    retell.length > 0;
  return reading;
}

/**
 * Put one fact in front of the panel.
 *
 * Three model calls. A reading that comes back malformed is dropped and
 * does not count as a vote either way, and `counted` says how many did.
 *
 * @param {JudgeFact} fact
 * @param {JudgeOptions} [options]
 * @returns {Promise<Assessment>}
 */
export async function assess(fact, options = {}) {
  const country = countryName(fact.country);
  const exemplars = options.exemplars ?? exemplarsForJudge();

  const readings = await Promise.all(
    PERSONAS.map(async (p) => {
      const prompt = await loadPrompt('judge-assess', {
        persona: p.text.replaceAll('{{country}}', country),
        country,
        exemplars,
        fact: fact.text,
      });
      try {
        const raw = await completeJson(
          { model: MODELS.judge, prompt, temperature: 0, signal: options.signal },
          options.onProgress,
        );
        return parseReading(raw, p.id);
      } catch (error) {
        if (options.signal?.aborted) throw error;
        options.onProgress?.(`judge: ${p.id} failed: ${error instanceof Error ? error.message : error}`);
        return null;
      }
    }),
  );

  const good = readings.filter((r) => r !== null);
  const votes = good.filter((r) => r.vote).length;
  return { pass: votes >= VOTES_TO_PASS, votes, counted: good.length, readings: good };
}

/**
 * @typedef {object} Comparison
 * @property {'a' | 'b' | 'tie'} winner
 * @property {string[]} why One reason per ordering.
 */

/**
 * Which of two facts is more interesting. Asked in both orders.
 *
 * @param {JudgeFact} a
 * @param {JudgeFact} b
 * @param {JudgeOptions} [options]
 * @returns {Promise<Comparison>}
 */
export async function compare(a, b, options = {}) {
  const country = countryName(a.country);
  const exemplars = options.exemplars ?? exemplarsForJudge();

  /** @returns {Promise<{ first: boolean | null, why: string }>} */
  const ask = async (first, second) => {
    const prompt = await loadPrompt('judge-compare', {
      country,
      exemplars,
      a: first.text,
      b: second.text,
    });
    try {
      const raw = await completeJson(
        { model: MODELS.judge, prompt, temperature: 0, signal: options.signal },
        options.onProgress,
      );
      const w = String(raw?.winner ?? '').trim().toUpperCase();
      return { first: w === 'A' ? true : w === 'B' ? false : null, why: String(raw?.why ?? '') };
    } catch (error) {
      if (options.signal?.aborted) throw error;
      return { first: null, why: `failed: ${error instanceof Error ? error.message : error}` };
    }
  };

  const [ab, ba] = await Promise.all([ask(a, b), ask(b, a)]);
  // a wins only if it wins from both seats.
  const aWins = ab.first === true && ba.first === false;
  const bWins = ab.first === false && ba.first === true;
  return { winner: aWins ? 'a' : bWins ? 'b' : 'tie', why: [ab.why, ba.why] };
}

/**
 * Rank facts by a Swiss tournament of `compare`.
 *
 * A full round robin is n squared comparisons, which is 900 pairs for 30
 * candidates. Swiss pairs facts with similar records each round, so the
 * top separates from the bottom in about log2(n) rounds, n/2 pairs each.
 * A tie gives both half a point.
 *
 * @template {JudgeFact} T
 * @param {T[]} facts
 * @param {JudgeOptions & { rounds?: number }} [options]
 * @returns {Promise<{ fact: T, points: number }[]>} Best first.
 */
export async function rank(facts, options = {}) {
  const rounds = options.rounds ?? Math.ceil(Math.log2(Math.max(facts.length, 2))) + 1;
  const table = facts.map((fact, i) => ({ fact, points: 0, i, met: new Set() }));

  for (let round = 1; round <= rounds; round += 1) {
    if (options.signal?.aborted) break;
    const order = [...table].sort((x, y) => y.points - x.points || x.i - y.i);
    /** @type {[typeof table[0], typeof table[0]][]} */
    const pairs = [];
    const used = new Set();
    for (const p of order) {
      if (used.has(p)) continue;
      // Nearest-ranked opponent not met yet, falling back to any rematch.
      const q =
        order.find((o) => o !== p && !used.has(o) && !p.met.has(o.i)) ??
        order.find((o) => o !== p && !used.has(o));
      if (!q) break;
      used.add(p).add(q);
      pairs.push([p, q]);
    }

    await mapLimit(pairs, 4, async ([p, q]) => {
      const r = await compare(p.fact, q.fact, options);
      p.met.add(q.i);
      q.met.add(p.i);
      if (r.winner === 'a') p.points += 1;
      else if (r.winner === 'b') q.points += 1;
      else {
        p.points += 0.5;
        q.points += 0.5;
      }
    });
    options.onProgress?.(`rank: round ${round}/${rounds} done`);
  }

  const ordered = table.sort((x, y) => y.points - x.points || x.i - y.i);

  // A tie at the top is decided by list order unless someone decides it.
  // Measured on the five Dantata facts: the owner's favourite tied for
  // first and would have won or lost on where it happened to sit. The
  // top is the only place the order is acted on, so it gets a playoff.
  if (ordered.length > 1 && ordered[0].points === ordered[1].points && !options.signal?.aborted) {
    const playoff = await compare(ordered[0].fact, ordered[1].fact, options);
    if (playoff.winner === 'b') [ordered[0], ordered[1]] = [ordered[1], ordered[0]];
    options.onProgress?.(`rank: playoff for first, ${playoff.winner === 'tie' ? 'still tied' : 'decided'}`);
  }

  return ordered.map(({ fact, points }) => ({ fact, points }));
}

/**
 * Run `fn` over `items`, at most `limit` at a time.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 * @returns {Promise<R[]>}
 */
export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
