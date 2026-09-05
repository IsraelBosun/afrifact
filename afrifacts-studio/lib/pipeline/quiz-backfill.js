/**
 * Quiz questions for facts that lost theirs.
 *
 * Enrich writes a fact and its three questions in one call. The fact was
 * promoted into `data/facts.json` and survived; the questions were left
 * in `_generated/enriched-quiz.json`, which the next run overwrote. When
 * that was found the app held 148 facts and 6 questions.
 *
 * `lib/studio/quiz.js` stops it happening again. This stage is the other
 * half — recovering what was already lost — and it is a separate stage
 * rather than a re-run of enrich for one hard reason: enrich mints a NEW
 * fact id every time, so re-enriching a promoted candidate does not
 * refill its quiz, it creates a second fact saying the same thing. This
 * writes questions against the fact ids that already exist and touches
 * nothing else.
 *
 * It also costs a fraction of an enrich. There is no document to send —
 * the deep dive was already written from the source, so the fact and its
 * own article are the whole prompt, and the model is not being asked to
 * research anything. The deep dive standing in for the source document
 * is the one compromise here, and it is a real one: a question can only
 * be as grounded as the article it is drawn from. That is acceptable
 * because §4.3's quiz explicitly tests what the reader was just told,
 * and because a question that strays outside the article is a question
 * the reader could not have answered anyway.
 *
 * Once every fact has questions this stage does nothing and says so.
 */

import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { isPublishable } from '../validate.js';
import { loadReviewedCorpus } from '../check.js';
import { loadQuizStore, promoteQuiz } from '../studio/quiz.js';
import { parseQuiz } from './enrich.js';

/**
 * Three questions for one fact.
 *
 * @param {import('../types/fact.js').Fact} fact
 * @param {(line: string) => void} [onProgress]
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('../types/fact.js').QuizQuestion[]>}
 */
export async function quizFor(fact, onProgress, signal) {
  const prompt = await loadPrompt('quiz', {
    fact: fact.fact,
    body: fact.deepDive.body.join('\n\n'),
    whyItMatters: fact.deepDive.whyItMatters,
  });

  const raw = await completeJson(
    { model: MODELS.enrich, prompt, temperature: 0.3, signal },
    onProgress,
  );

  return parseQuiz(raw?.quiz, fact.id);
}

/**
 * @typedef {object} QuizSummary
 * @property {number} facts Publishable facts that have questions now.
 * @property {number} questions Questions in the store now.
 * @property {number} failed
 * @property {number} skipped Facts that already had questions.
 * @property {number} questionsKept Facts whose existing questions were
 *   left alone because `force` was off.
 * @property {boolean} stopped
 */

/**
 * @param {{ force?: boolean, signal?: AbortSignal }} [options] `force`
 *   rewrites questions for facts that already have them. Off by default:
 *   an existing question may have been edited by hand, and there is no
 *   second copy of it anywhere.
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<QuizSummary>}
 */
export async function runQuizzes(options = {}, onProgress) {
  const say = onProgress ?? (() => {});
  const { force = false, signal } = options;

  const [corpus, store] = await Promise.all([loadReviewedCorpus(), loadQuizStore()]);

  // Only facts that actually ship. Writing questions for a fact the app
  // will not carry spends money on a question export drops anyway.
  const publishable = corpus.filter(isPublishable).map((entry) => entry.fact);

  const has = (id) => (store[id] ?? []).length > 0;
  const chosen = force ? publishable : publishable.filter((fact) => !has(fact.id));
  const skipped = publishable.length - chosen.length;

  if (chosen.length === 0) {
    say(
      publishable.length === 0
        ? 'Nothing publishable. Approve some facts first.'
        : `All ${publishable.length} publishable facts already have questions.`,
    );
    return { facts: 0, questions: 0, failed: 0, skipped, questionsKept: 0, stopped: false };
  }

  if (skipped > 0) say(`${skipped} already have questions, skipping`);
  say(`Writing questions for ${chosen.length} fact${chosen.length === 1 ? '' : 's'} with ${MODELS.enrich}`);

  /** @type {import('../types/fact.js').QuizQuestion[]} */
  const written = [];
  let failed = 0;
  let stopped = false;

  for (const fact of chosen) {
    if (signal?.aborted) {
      stopped = true;
      say('Stopped. Everything written so far is saved.');
      break;
    }

    try {
      const quiz = await quizFor(fact, undefined, signal);
      // Three or nothing. A fact with one question is worse than a fact
      // with none: the feed injects a quiz card promising three.
      if (quiz.length < 3) {
        failed += 1;
        say(`x ${fact.id}  only ${quiz.length} usable question${quiz.length === 1 ? '' : 's'} came back`);
        continue;
      }
      written.push(...quiz);
      say(`+ ${fact.id}  ${quiz.length} questions  ${fact.fact.slice(0, 52)}`);
    } catch (error) {
      if (signal?.aborted) {
        stopped = true;
        say('Stopped mid-fact. That one was not saved, so it will run again.');
        break;
      }
      failed += 1;
      say(`x ${fact.id}  ${error instanceof Error ? error.message : String(error)}`);
    }

    // Save as we go rather than at the end. A run over 146 facts that
    // dies on the last one should not throw away the other 145 — they
    // were paid for individually and they are individually useful.
    if (written.length >= 30) {
      await promoteQuiz(written.splice(0), { replace: force });
    }
  }

  const promotion = await promoteQuiz(written, { replace: force });

  const total = (await loadQuizStore());
  const factsNow = Object.keys(total).filter((id) => total[id].length > 0).length;

  say(`${factsNow} of ${publishable.length} publishable facts now have questions`);
  if (failed > 0) say(`${failed} failed`);
  say('Run export to put them in the app.');

  return {
    facts: factsNow,
    questions: Object.values(total).reduce((n, rows) => n + rows.length, 0),
    failed,
    skipped,
    questionsKept: promotion.kept.length,
    stopped,
  };
}
