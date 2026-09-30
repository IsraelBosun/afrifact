/**
 * Put every live fact in front of the judge.
 *
 * The first evals failed about a third of the approved corpus, and on
 * reading them the owner agreed: they were weak. Those facts are in front
 * of readers now. This finds all of them.
 *
 * It decides nothing. It writes `_generated/corpus-verdicts.json` and
 * prints the facts that failed, weakest first. Pulling a fact from the
 * app stays a review decision, made on /review, because a verdict here is
 * a model's opinion and unpublishing is not undoable from the reader's
 * side: a fact someone saved should not vanish on a prompt change.
 *
 * Every fact is judged with all 22 exemplars in the prompt, unlike the
 * eval, which hides half of them to test on. This is real use.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { loadReviewedCorpus } from '../check.js';
import { MODELS } from '../llm/index.js';
import { DATA_DIR, GENERATED_DIR, ensureDirs } from '../paths.js';
import { isPublishable } from '../validate.js';
import { assess, mapLimit } from './index.js';

export const VERDICTS_PATH = join(GENERATED_DIR, 'corpus-verdicts.json');

/**
 * @typedef {object} CorpusVerdict
 * @property {string} id
 * @property {string} category
 * @property {string} text
 * @property {boolean} pass
 * @property {number} votes
 * @property {string | undefined} label The owner's own verdict, if given.
 * @property {import('./index.js').Reading[]} readings
 */

/**
 * @param {{ signal?: AbortSignal }} [options]
 * @param {(line: string) => void} [onProgress]
 */
export async function runJudgeCorpus(options = {}, onProgress = () => {}) {
  const entries = (await loadReviewedCorpus()).filter(isPublishable);
  let labels = {};
  try {
    labels = JSON.parse(await readFile(join(DATA_DIR, 'judge-labels.json'), 'utf8'));
  } catch {
    // No labels yet is fine: they only annotate the output.
  }

  onProgress(`Judging ${entries.length} live facts on ${MODELS.judge} (${entries.length * 3} calls)`);

  let done = 0;
  /** @type {CorpusVerdict[]} */
  const verdicts = await mapLimit(entries, 4, async (entry) => {
    const result = await assess(
      { text: entry.fact.fact, country: entry.fact.country },
      { signal: options.signal, onProgress },
    );
    done += 1;
    if (done % 10 === 0) onProgress(`${done}/${entries.length}`);
    return {
      id: entry.fact.id,
      category: entry.fact.category,
      text: entry.fact.fact,
      pass: result.pass,
      votes: result.votes,
      label: labels[entry.fact.fact]?.label,
      readings: result.readings,
    };
  });

  await ensureDirs();
  await writeFile(
    VERDICTS_PATH,
    `${JSON.stringify({ model: MODELS.judge, judgedAt: new Date().toISOString(), verdicts }, null, 2)}\n`,
  );

  const weak = verdicts.filter((v) => !v.pass).sort((a, b) => a.votes - b.votes);
  return { total: verdicts.length, passed: verdicts.length - weak.length, weak, verdicts };
}
