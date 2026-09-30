/**
 * Facts from the live app that passed the judge, used as examples.
 *
 * The founder's 22 exemplars say what AfriFacts is aiming for. These say
 * what it has actually hit: real facts, in the app's own voice, across
 * every category, that a three-reader panel rated strong and the owner
 * agreed with. "Examples beat instructions" was the finding that made
 * extraction work in the first place; this is more of the same medicine.
 *
 * They go to the EXTRACTOR, never to the judge. The judge chose them, so
 * showing them back to it would teach it to agree with itself, and would
 * put the eval's test facts inside its prompt. The writer learns from the
 * judge; the judge stays an independent check on the writer.
 *
 * Written by `npm run judge:learn`. A missing file means no section in
 * the prompt, not an error: extraction worked before this existed.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { DATA_DIR } from '../paths.js';

export const LEARNED_PATH = join(DATA_DIR, 'learned-facts.json');

/**
 * @typedef {object} LearnedFact
 * @property {string} id
 * @property {string} category
 * @property {string} text
 * @property {number} votes
 * @property {string} why One reader's reason, kept for people, not the prompt.
 */

/** @returns {Promise<LearnedFact[]>} */
export async function loadLearned() {
  try {
    const raw = JSON.parse(await readFile(LEARNED_PATH, 'utf8'));
    return Array.isArray(raw?.facts) ? raw.facts : [];
  } catch {
    return [];
  }
}

/**
 * The prompt section, grouped by category so the model sees range rather
 * than 33 history facts in a row. Fact text only: the readers' reasons are
 * written in a persona's voice, and a model shown them would imitate the
 * voice rather than the facts.
 *
 * @returns {Promise<string>} Empty when there is nothing learned yet.
 */
export async function learnedSection() {
  const facts = await loadLearned();
  if (facts.length === 0) return '';

  /** @type {Record<string, string[]>} */
  const groups = {};
  for (const f of facts) (groups[f.category] ??= []).push(`- ${f.text}`);

  const body = Object.entries(groups)
    .map(([category, lines]) => `${category}:\n${lines.join('\n')}`)
    .join('\n\n');

  return `## More from the live collection

These ${facts.length} are already in the app and were rated strong by a panel
of readers. They are here to show the range and the voice across every
category, not as topics to repeat: never return a fact that says the same
thing as one of these.

${body}

`;
}
