/**
 * The quiz store: paid model output, kept.
 *
 * `promote()` in facts.js is the reason an enriched fact survives the
 * next enrich run — the run writes a disposable file, promotion copies
 * the result into `data/`. Quiz questions were generated in the same
 * loop, by the same paid call, and had no promotion step. They were
 * written to `_generated/enriched-quiz.json` and read from there by
 * export, so every run silently discarded the previous run's questions
 * and the app shipped only the last batch.
 *
 * This is that missing half. Same policy as `promote()`, on purpose:
 *
 *   AN EXISTING ENTRY IS NEVER OVERWRITTEN.
 *
 * A fact whose questions are already stored keeps them, even if a rerun
 * generates new ones. That is what makes a rerun safe to click — the
 * cost of a wrong skip is one stale question, the cost of a wrong
 * overwrite is a hand-edited question destroyed with no copy anywhere.
 * `replace` exists for when you actually mean it, and its caller has to
 * say so.
 *
 * Keyed by fact id rather than stored as a flat array because that is
 * the question every caller asks — does this fact have questions yet —
 * and because it makes the skip above a lookup rather than a scan.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { QUIZ_PATH } from '../paths.js';

/**
 * @typedef {import('../types/fact.js').QuizQuestion} QuizQuestion
 * @typedef {Record<string, QuizQuestion[]>} QuizStore
 */

/**
 * Everything on disk, keyed by fact id.
 *
 * A missing file is an empty store, not an error: this is the first run
 * on a machine that has never enriched anything.
 *
 * @returns {Promise<QuizStore>}
 */
export async function loadQuizStore() {
  try {
    const parsed = JSON.parse(await readFile(QUIZ_PATH, 'utf8'));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    /** @type {QuizStore} */
    const store = {};
    for (const [factId, rows] of Object.entries(parsed)) {
      if (Array.isArray(rows)) store[factId] = rows;
    }
    return store;
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error)?.code === 'ENOENT') return {};
    throw error;
  }
}

/**
 * Every stored question, flattened, in fact-id order.
 *
 * Sorted so the exported file has a stable diff. Without it the order
 * follows whatever sequence the runs happened in, and a re-export with
 * no new questions shows as a large change.
 *
 * @returns {Promise<QuizQuestion[]>}
 */
export async function allQuizQuestions() {
  const store = await loadQuizStore();
  return Object.keys(store)
    .sort()
    .flatMap((factId) => store[factId]);
}

/**
 * Which of these fact ids already have questions.
 *
 * @param {string[]} factIds
 * @returns {Promise<Set<string>>}
 */
export async function factsWithQuiz(factIds) {
  const store = await loadQuizStore();
  return new Set(factIds.filter((id) => (store[id] ?? []).length > 0));
}

/**
 * Put a run's questions in the store.
 *
 * Rows arrive as the flat array the enrich run produces and are grouped
 * here, so callers do not have to know the store's shape. A row with no
 * `factId` is dropped rather than filed under `undefined`, where it
 * would be invisible to every lookup and still land in the app.
 *
 * @param {QuizQuestion[]} rows
 * @param {{ replace?: boolean }} [options] `replace` overwrites a fact's
 *   existing questions. Off by default; see the note at the top.
 * @returns {Promise<{ added: string[], kept: string[], questions: number }>}
 *   `added` and `kept` are fact ids: what this call stored, and what it
 *   left alone because there was already something there.
 */
export async function promoteQuiz(rows, options = {}) {
  const store = await loadQuizStore();

  /** @type {Map<string, QuizQuestion[]>} */
  const incoming = new Map();
  for (const row of rows) {
    const factId = typeof row?.factId === 'string' ? row.factId : '';
    if (factId.length === 0) continue;
    incoming.set(factId, [...(incoming.get(factId) ?? []), row]);
  }

  const added = [];
  const kept = [];
  let questions = 0;

  for (const [factId, group] of incoming) {
    const existing = store[factId] ?? [];
    if (existing.length > 0 && options.replace !== true) {
      kept.push(factId);
      continue;
    }
    store[factId] = group;
    added.push(factId);
    questions += group.length;
  }

  if (added.length > 0) {
    await mkdir(dirname(QUIZ_PATH), { recursive: true });
    // Sorted keys for the same reason as `allQuizQuestions`: this file is
    // read by a human when something is missing, and a stable order is
    // what makes "is nf_1042 in here" answerable by eye.
    /** @type {QuizStore} */
    const ordered = {};
    for (const factId of Object.keys(store).sort()) ordered[factId] = store[factId];
    await writeFile(QUIZ_PATH, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
  }

  return { added, kept, questions };
}
