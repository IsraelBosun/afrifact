/**
 * What state is the pipeline actually in?
 *
 * Read from disk every time, never from the job runner's memory. A stage
 * that finished before the dev server reloaded still happened, and the
 * page has to say so. This is also what makes the pipeline resumable:
 * every stage writes a file, so "where was I" is answerable by looking.
 *
 * The other job here is making the human gates visible. That triage sits
 * between extract and enrich, and review sits between images and export,
 * used to be knowledge in one person's head. Here it is a `blocked` flag
 * with a reason attached.
 *
 * Every `count` is how much work a Run would actually do. That number is
 * the honest version of the button. Extract used to take every cached
 * document whether or not it had been through the model already, and the
 * only way to find that out was the bill.
 *
 * It used to be reported twice, as `count` and as an identical `pending`,
 * beside a `pendingUnit` and a `ready` that nothing ever read. One number
 * per stage, read in one place.
 *
 * Two cards are gone from `stages` and are now the `app` summary instead.
 * Export never was a stage you decide about — it rewrites the whole file
 * every time, so its count could only ever be "is the app behind you",
 * which is a sentence. Review is a page in the nav; a card whose only
 * action is a link to something already in the nav is a second front door
 * taking up the width of a stage.
 */

import { readFile, stat } from 'node:fs/promises';

import { loadCorpus } from '../corpus/index.js';
import {
  APP_DATA_PATH,
  CANDIDATES_PATH,
  CULLED_PATH,
  ENRICHED_PATH,
  FACTS_PATH,
  IMAGES_PATH,
  REJECTS_PATH,
  REVIEWS_PATH,
  SOURCES_PATH,
} from './paths.js';
import { hasApiKey } from './llm/index.js';
import { loadImages, loadPool, splitImageWork } from './studio/images.js';
import { loadReviews } from './studio/reviews.js';
import { loadSources } from './pipeline/sources.js';
import { cachedSlugs, planExtract } from './pipeline/extract.js';
import { keyOf } from './pipeline/candidate-key.js';
import { promotedKeys } from './studio/facts.js';
import { isPublishable, validate } from './validate.js';
import { effectiveReview } from './studio/reviews.js';

/** @param {string} path */
async function countIn(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return null;
  }
}

/** @param {string} path */
async function modifiedAt(path) {
  try {
    return (await stat(path)).mtime.toISOString();
  } catch {
    return null;
  }
}

/**
 * How many kept candidates are not yet facts.
 *
 * Not the same as "how many did I keep". Enrichment mints a new fact id
 * every time it runs, so a kept candidate that has already been enriched
 * would be enriched again into a SECOND fact saying the same thing. The
 * lineage recorded at promotion is what tells them apart, and this is the
 * number the Run button should be showing.
 *
 * @returns {Promise<number>}
 */
async function pendingEnrichment() {
  let candidates;
  try {
    candidates = JSON.parse(await readFile(CANDIDATES_PATH, 'utf8'));
  } catch {
    // No candidates file yet is a real state on a fresh checkout.
    return 0;
  }
  if (!Array.isArray(candidates)) return 0;

  // Deliberately outside the catch. A blanket try around the whole body
  // once turned a reference to a deleted function into a calm '0 to
  // enrich' over nine waiting candidates, which is the worst way for a
  // board whose only job is to be honest to fail.
  const done = await promotedKeys();
  return candidates.filter((c) => !done.has(keyOf(c))).length;
}

