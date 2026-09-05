/**
 * Bulk image acceptance. `npm run accept-images -- "Your Name"`
 *
 * The sibling of `approve-all.ts`, and it carries the same warning. The
 * /images page has no accept-everything button on purpose: the one thing
 * a person adds to this stage is looking at the picture and asking whether
 * it shows what the fact says. A command that accepts thirty-two images
 * without anyone seeing them skips exactly that.
 *
 * It exists because the reviewer asked for it, and it is a command rather
 * than a button so it stays a deliberate act. Every record it writes says
 * plainly that no one looked, so the ones still needing a real look can be
 * found later — and `--undo` reverts exactly those and nothing else.
 *
 * What it will not do: accept a file that is not in the licence-checked
 * pool. The pool is the only place a verified licence and credit for an
 * image exist, so an image outside it cannot be published whatever anyone
 * clicks or types.
 */

import { corpus } from '../corpus';
import { findCandidate, loadImages, loadPool, saveImages, IMAGES_PATH } from './images';

const BULK_NOTE = 'Bulk accepted without individual review.';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const undo = args.includes('--undo');
  const reviewer = args.find((a) => !a.startsWith('-'))?.trim() ?? '';

  if (!undo && reviewer.length === 0) {
    console.error(`\n  Who is accepting? An accepted image is attributable.`);
    console.error(`  npm run accept-images -- "Your Name"\n`);
    process.exitCode = 1;
    return;
  }

  const store = await loadImages();
  const pool = await loadPool();
  const today = new Date().toISOString().slice(0, 10);

  if (undo) {
    let undone = 0;
    for (const decision of Object.values(store)) {
      if (decision.reasoning !== BULK_NOTE) continue;
      decision.status = 'proposed';
      decision.decidedBy = '';
      decision.decidedAt = today;
      decision.reasoning = 'Bulk acceptance undone.';
      undone += 1;
    }
    await saveImages(store);
    console.log(`\n  ${undone} bulk acceptance(s) back to proposed.\n`);
    return;
  }

  const known = new Set(corpus.map((e) => e.fact.id));
  let accepted = 0;
  const skipped: string[] = [];

  for (const [factId, decision] of Object.entries(store)) {
    if (decision.status !== 'proposed') continue;

    if (!known.has(factId)) {
      skipped.push(`${factId} — no such fact in the corpus`);
      continue;
    }
    // The licence and the credit live on the pool record. No record, no
    // publishable image, regardless of what the decision file says.
    if (findCandidate(pool, decision.file) === null) {
      skipped.push(`${factId} — '${decision.file}' is not in the licence-checked pool`);
      continue;
    }

    store[factId] = {
      status: 'accepted',
      file: decision.file,
      reasoning: BULK_NOTE,
      decidedBy: reviewer,
      decidedAt: today,
    };
    accepted += 1;
  }

  await saveImages(store);

  console.log(`\n  ${accepted} image(s) accepted as '${reviewer}'.`);
  if (skipped.length > 0) {
    console.log(`  ${skipped.length} skipped:`);
    for (const line of skipped) console.log(`    ${line}`);
  }
  console.log(`\n  Written to ${IMAGES_PATH}`);
  console.log(`  Every record notes that it was not individually reviewed.`);
  console.log(`  npm run accept-images -- --undo   puts them back to proposed`);
  console.log(`\n  Now run:  npm run export\n`);
}

void main();
