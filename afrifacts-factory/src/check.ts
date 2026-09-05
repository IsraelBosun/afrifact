/**
 * Run the standard over the whole corpus and print what fails.
 *
 * `npm run check`
 *
 * Exits non-zero if anything has an error, so this can gate a publish
 * step later without changing.
 */

import { corpus } from './corpus';
import { effectiveReview, loadReviews } from './studio/reviews';
import { isPublishable, validateCorpus, type Problem } from './validate';

function groupByFact(problems: Problem[]): Map<string, Problem[]> {
  const grouped = new Map<string, Problem[]>();
  for (const problem of problems) {
    const list = grouped.get(problem.factId) ?? [];
    list.push(problem);
    grouped.set(problem.factId, list);
  }
  return grouped;
}

/**
 * Decisions made in the studio live in reviews.json, not in the corpus
 * files. check has to read them too, or approving a fact in the UI would
 * leave this reporting it unapproved — two sources of truth, and the one
 * that gates a publish disagreeing with the one the reviewer clicked.
 */
async function main(): Promise<void> {
  const store = await loadReviews();
  const entries = corpus.map((entry) => ({
    ...entry,
    provenance: {
      ...entry.provenance,
      review: effectiveReview(entry.fact.id, entry.provenance.review, store),
    },
  }));

  const problems = validateCorpus(entries);
  const errors = problems.filter((p) => p.level === 'error');
  const warnings = problems.filter((p) => p.level === 'warning');
  const publishable = entries.filter(isPublishable);

  console.log(`\n  Corpus: ${entries.length} fact${entries.length === 1 ? '' : 's'}`);
  console.log(`  Publishable: ${publishable.length}`);
  console.log(`  Errors: ${errors.length}   Warnings: ${warnings.length}\n`);

  if (problems.length > 0) {
    for (const [factId, list] of groupByFact(problems)) {
      console.log(`  ${factId}`);
      for (const problem of list) {
        const mark = problem.level === 'error' ? 'ERROR  ' : 'warning';
        console.log(`    ${mark}  ${problem.field}: ${problem.message}`);
      }
      console.log('');
    }
  }

  if (entries.length === 0) {
    console.log('  Corpus is empty. Nothing to check yet.\n');
    return;
  }

  if (errors.length > 0) {
    console.log(`  Not ready. Fix the ${errors.length} error${errors.length === 1 ? '' : 's'} above.\n`);
    process.exitCode = 1;
    return;
  }

  console.log('  No errors.\n');
}

void main();
