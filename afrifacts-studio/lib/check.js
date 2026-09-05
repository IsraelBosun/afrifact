/**
 * Run the standard over the whole corpus.
 *
 * This is the first file written in the shape every stage moves to: the
 * work is a function that returns a result, and the CLI in `scripts/` is
 * a thin printer around it. The browser calls the same function. That
 * split is the reason the UI is not a rewrite — it is a second caller of
 * code the terminal already proved.
 *
 * Decisions made in the studio live in `data/reviews.json`, not in the
 * corpus files. Check has to read them too, or approving a fact in the UI
 * would leave this reporting it unapproved — two sources of truth, and
 * the one that gates a publish disagreeing with the one the reviewer
 * clicked.
 */

import { loadCorpus } from '../corpus/index.js';
import { effectiveReview, loadReviews } from './studio/reviews.js';
import { isPublishable, validateCorpus } from './validate.js';

/**
 * @typedef {object} CheckResult
 * @property {number} total
 * @property {number} publishable
 * @property {import('./validate.js').Problem[]} problems
 * @property {import('./validate.js').Problem[]} errors
 * @property {import('./validate.js').Problem[]} warnings
 * @property {Map<string, import('./validate.js').Problem[]>} byFact
 * @property {boolean} ok True when nothing is blocking a publish.
 */

/**
 * @param {import('./validate.js').Problem[]} problems
 * @returns {Map<string, import('./validate.js').Problem[]>}
 */
function groupByFact(problems) {
  const grouped = new Map();
  for (const problem of problems) {
    const list = grouped.get(problem.factId) ?? [];
    list.push(problem);
    grouped.set(problem.factId, list);
  }
  return grouped;
}

/**
 * The corpus with review decisions applied.
 *
 * Exported because every stage that cares whether a fact is approved —
 * check, export, the review pages — needs the same merged view, and
 * three of them computing it separately is how they drift apart.
 *
 * @returns {Promise<import('./types/provenance.js').SourcedFact[]>}
 */
export async function loadReviewedCorpus() {
  const [corpus, store] = await Promise.all([loadCorpus(), loadReviews()]);
  return corpus.map((entry) => ({
    ...entry,
    provenance: {
      ...entry.provenance,
      review: effectiveReview(entry.fact.id, entry.provenance.review, store),
    },
  }));
}

/**
 * @returns {Promise<CheckResult>}
 */
export async function runCheck() {
  const entries = await loadReviewedCorpus();

  const problems = validateCorpus(entries);
  const errors = problems.filter((p) => p.level === 'error');
  const warnings = problems.filter((p) => p.level === 'warning');
  const publishable = entries.filter(isPublishable);

  return {
    total: entries.length,
    publishable: publishable.length,
    problems,
    errors,
    warnings,
    byFact: groupByFact(problems),
    ok: errors.length === 0,
  };
}
