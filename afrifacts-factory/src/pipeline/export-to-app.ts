/**
 * Write approved facts into the app's phase-1 dummy data file.
 *
 * `npm run export`
 *
 * This is scaffolding, and it is worth being clear about why it exists at
 * all. CLAUDE.md §2 says the database is the only connection between the
 * factory and the app, and this crosses that line: it writes a file
 * inside `afrifacts/`. It is here because Supabase does not exist yet and
 * the alternative is never seeing real facts on a phone.
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
 * When Supabase lands, this script is deleted rather than adapted. The
 * app's `src/data/index.ts` changes from importing this file to querying
 * the database, and that is the whole switch.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, sep } from 'node:path';
import { corpus } from '../corpus';
import { isPublishable } from '../validate';
import { effectiveReview, loadReviews } from '../studio/reviews';
import { creditFor, findCandidate, loadImages, loadPool } from '../studio/images';
import { enrichedQuiz } from '../../_enriched';
import { categoryPanel } from '../theme';
import type { ImagePool, ImageStore } from '../studio/images';
import type { FactImage } from '../types/fact';
import type { SourcedFact } from '../types/provenance';

const here = dirname(fileURLToPath(import.meta.url));
const APP_DATA = join(here, '..', '..', '..', 'afrifacts', 'src', 'data', 'dummyFacts.ts');

/**
 * The app never sees provenance.
 *
 * Only the `fact` half of a `SourcedFact` crosses. Passages, surprise
 * scores, reviewer names and source tiers stay in the factory — the app
 * renders facts, it does not audit them.
 */
function toAppFact(entry: SourcedFact, image: FactImage | null): unknown {
  return { ...entry.fact, image };
}

/**
 * Turn an accepted image decision into the app's `FactImage`, or null.
 *
 * Only 'accepted' crosses. A 'proposed' match is the model's suggestion
 * sitting in a queue, and shipping one would be the image equivalent of
 * publishing an unreviewed fact.
 *
 * Every field is checked before it is written, because a card with a
 * missing credit is a licence breach rather than a cosmetic bug
 * (CLAUDE.md §10). If anything is absent, the fact ships without an
 * image — which it renders perfectly well.
 */
function imageFor(entry: SourcedFact, images: ImageStore, pool: ImagePool): FactImage | null {
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

function render(facts: unknown[], quiz: unknown[]): string {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`npm run export\` in afrifacts-factory on ${new Date()
   .toISOString()
   .slice(0, 10)}.
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

async function main(): Promise<void> {
  const store = await loadReviews();
  const images = await loadImages();
  const pool = await loadPool();

  const merged = corpus.map((entry) => ({
    ...entry,
    provenance: {
      ...entry.provenance,
      review: effectiveReview(entry.fact.id, entry.provenance.review, store),
    },
  }));

  const approved = merged.filter(isPublishable);

  if (approved.length === 0) {
    console.error(`\n  Nothing is publishable. Approve some facts first.\n`);
    process.exitCode = 1;
    return;
  }

  // Only quiz questions whose fact actually shipped. A question pointing
  // at a fact the app does not have is a crash waiting on the quiz screen.
  const shippedIds = new Set(approved.map((e) => e.fact.id));
  const quiz = enrichedQuiz.filter((q) => shippedIds.has(q.factId));

  const withImages = approved.map((entry) => toAppFact(entry, imageFor(entry, images, pool)));
  const photoCards = withImages.filter((f) => (f as { image: unknown }).image !== null).length;

  await writeFile(APP_DATA, render(withImages, quiz), 'utf8');

  console.log(`\n  ${approved.length} approved facts -> the app`);
  console.log(`  ${quiz.length} quiz questions`);
  console.log(
    `  ${photoCards} photo card${photoCards === 1 ? '' : 's'}, ` +
      `${approved.length - photoCards} typographic`,
  );
  console.log(`  ${APP_DATA}`);
  console.log(`\n  Scaffolding: this file is replaced by Supabase later.\n`);
}

if (process.argv[1]?.split(sep).at(-1) === 'export-to-app.ts') {
  void main();
}
