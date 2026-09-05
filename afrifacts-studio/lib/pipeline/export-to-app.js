/**
 * Write approved facts into the app's phase-1 dummy data file.
 *
 * This is scaffolding, and it is worth being clear about why it exists at
 * all. CLAUDE.md §2 says the database is the only connection between the
 * studio and the app, and this crosses that line: it writes a file inside
 * `afrifacts/`. It is here because Supabase does not exist yet and the
 * alternative is never seeing real facts on a phone.
 *
 * What keeps it honest:
 *
 *   - It writes ONLY to `src/data/dummyFacts.ts`, the file already
 *     understood to be scaffolding, and never to app source.
 *   - It carries no keys and reads nothing from the app.
 *   - Every fact it writes is already approved and validator-clean.
 *   - The generated file says plainly that it is generated, so nobody
 *     hand-edits it and loses the work on the next run.
 *
 * Note that the file it writes is TypeScript: the app is still TS strict
 * and that has not changed. This is the one place the studio emits a
 * typed file, because the consumer is typed.
 *
 * When Supabase lands, this stage is deleted rather than adapted. The
 * app's `src/data/index.ts` changes from importing this file to querying
 * the database, and that is the whole switch.
 */

import { writeFile } from 'node:fs/promises';

import { loadReviewedCorpus } from '../check.js';
import { APP_DATA_PATH } from '../paths.js';
import { categoryPanel } from '../theme.js';
import { creditFor, findCandidate, loadImages, loadPool } from '../studio/images.js';
import { allQuizQuestions } from '../studio/quiz.js';
import { isPublishable, validateQuizQuestion } from '../validate.js';

/**
 * The app never sees provenance.
 *
 * Only the `fact` half of a SourcedFact crosses. Passages, surprise
 * scores, reviewer names and source tiers stay here — the app renders
 * facts, it does not audit them.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {import('../types/fact.js').FactImage | null} image
 */
function toAppFact(entry, image) {
  return { ...entry.fact, image };
}

/**
 * Turn an accepted image decision into the app's FactImage, or null.
 *
 * Only 'accepted' crosses. A 'proposed' match is the model's suggestion
 * sitting in a queue, and shipping one would be the image equivalent of
 * publishing an unreviewed fact.
 *
 * Every field is checked before it is written, because a card with a
 * missing credit is a licence breach rather than a cosmetic bug
 * (CLAUDE.md §10). If anything is absent, the fact ships without an
 * image — which it renders perfectly well.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {import('../studio/images.js').ImageStore} images
 * @param {import('../studio/images.js').ImagePool} pool
 * @returns {import('../types/fact.js').FactImage | null}
 */
function imageFor(entry, images, pool) {
  const decision = images[entry.fact.id];
  if (!decision || decision.status !== 'accepted' || decision.file.length === 0) return null;

  const candidate = findCandidate(pool, decision.file);
  if (!candidate) return null;

  const credit = creditFor(candidate);
  if (candidate.url.length === 0 || candidate.license.length === 0 || credit.length === 0) {
    return null;
  }

  return {
    url: candidate.url,
    credit,
    license: candidate.license,
    panelColor: categoryPanel(entry.fact.category),
  };
}

/**
 * @param {unknown[]} facts
 * @param {unknown[]} quiz
 */
function render(facts, quiz) {
  const today = new Date().toISOString().slice(0, 10);
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`npm run export\` in afrifacts-studio on ${today}.
 * Anything typed in here is lost on the next export.
 *
 * These are real, sourced, reviewed facts from the content pipeline, not
 * invented sample data. Every one was extracted from a source document,
 * had its passage string-matched against that source, and was approved by
 * a named reviewer before it reached this file.
 *
 * It is still phase-1 scaffolding. The app is supposed to read facts from
 * the database (CLAUDE.md §2), and this file exists only because that
 * database does not exist yet. When it does, \`src/data/index.ts\` starts
 * querying it and this file goes away.
 *
 * Most facts have \`image: null\`, and that is a designed state rather than
 * a gap. An image is attached only where a free-licence photograph
 * actually depicts the fact's subject; the rest render as typographic
 * cards, which §4.1 expects for roughly two thirds of the feed anyway.
 * Every image here is from Wikimedia Commons, licence-checked in code and
 * accepted by a named reviewer, and carries its credit.
 */

import type { Fact, QuizQuestion } from '@/src/types';

export const facts: Fact[] = ${JSON.stringify(facts, null, 2)};

export const quizQuestions: QuizQuestion[] = ${JSON.stringify(quiz, null, 2)};
`;
}

/*
  Quiz questions come from the store, not from the last run.

  This read used to point at `_generated/enriched-quiz.json`, which every
  enrich run overwrites. The consequence was invisible until someone
  counted: 148 facts in the app and 6 quiz questions, all from the two
  facts of the most recent run. Every other fact's questions had been
  generated, paid for, and overwritten. See `lib/studio/quiz.js`.
*/

/**
 * @typedef {object} ExportSummary
 * @property {number} facts
 * @property {number} quiz
 * @property {number} quizDropped
 * @property {number} photoCards
 * @property {number} typographic
 * @property {boolean} wrote
 * @property {string} path
 */

/**
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<ExportSummary>}
 */
export async function runExport(onProgress) {
  const say = onProgress ?? (() => {});

  const [merged, images, pool, allQuiz] = await Promise.all([
    loadReviewedCorpus(),
    loadImages(),
    loadPool(),
    allQuizQuestions(),
  ]);

  const approved = merged.filter(isPublishable);

  if (approved.length === 0) {
    say('Nothing is publishable. Approve some facts first.');
    return {
      facts: 0,
      quiz: 0,
      quizDropped: 0,
      photoCards: 0,
      typographic: 0,
      wrote: false,
      path: APP_DATA_PATH,
    };
  }

  // Only quiz questions whose fact actually shipped. A question pointing
  // at a fact the app does not have is a crash waiting on the quiz screen.
  const shippedIds = new Set(approved.map((e) => e.fact.id));
  const attached = allQuiz.filter((q) => shippedIds.has(q.factId));

  // And only questions that are actually well-formed. This used to be the
  // compiler's job — a three-option question could not be typed. Nothing
  // checks it now except this, and a malformed one crashes the quiz
  // screen rather than failing a build.
  const quiz = attached.filter((q) => validateQuizQuestion(q).length === 0);
  const dropped = attached.length - quiz.length;
  if (dropped > 0) {
    say(`${dropped} quiz question${dropped === 1 ? '' : 's'} dropped as malformed.`);
  }

  const withImages = approved.map((entry) => toAppFact(entry, imageFor(entry, images, pool)));
  const photoCards = withImages.filter((f) => f.image !== null).length;

  await writeFile(APP_DATA_PATH, render(withImages, quiz), 'utf8');

  say(`${approved.length} approved facts -> the app`);
  say(`${quiz.length} quiz questions`);
  say(
    `${photoCards} photo card${photoCards === 1 ? '' : 's'}, ${approved.length - photoCards} typographic`,
  );
  say(APP_DATA_PATH);
  say('Scaffolding: this file is replaced by Supabase later.');

  return {
    facts: approved.length,
    quiz: quiz.length,
    quizDropped: dropped,
    photoCards,
    typographic: approved.length - photoCards,
    wrote: true,
    path: APP_DATA_PATH,
  };
}
