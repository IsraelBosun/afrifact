/**
 * Review decisions, stored outside the corpus files.
 *
 * The corpus lives in hand-written .ts files with comments and reasoning
 * in them. Writing an approval back into those means regenerating source
 * code, which would flatten the comments and turn one clicked button into
 * an unreviewable diff. So decisions live here instead, keyed by fact id.
 *
 * `reviews.json` is the file a Supabase `reviews` table replaces later:
 * same shape, same key, so the move is a swap of this module rather than
 * a change to anything that calls it.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Review, ReviewStatus } from '../types/provenance';

const here = dirname(fileURLToPath(import.meta.url));
const STORE = join(here, '..', '..', 'reviews.json');

/** factId -> the decision that overrides what the corpus file says. */
export type ReviewStore = Record<string, Review>;

function isStatus(value: unknown): value is ReviewStatus {
  return value === 'draft' || value === 'approved' || value === 'rejected' || value === 'needs-work';
}

/**
 * A stored decision is only trusted if it still parses as one. A corrupt
 * or hand-edited file should cost one review, not the whole store.
 */
function parse(raw: string): ReviewStore {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return {};

  const store: ReviewStore = {};
  for (const [factId, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as Record<string, unknown>;
    if (!isStatus(entry.status)) continue;

    store[factId] = {
      status: entry.status,
      reviewer: typeof entry.reviewer === 'string' ? entry.reviewer : '',
      reviewedAt: typeof entry.reviewedAt === 'string' ? entry.reviewedAt : '',
      ...(typeof entry.notes === 'string' ? { notes: entry.notes } : {}),
    };
  }
  return store;
}

export async function loadReviews(): Promise<ReviewStore> {
  try {
    return parse(await readFile(STORE, 'utf8'));
  } catch (error) {
    // No file yet is the normal first run, not a problem to report.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    console.warn(`  Could not read reviews.json, starting empty: ${String(error)}`);
    return {};
  }
}

export async function saveReview(factId: string, review: Review): Promise<ReviewStore> {
  const store = await loadReviews();
  store[factId] = review;
  await writeFile(STORE, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  return store;
}

/**
 * The corpus file's review, unless a decision has been recorded since.
 *
 * The stored decision wins because it is the more recent act: the .ts
 * file records what was true when the fact was written.
 */
export function effectiveReview(factId: string, fromCorpus: Review, store: ReviewStore): Review {
  return store[factId] ?? fromCorpus;
}

export const REVIEWS_PATH = STORE;
