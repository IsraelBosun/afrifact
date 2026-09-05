/**
 * What the review pages read.
 *
 * These used to live inside the old studio's HTTP handlers. They are not
 * HTTP: they are the shape of a review queue, and leaving them in a route
 * handler meant the only way to test them was to start a server and curl
 * it. The Next routes are thin callers of these.
 */

import { readFile } from 'node:fs/promises';

import { loadCorpus } from '../../corpus/index.js';
import { IMAGES_PATH, REVIEWS_PATH } from '../paths.js';
import { validate } from '../validate.js';
import { creditFor, findCandidate, loadImages, loadPool } from './images.js';
import { effectiveReview, loadReviews } from './reviews.js';

const PLACEHOLDER = /^\s*(todo|tbd|fixme|xxx|placeholder|\.\.\.|-)\b/i;

/** @param {string | undefined} value */
function isFilledIn(value) {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER.test(trimmed);
}

/**
 * One fact, as the review page needs it.
 *
 * `clean` is the load-bearing field: the page disables Approve while it is
 * false, so the standard cannot be clicked past. It is computed from
 * `validate()` rather than stored, so it can never drift from what
 * `npm run check` would say.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {import('../types/provenance.js').Review} review
 */
export function toView(entry, review) {
  const problems = validate(entry);
  const errors = problems.filter((p) => p.level === 'error');
  // Only facts in the store can be edited. The hand-authored ones are
  // defined in `corpus/*.js` and an editor writing over them would be a
  // program rewriting source, so the page says so rather than offering a
  // form that fails on submit.
  const record = entry.record ?? null;

  return {
    id: entry.fact.id,
    editable: record !== null,
    revision: record?.revision ?? 0,
    updatedAt: record?.updatedAt ?? '',
    updatedBy: record?.updatedBy ?? '',
    category: entry.fact.category,
    country: entry.fact.country,
    fact: entry.fact.fact,
    factNumber: entry.fact.factNumber,
    status: review.status,
    reviewer: review.reviewer,
    reviewedAt: review.reviewedAt,
    notes: review.notes ?? '',
    errors,
    warnings: problems.filter((p) => p.level === 'warning'),
    clean: errors.length === 0,
    /*
      Is this fact in the app right now?

      The same three conditions `isPublishable` applies, said once here so
      the row can offer the one verb that applies to it: a live fact can
      only be held back, a fact that is not live can only be published.
    */
    live:
      errors.length === 0 &&
      review.status === 'approved' &&
      record?.queued !== true,
    queued: record?.queued === true,
    surprise: entry.provenance.surprise,
    decay: entry.provenance.decay,
    sources: entry.provenance.sources.map((source) => ({
      shortName: source.shortName,
      citation: source.citation,
      tier: source.tier,
      passage: source.passage,
      passageMissing: !isFilledIn(source.passage),
      locator: Object.fromEntries(
        Object.entries(source.locator ?? {}).filter(
          ([, v]) => typeof v === 'string' && v.length > 0,
        ),
      ),
      ...(source.note ? { note: source.note } : {}),
    })),
    deepDive: {
      body: entry.fact.deepDive.body,
      whyItMatters: entry.fact.deepDive.whyItMatters,
      readTime: entry.fact.deepDive.readTime,
      suggestedQuestion: entry.fact.deepDive.suggestedQuestion ?? '',
    },
  };
}

/**
 * The image half of a fact, for the page that edits it.
 *
 * Review is where a decided image is changed, because the image queue now
 * holds only what is still waiting. Same data either way — one decision,
 * plus the article's licence-checked pool so a swap needs no second call.
 */
function imageViewFor(entry, images, pool) {
  const article = entry.provenance.sources[0]?.shortName ?? '';
  const candidates = pool[article] ?? [];
  const decision = images[entry.fact.id];
  const chosen = decision ? findCandidate(pool, decision.file) : null;

  return {
    article,
    status: decision?.status ?? 'none',
    reasoning: decision?.reasoning ?? '',
    decidedBy: decision?.decidedBy ?? '',
    decidedAt: decision?.decidedAt ?? '',
    chosen: chosen ? { ...chosen, credit: creditFor(chosen) } : null,
    pool: candidates.map((c) => ({ ...c, credit: creditFor(c) })),
  };
}

