/**
 * Does the fact say who its people are?
 *
 * The judge was asked this and got it wrong in a consistent direction:
 * its readers are well-informed Nigerians, so Michael Ibru, Stella
 * Obasanjo and Patrick Sawyer all read as people everyone knows, and a
 * shortlist of five went out with four unintroduced names. So the
 * decision is taken away from judgement, the way truth is taken away
 * from it in verify.js:
 *
 *   1. The model EXTRACTS: which people are named, and which words in
 *      the sentence (if any) say who each one is. That is reading, which
 *      it does well, not deciding.
 *   2. CODE DECIDES: a person with no introduction, or only a family
 *      relation, fails the fact, unless they are on the owner's list of
 *      household names in data/household-names.json. That list is exact
 *      names, so "Olusegun Obasanjo" never covers "Stella Obasanjo".
 *   3. A failing fact gets ONE rewrite that adds the introductions, drawn
 *      from its passage and the article's opening sentences, and the
 *      rewrite must pass the verifier against those same words.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { DATA_DIR } from '../paths.js';
import { MAX_FACT_CHARS } from '../validate.js';
import { TARGET_FACT_CHARS } from './shorten.js';
import { groundedWithLead } from './verify.js';

const HOUSEHOLD_PATH = join(DATA_DIR, 'household-names.json');

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** @returns {Promise<Set<string>>} Every name and alias, normalised. */
async function householdNames() {
  try {
    const raw = JSON.parse(await readFile(HOUSEHOLD_PATH, 'utf8'));
    return new Set((raw.names ?? []).flatMap((n) => [n.name, ...(n.aliases ?? [])]).map(norm));
  } catch {
    return new Set();
  }
}

/**
 * @typedef {object} IntroCheck
 * @property {boolean} ok
 * @property {string[]} missing Names that need an introduction.
 * @property {{ name: string, introduction: string, kind: string }[]} people
 */

/**
 * @param {string} fact
 * @param {{ signal?: AbortSignal, onProgress?: (line: string) => void }} [options]
 * @returns {Promise<IntroCheck>}
 */
export async function checkIntroductions(fact, options = {}) {
  // Asked twice, and a name missing in EITHER reading fails the fact.
  // Measured: the same Ibru sentence was flagged on one call and passed
  // on the next. Failing safe costs one cheap call; passing an
  // unintroduced name costs a card the reader cannot make sense of.
  const [a, b] = await Promise.all([readPeople(fact, options), readPeople(fact, options)]);
  const household = await householdNames();
  const missingIn = (people) =>
    people
      .filter((p) => p.kind !== 'role' || p.introduction.length === 0)
      .filter((p) => !household.has(norm(p.name)))
      .map((p) => p.name);
  const missing = [...new Set([...missingIn(a), ...missingIn(b)])];
  return { ok: missing.length === 0, missing, people: a };
}

/**
 * One reading of who is named and how they are introduced.
 *
 * @param {string} fact
 * @param {{ signal?: AbortSignal, onProgress?: (line: string) => void }} options
 */
async function readPeople(fact, options) {
  const prompt = await loadPrompt('introductions', { fact });
  const raw = await completeJson(
    { model: MODELS.judge, prompt, temperature: 0, signal: options.signal },
    options.onProgress,
  );
  return Array.isArray(raw?.people)
    ? raw.people
        .filter((p) => typeof p?.name === 'string' && p.name.trim().length > 0)
        .map((p) => ({
          name: p.name.trim(),
          introduction: typeof p.introduction === 'string' ? p.introduction.trim() : '',
          kind: ['role', 'relation', 'none'].includes(p.kind) ? p.kind : 'none',
        }))
    : [];
}

/**
 * Rewrite a fact so its people are introduced, or return null.
 *
 * The rewrite is kept only if it fits the card, passes the verifier
 * against the passage and the lead, and passes the introduction check.
 *
 * @param {string} fact
 * @param {string} passage
 * @param {string} lead
 * @param {string[]} missing
 * @param {{ signal?: AbortSignal, onProgress?: (line: string) => void }} [options]
 * @returns {Promise<{ fact: string, usedLead: boolean } | null>}
 */
export async function introduce(fact, passage, lead, missing, options = {}) {
  // Two attempts. Measured on the Bonetta fact: a rewrite that passed
  // every check on a second call had been lost to one bad first reading,
  // which dropped the strongest story on the shortlist.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (options.signal?.aborted) return null;
    const result = await introduceOnce(fact, passage, lead, missing, options);
    if (result) return result;
  }
  return null;
}

/**
 * @param {string} fact
 * @param {string} passage
 * @param {string} lead
 * @param {string[]} missing
 * @param {{ signal?: AbortSignal, onProgress?: (line: string) => void }} options
 */
async function introduceOnce(fact, passage, lead, missing, options) {
  const prompt = await loadPrompt('introduce', {
    missing: missing.map((m) => `- ${m}`).join('\n'),
    fact,
    passage,
    lead,
    limit: String(TARGET_FACT_CHARS),
  });
  const raw = await completeJson(
    { model: MODELS.extract, prompt, temperature: 0, signal: options.signal },
    options.onProgress,
  );
  const next = typeof raw?.fact === 'string' ? raw.fact.trim() : '';
  if (next.length === 0 || next.length > MAX_FACT_CHARS) return null;

  const grounded = groundedWithLead(next, passage, lead);
  if (!grounded.ok) return null;
  const again = await checkIntroductions(next, options);
  return again.ok ? { fact: next, usedLead: grounded.usedLead } : null;
}
