/**
 * Review decisions, stored outside the corpus files.
 *
 * The corpus lives in hand-written files with comments and reasoning in
 * them. Writing an approval back into those means regenerating source
 * code, which would flatten the comments and turn one clicked button into
 * an unreviewable diff. So decisions live here instead, keyed by fact id.
 *
 * `data/reviews.json` is the file a Supabase `reviews` table replaces
 * later: same shape, same key, so the move is a swap of this module
 * rather than a change to anything that calls it.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { REVIEWS_PATH, ensureDirs } from '../paths.js';
import { REVIEW_STATUSES } from '../types/provenance.js';

/**
 * factId -> the decision that overrides what the corpus file says.
 * @typedef {Record<string, import('../types/provenance.js').Review>} ReviewStore
 */

/** @param {unknown} value */
function isStatus(value) {
  return typeof value === 'string' && REVIEW_STATUSES.includes(value);
}

/**
 * A stored decision is only trusted if it still parses as one. A corrupt
 * or hand-edited file should cost one review, not the whole store.
 *
 * @param {string} raw
 * @returns {ReviewStore}
 */
function parse(raw) {
  const parsed = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return {};

  /** @type {ReviewStore} */
  const store = {};
  for (const [factId, value] of Object.entries(parsed)) {
    if (typeof value !== 'object' || value === null) continue;
    if (!isStatus(value.status)) continue;

    store[factId] = {
      status: value.status,
      reviewer: typeof value.reviewer === 'string' ? value.reviewer : '',
      reviewedAt: typeof value.reviewedAt === 'string' ? value.reviewedAt : '',
      ...(typeof value.notes === 'string' ? { notes: value.notes } : {}),
    };
  }
  return store;
}

/** @returns {Promise<ReviewStore>} */
export async function loadReviews() {
  try {
    return parse(await readFile(REVIEWS_PATH, 'utf8'));
  } catch (error) {
    // No file yet is the normal first run, not a problem to report.
    if (error?.code === 'ENOENT') return {};
    console.warn(`  Could not read reviews.json, starting empty: ${String(error)}`);
    return {};
  }
}

/**
 * @param {string} factId
 * @param {import('../types/provenance.js').Review} review
 * @returns {Promise<ReviewStore>}
 */
export async function saveReview(factId, review) {
  await ensureDirs();
  const store = await loadReviews();
  store[factId] = review;
  await writeFile(REVIEWS_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  return store;
}

/**
 * Forget a fact's decision, because the fact is gone.
 *
 * Only ever called by delete. A decision keyed to an id nothing answers
 * to is not harmless: `check` and the export both read this file, and a
 * later fact minted under a recycled id would inherit an approval nobody
 * gave it.
 *
 * @param {string} factId
 * @returns {Promise<boolean>} whether there was one to forget
 */
export async function deleteReview(factId) {
  const store = await loadReviews();
  if (!Object.hasOwn(store, factId)) return false;
  delete store[factId];
  await ensureDirs();
  await writeFile(REVIEWS_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  return true;
}

/**
 * The corpus file's review, unless a decision has been recorded since.
 *
 * The stored decision wins because it is the more recent act: the corpus
 * file records what was true when the fact was written.
 *
 * @param {string} factId
 * @param {import('../types/provenance.js').Review} fromCorpus
 * @param {ReviewStore} store
 */
export function effectiveReview(factId, fromCorpus, store) {
  return store[factId] ?? fromCorpus;
}

export { REVIEWS_PATH };