/** @param {string} path */
async function modifiedMs(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Has a decision been made since the app file was last written?
 *
 * Export has no natural pending count — it rewrites the whole app file
 * every time — so the honest question is not "how many facts" but "is
 * what the app is holding older than what you decided". Every save on
 * `/review` publishes already, so the usual answer is no.
 *
 * @returns {Promise<boolean>}
 */
async function exportIsStale() {
  const [app, ...decisions] = await Promise.all([
    modifiedMs(APP_DATA_PATH),
    modifiedMs(REVIEWS_PATH),
    modifiedMs(IMAGES_PATH),
    modifiedMs(FACTS_PATH),
    modifiedMs(ENRICHED_PATH),
  ]);
  if (app === 0) return true;
  return decisions.some((at) => at > app);
}

/**
 * A snapshot of every stage.
 *
 * Every `count` is work left, never work done. The board used to lead with
 * totals — 35 articles, 143 candidates, 131 approved — which made a
 * finished pipeline look like a full inbox and buried the one stage that
 * actually wanted something. Finished counts survive as `done`, in small
 * type, because "nothing to do" is only reassuring if it says what it
 * already has.
 *
 * @returns {Promise<object>}
 */
export async function pipelineStatus() {
  const [
    sources,
    cachedList,
    candidates,
    rejects,
    culled,
    enriched,
    corpus,
    reviews,
    images,
    keyed,
    extractPlan,
    enrichPending,
    exportStale,
  ] = await Promise.all([
    loadSources(),
    cachedSlugs(),
    countIn(CANDIDATES_PATH),
    countIn(REJECTS_PATH),
    countIn(CULLED_PATH),
    countIn(ENRICHED_PATH),
    loadCorpus(),
    loadReviews(),
    loadImages(),
    hasApiKey(),
    planExtract(),
    pendingEnrichment(),
    exportIsStale(),
  ]);

  const cached = cachedList.length;
  const inCache = new Set(cachedList);
  const uncached = sources.filter((entry) => !inCache.has(entry.slug)).length;

  /*
    Sources with a next action, matching what `/sources` shows.

    A source that has been fetched and extracted is finished: every later
    run skips it. Same test both places, so the card and the page cannot
    disagree about the size of the job.
  */
  const extractedSlugs = new Set(extractPlan.done.map((d) => d.slug));
  const activeSources = sources.filter(
    (entry) => !extractedSlugs.has(entry.slug) || entry.landedOn || entry.duplicateOf?.length > 0,
  ).length;

  const merged = corpus.map((entry) => ({
    ...entry,
    provenance: {
      ...entry.provenance,
      review: effectiveReview(entry.fact.id, entry.provenance.review, reviews),
    },
  }));

  const approved = merged.filter(isPublishable).length;
  const queued = merged.filter((e) => e.record?.queued === true).length;
  /*
    Facts that cannot ship, whatever anyone clicks.

    Nothing waits for approval any more, so "undecided" has no meaning
    on this board. What is still worth surfacing is a fact validate()
    refuses — it is finished work that readers will never see, and it is
    invisible unless something counts it.
  */
  const blockedFacts = merged.filter(
    (e) => e.record?.queued !== true && validate(e).some((p) => p.level === 'error'),
  ).length;

  const imageValues = Object.values(images);
  const acceptedImages = imageValues.filter((d) => d.status === 'accepted').length;

  const pool = await loadPool();
  const poolTotal = Object.values(pool).reduce((sum, list) => sum + (list?.length ?? 0), 0);
  // Same classifier the image queue filters on, so the card and the page
  // cannot disagree about the size of the job.
  const imageWork = splitImageWork(merged, images, pool);

  return {
    hasApiKey: keyed,
    /*
      What the app is holding, which is the question the board is really
      asked. It was two stage cards — Review and Export — and neither was
      a decision: one linked to a page in the nav, the other rewrote the
      whole file whatever its count said.
    */
    app: {
      live: approved,
      blocked: blockedFacts,
      queued,
      stale: exportStale,
      at: await modifiedAt(APP_DATA_PATH),
    },
    stages: [
      {
        key: 'sources',
        name: 'Sources',
        kind: 'human',
        href: '/sources',
        count: activeSources,
        unit: activeSources === 1 ? 'article to run' : 'articles to run',
        done: `${sources.length} on the list`,
        detail:
          activeSources === 0
            ? 'Every article is fetched and extracted. Add another to start new work.'
            : 'Hand-picked. Never automate the choosing.',
        blocked: false,
        at: await modifiedAt(SOURCES_PATH),
      },
      {
        key: 'fetch',
        name: 'Fetch',
        kind: 'auto',
        /*
          Which sources have no cache file — not `sources - cached`.

          Those two numbers legitimately disagree: the cache holds ten
          documents from an earlier seed list, so subtracting gave a
          negative, which clamped to zero, which disabled the button. The
          front of the pipeline was unreachable from the browser and the
          count was the reason. Ask the question fetch itself asks.
        */
        count: uncached,
        unit: 'to fetch',
        done: `${cached} cached`,
        detail:
          uncached === 0
            ? `All ${sources.length} sources cached. Refetch picks up article edits.`
            : `${uncached} source(s) not yet pulled. Free — the sites themselves, not the model.`,
        blocked: sources.length === 0,
        blockedWhy: 'Add at least one source article first.',
      },
      {
        key: 'extract',
        name: 'Extract',
        kind: 'auto',
        costs: true,
        count: extractPlan.pending.length,
        unit: 'new documents',
        done: `${extractPlan.done.length} read · ${candidates ?? 0} candidates found`,
        detail:
          extractPlan.pending.length === 0
            ? `All ${extractPlan.done.length} cached documents already extracted.`
            : `${extractPlan.pending.length} new, ${extractPlan.done.length} already done.`,
        blocked: cached === 0,
        blockedWhy: 'Nothing cached. Run fetch first.',
      },
      {
        key: 'enrich',
        name: 'Enrich',
        kind: 'auto',
        costs: true,
        count: enrichPending,
        unit: 'to enrich',
        done: `${enriched ?? 0} facts written`,
        detail:
          enrichPending === 0
            ? 'Every verified candidate is already a fact.'
            : `${enrichPending} candidate(s) waiting. Deep dive, why-it-matters and quiz. Arrives live.`,
        blocked: (candidates ?? 0) === 0,
        blockedWhy: 'No candidates. Run extract first.',
      },
      {
        key: 'images',
        name: 'Images',
        kind: 'auto',
        costs: true,
        /*
          Facts without a picture — all of them, now that a run can
          actually move all of them.

          This used to exclude the ones whose article Commons had nothing
          free for, because the harvester skipped those and no future run
          would have touched them. The second pass searches the web per
          fact, so they are ordinary work again rather than a standing
          21 the board had to explain away.
        */
        count: imageWork.actionable,
        unit: 'facts without a picture',
        done:
          `${acceptedImages} with a picture · ${poolTotal} licence-clean in pool` +
          (imageWork.stalled > 0 ? ` · ${imageWork.stalled} need a web search` : ''),
        detail:
          imageWork.actionable === 0
            ? 'Every fact has a picture. Change or remove any of them on /review.'
            : `${imageWork.actionable} still blank. The run fills them all — its own article first, then the web.`,
        blocked: corpus.length === 0,
        blockedWhy: 'No facts yet.',
      },
    ],
  };
}