/**
 * A stamp that sorts. Date-only values sit at the start of their day, so
 * a coarse stamp can never outrank a precise one recorded the same day.
 *
 * @param {unknown} value
 */
function sortable(value) {
  if (typeof value !== 'string' || value.length === 0) return '';
  return value.includes('T') ? value : `${value}T00:00:00.000Z`;
}

/**
 * When this fact was last worked on.
 *
 * The review page is a worklist, and a worklist reads newest first: the
 * fact you just touched is the one you are most likely to want back.
 * Left in corpus order it read oldest first, so a fact edited a second
 * ago sat a hundred and forty rows down.
 *
 * Work is recorded in three places and this is the only thing that looks
 * at all three: the store timestamps an edit or a hold, `images.json` a
 * picture, `reviews.json` a decision. Taking the latest of them is what
 * makes changing a picture count as having done something — that write
 * never touches the store, so a store-only sort would have left a fact
 * exactly where it was the moment after you worked on it.
 *
 * ISO strings compare correctly as text, so no dates are parsed here.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {import('../types/provenance.js').Review} review
 * @param {import('./images.js').ImageDecision | undefined} image
 */
function lastTouched(entry, review, image) {
  const record = entry.record ?? null;
  return [
    record?.updatedAt,
    record?.createdAt,
    image?.at,
    image?.decidedAt,
    review.reviewedAt,
  ].reduce((latest, value) => {
    const stamp = sortable(value);
    return stamp > latest ? stamp : latest;
  }, '');
}

/** The fact review queue — and the one place a published fact is edited. */
export async function buildFactsPayload() {
  const [corpus, store, images, pool] = await Promise.all([
    loadCorpus(),
    loadReviews(),
    loadImages(),
    loadPool(),
  ]);
  return {
    facts: corpus
      .map((entry) => {
        const review = effectiveReview(entry.fact.id, entry.provenance.review, store);
        return {
          ...toView(entry, review),
          image: imageViewFor(entry, images, pool),
          touchedAt: lastTouched(entry, review, images[entry.fact.id]),
        };
      })
      // Newest first. A fact nothing is recorded about sorts last, which
      // is where an untouched one belongs on a list of what you have done.
      .sort((a, b) => (a.touchedAt < b.touchedAt ? 1 : a.touchedAt > b.touchedAt ? -1 : 0)),
    reviewsPath: REVIEWS_PATH,
  };
}

/**
 * The image queue: what is still waiting on you, and nothing else.
 *
 * One row per fact with a proposal to judge or a pool to choose from. A
 * fact whose image has been accepted or rejected is finished and does not
 * appear — that was the complaint about this page, and it was a fair one:
 * 131 rows of settled work with the handful of live ones scattered
 * through it is not a queue, it is an archive with buttons.
 *
 * A decided image is still changeable, on `/review`, which carries the
 * same pool. Finished work moves to where it is edited rather than
 * staying where it is decided.
 *
 * The article is carried through so a swap needs no second call — the
 * reviewer's real question is usually "not that one, but what about this
 * one", and a queue that only says yes or no cannot answer it.
 */
export async function buildImagePayload() {
  const [corpus, images, pool] = await Promise.all([loadCorpus(), loadImages(), loadPool()]);

  let decided = 0;

  const rows = corpus
    .map((entry) => {
      const decision = images[entry.fact.id];
      const view = imageViewFor(entry, images, pool);

      if (decision && (decision.status === 'accepted' || decision.status === 'rejected')) {
        decided += 1;
        return null;
      }

      /*
        A fact whose article carried no free image used to be dropped
        here — nothing to show, nothing to choose from, so nothing to
        ask. That stopped being true when the row gained a search: the
        article having nothing is now the reason to look elsewhere, not
        the reason to hide.
      */

      return {
        factId: entry.fact.id,
        fact: entry.fact.fact,
        category: entry.fact.category,
        ...view,
      };
    })
    .filter((row) => row !== null);

  /** Which images are already spoken for, so the page can grey them out. */
  /** @type {Record<string, string>} */
  const taken = {};
  for (const [factId, decision] of Object.entries(images)) {
    if (decision.status === 'rejected' || decision.file.length === 0) continue;
    taken[decision.file] = factId;
  }

  return { rows, taken, decided, imagesPath: IMAGES_PATH };
}

/** A pipeline file that does not exist yet is an empty list, not an error. */
export async function readJsonArray(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

