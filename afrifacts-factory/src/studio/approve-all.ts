/**
 * Bulk approval. `npm run approve -- "Your Name"`
 *
 * The studio deliberately has no bulk-approve button: a control that
 * approves a hundred facts in one click is an approval but not a review,
 * and the whole point of that page is that the standard cannot be clicked
 * past. This exists because the reviewer asked for it explicitly, having
 * been told what it costs. It is a command rather than a button so it
 * stays a deliberate act, and so it leaves a note on every record saying
 * what actually happened.
 *
 * It approves only facts that already pass `validate()` with no errors —
 * a bulk action must not be a way around the validator, only around the
 * clicking.
 *
 * `--undo` puts everything this wrote back to draft.
 */

import { corpus } from '../corpus';
import { validate } from '../validate';
import { loadReviews, saveReview, REVIEWS_PATH } from './reviews';
import type { Review } from '../types/provenance';

const BULK_NOTE = 'Bulk approved without individual review.';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const undo = args.includes('--undo');
  const reviewer = args.find((a) => !a.startsWith('-'))?.trim() ?? '';

  if (!undo && reviewer.length === 0) {
    console.error(`\n  Who is approving? An approval must be attributable.`);
    console.error(`  npm run approve -- "Your Name"\n`);
    process.exitCode = 1;
    return;
  }

  const store = await loadReviews();
  const today = new Date().toISOString().slice(0, 10);

  if (undo) {
    let undone = 0;
    for (const [factId, review] of Object.entries(store)) {
      if (review.notes !== BULK_NOTE) continue;
      await saveReview(factId, {
        status: 'draft',
        reviewer: '',
        reviewedAt: today,
        notes: 'Bulk approval undone.',
      });
      undone += 1;
    }
    console.log(`\n  ${undone} bulk approvals reverted to draft.\n`);
    return;
  }

  let approved = 0;
  const skipped: string[] = [];
  const seen = new Set<string>();

  for (const entry of corpus) {
    // Two entries sharing an id would have the second silently overwrite
    // the first's decision — which is how a blocked fact once ended up
    // marked approved. Refuse rather than guess which one was meant.
    if (seen.has(entry.fact.id)) {
      skipped.push(`${entry.fact.id} — duplicate id, two facts claim it`);
      continue;
    }
    seen.add(entry.fact.id);

    const errors = validate(entry).filter((p) => p.level === 'error');
    if (errors.length > 0) {
      skipped.push(`${entry.fact.id} — ${errors.map((e) => e.field).join(', ')}`);
      continue;
    }

    const review: Review = {
      status: 'approved',
      reviewer,
      reviewedAt: today,
      notes: BULK_NOTE,
    };
    await saveReview(entry.fact.id, review);
    approved += 1;
  }

  console.log(`\n  ${approved} approved as '${reviewer}'.`);
  if (skipped.length > 0) {
    console.log(`  ${skipped.length} skipped:`);
    for (const line of skipped) console.log(`    ${line}`);
  }
  console.log(`\n  Written to ${REVIEWS_PATH}`);
  console.log(`  Every record notes that it was not individually reviewed.`);
  console.log(`  npm run approve -- --undo   puts them all back to draft\n`);
}

void main();
