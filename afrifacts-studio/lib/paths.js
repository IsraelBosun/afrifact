/**
 * Every path the studio reads or writes, in one place.
 *
 * The old factory scattered `join(here, '..', '..', 'reviews.json')`
 * through a dozen files, which was survivable when everything sat in one
 * flat folder. It does not survive the split below, and the split is the
 * point:
 *
 *   data/         decisions. Yours. Never regenerated, never overwritten
 *                 by a pipeline stage. Losing this loses months of review.
 *   _generated/   pipeline output. Every file here is rebuilt by rerunning
 *                 a stage, so any of it can be deleted without thought.
 *   _cache/       fetched source text, keyed by revision id. Not an
 *                 optimisation — the verifier needs the exact bytes the
 *                 model saw, so this is evidence, not a cache in the
 *                 disposable sense. Deleting it costs a refetch.
 *
 * Both underscore directories are excluded from the Next dev server's
 * watcher (see next.config.mjs). A pipeline stage rewriting a file mid-run
 * would otherwise trigger a recompile in the middle of its own job.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const here = dirname(fileURLToPath(import.meta.url));

/** The studio project root. */
export const ROOT = join(here, '..');

export const DATA_DIR = join(ROOT, 'data');
export const GENERATED_DIR = join(ROOT, '_generated');
export const CACHE_DIR = join(ROOT, '_cache');
export const CORPUS_DIR = join(ROOT, 'corpus');
export const PROMPTS_DIR = join(here, 'llm', 'prompts');

/** The LLM key. Read from here, never copied into afrifacts/. */
export const ENV_PATH = join(ROOT, '.env');

/* Decisions — precious. */

/** Fact review decisions. A Supabase `reviews` table replaces this. */
export const REVIEWS_PATH = join(DATA_DIR, 'reviews.json');
/** Image decisions, keyed by fact id. A `fact_images` table replaces this. */
export const IMAGES_PATH = join(DATA_DIR, 'images.json');

/*
  `keeps.json` and `triage.json` were the triage page's verdicts. That
  page is gone — candidates go straight through to facts and the judging
  happens once, on /review, on the finished fact. Nothing has imported
  either path since. The files are still in `data/` and are not deleted
  here: they hold a person's judgement on several hundred candidates and
  nothing can recompute it, so they go when you say so, not as a side
  effect of tidying up the code that stopped reading them.
*/

/** The hand-picked seed list. Moved out of code so the UI can write it. */
export const SOURCES_PATH = join(DATA_DIR, 'sources.json');
/**
 * The fact store: every pipeline fact once it has been promoted.
 *
 * The authority, not build output. `_generated/enriched.json` is the last
 * enrich run's raw result and is overwritten wholesale; this is what
 * survives, what can be edited, and what a Supabase `facts` table
 * replaces later. Same reason reviews.json sits here: losing it loses
 * work no rerun can reproduce.
 */
export const FACTS_PATH = join(DATA_DIR, 'facts.json');

/**
 * What the pipeline has already run, and at which revision.
 *
 * In `data/` because it is not reproducible: deleting it does not cost a
 * recompute, it costs re-running every paid stage from scratch. It is the
 * difference between a Run button that processes what is new and one that
 * re-pays for everything on disk.
 */
export const LEDGER_PATH = join(DATA_DIR, 'ledger.json');

/* Generated — disposable. */

/** Verified candidates awaiting triage. */
export const CANDIDATES_PATH = join(GENERATED_DIR, 'candidates.json');
/** What the verifier threw out, with reasons. Kept: the bar is not calibrated. */
export const REJECTS_PATH = join(GENERATED_DIR, 'rejects.json');
/** What dedupe removed. */
export const CULLED_PATH = join(GENERATED_DIR, 'culled.json');
/**
 * Enriched facts.
 *
 * JSON rather than the old `_enriched.ts`. That file was imported by the
 * corpus, so rewriting it mid-enrich would recompile a module the dev
 * server is watching. Read with fs at request time instead: out of the
 * module graph entirely, and new facts appear without a restart.
 */
export const ENRICHED_PATH = join(GENERATED_DIR, 'enriched.json');
/**
 * Quiz questions from THE LAST RUN, as a record of that run.
 *
 * Not what the app reads. See `QUIZ_PATH` for why.
 */
export const ENRICHED_QUIZ_PATH = join(GENERATED_DIR, 'enriched-quiz.json');
/** Per-article licence-filtered image candidates. */
export const POOL_PATH = join(GENERATED_DIR, 'image-pool.json');

/*
  Images found by searching, rather than harvested from an article.

  In `data/` and not `_generated/` because they are not reproducible. The
  harvested pool can be rebuilt from an article any time; a search result
  is what a query returned on a particular day, and it is the ONLY record
  of the licence and the credit for an image somebody accepted from it.
  Lose this file and a published photo card loses its attribution, which
  is a licence breach rather than a rerun.
*/
export const FOUND_PATH = join(DATA_DIR, 'found-images.json');

/*
  Quiz questions, keyed by the fact they belong to.

  In `data/` because they are paid model output and there is nothing to
  regenerate them from cheaply. They used to live only in
  `_generated/enriched-quiz.json`, which every enrich run overwrites
  wholesale, and export read from there — so the app shipped whatever the
  LAST run happened to produce and nothing else. Measured when it was
  found: 148 facts in the app, 6 quiz questions, from 2 facts. The
  questions for the other 146 were generated, paid for, and deleted by
  the next run.

  This is the same mistake as the old candidates.json overwrite, in a
  second place: a disposable folder holding output that cannot be
  reproduced. `enriched.json` got away with it because `promote()` copies
  facts into the store; the quiz had no equivalent, which is exactly the
  gap this file closes.
*/
export const QUIZ_PATH = join(DATA_DIR, 'quiz.json');

/**
 * Every web search that has been paid for, keyed by query.
 *
 * In `data/` for the same reason as the ledger: it is not reproducible
 * at zero cost. The free tier is 250 searches a month, so deleting this
 * file is not "regenerate it", it is "spend the month's quota again".
 * A repeated query is answered from here and costs nothing.
 */
export const SEARCH_CACHE_PATH = join(DATA_DIR, 'search-cache.json');

/**
 * Web searches for SOURCE DOCUMENTS, keyed by query.
 *
 * A separate file from the one above rather than a second shape in it.
 * They spend the same quota and cache for the same reason, but one holds
 * image candidates and the other holds article links, and `cachedQueries`
 * already maps over every key in its file — one union type in one map is
 * how a picture ends up offered as a source.
 */
export const SOURCE_SEARCH_CACHE_PATH = join(DATA_DIR, 'source-search-cache.json');

/** Where `npm run export` writes the app's phase-1 data file. */
export const APP_DATA_PATH = join(ROOT, '..', 'afrifacts', 'src', 'data', 'dummyFacts.ts');

/**
 * Make sure the writable directories exist.
 *
 * Called by anything that writes. Cheap, idempotent, and it means a fresh
 * clone with no `data/` does not fail on the first decision.
 */
export async function ensureDirs() {
  await Promise.all([
    mkdir(DATA_DIR, { recursive: true }),
    mkdir(GENERATED_DIR, { recursive: true }),
    mkdir(CACHE_DIR, { recursive: true }),
  ]);
}
