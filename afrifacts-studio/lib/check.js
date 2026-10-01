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
import { checkImageUrl } from './pipeline/image-reachable.js';
import { findCandidate, loadImages, loadPool } from './studio/images.js';
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

const LINK_CONCURRENCY = 4;

/**
 * Why a published fact will show as a text-only card.
 *
 * Warnings, not errors: a typographic card is a designed variant, and a
 * fact with no fitting photograph should still ship. But nothing else
 * says which approved facts went out bare, and that list kept being
 * discovered on the phone instead of here.
 *
 * @param {import('./types/provenance.js').SourcedFact[]} publishable
 * @param {import('./studio/images.js').ImageStore} store
 * @param {import('./studio/images.js').ImagePool} pool
 * @returns {import('./validate.js').Problem[]}
 */
function imageProblems(publishable, store, pool) {
  /** @type {import('./validate.js').Problem[]} */
  const problems = [];
  for (const { fact } of publishable) {
    const decision = store[fact.id];
    const warn = (message) =>
      problems.push({ factId: fact.id, level: 'warning', field: 'image', message });

    if (!decision) {
      warn('Approved with no picture chosen. Run `npm run images` to propose one.');
    } else if (decision.status === 'proposed') {
      warn('A picture is proposed and waiting for review.');
    } else if (decision.status === 'rejected') {
      warn('Picture rejected, so the card is text only. `npm run images` proposes another.');
    } else if (findCandidate(pool, decision.file) === null) {
      warn(`Accepted picture ${decision.file} has no licence record, so it cannot ship.`);
    }
  }
  return problems;
}

/**
 * Ask for every accepted picture the way a phone would.
 *
 * Only with `--links`, because it is a network pass over every image and
 * the rest of the check is offline. A 4xx or a page that is not an image
 * is the host refusing phones, which is what hotlink protection does. A
 * failure to connect at all is reported separately: on a managed network
 * that is as likely to be the proxy as the site, so it wants a look from
 * a phone before the picture is replaced.
 *
 * @param {import('./types/provenance.js').SourcedFact[]} publishable
 * @param {import('./studio/images.js').ImageStore} store
 * @param {import('./studio/images.js').ImagePool} pool
 * @returns {Promise<import('./validate.js').Problem[]>}
 */
async function linkProblems(publishable, store, pool) {
  const jobs = [];
  for (const { fact } of publishable) {
    const decision = store[fact.id];
    if (decision?.status !== 'accepted') continue;
    const candidate = findCandidate(pool, decision.file);
    if (candidate) jobs.push({ factId: fact.id, url: candidate.url });
  }

  /** @type {import('./validate.js').Problem[]} */
  const problems = [];
  const next = async () => {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      const host = new URL(job.url).hostname;
      const warn = (message) =>
        problems.push({ factId: job.factId, level: 'warning', field: 'image', message });
      const { verdict, detail } = await checkImageUrl(job.url);
      if (verdict === 'refused') {
        warn(`${host} refuses the picture (${detail}). Phones show a text card.`);
      } else if (verdict === 'unreachable') {
        warn(`${host} could not be reached from here (${detail}). Check it on a phone.`);
      } else if (verdict === 'rate-limited') {
        warn(`${host} kept rate-limiting this check. Not a phone problem; run again later.`);
      }
    }
  };
  await Promise.all(Array.from({ length: LINK_CONCURRENCY }, next));
  return problems;
}

/**
 * @param {{ links?: boolean }} [options] `links` also fetches every
 *   accepted picture to see whether it loads.
 * @returns {Promise<CheckResult>}
 */
export async function runCheck({ links = false } = {}) {
  const entries = await loadReviewedCorpus();
  const [store, pool] = await Promise.all([loadImages(), loadPool()]);
  const live = entries.filter(isPublishable);

  const problems = [
    ...validateCorpus(entries),
    ...imageProblems(live, store, pool),
    ...(links ? await linkProblems(live, store, pool) : []),
  ];
  const errors = problems.filter((p) => p.level === 'error');
  const warnings = problems.filter((p) => p.level === 'warning');

  return {
    total: entries.length,
    publishable: live.length,
    problems,
    errors,
    warnings,
    byFact: groupByFact(problems),
    ok: errors.length === 0,
  };
}
