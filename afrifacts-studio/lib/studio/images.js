/**
 * Image decisions, stored outside the generated files.
 *
 * Same reasoning as `reviews.js`, and the same shape of problem: an image
 * belongs to a fact, but the enriched file is regenerated on every enrich
 * run, so anything written in there is lost on the next one. Decisions
 * are precious and pools are cheap, so they are separated:
 *
 *   _generated/image-pool.json  regenerable, per-article candidates
 *   data/images.json            decided, keyed by fact id, never regenerated
 *
 * `data/images.json` is what a Supabase `fact_images` table replaces later.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { FOUND_PATH, IMAGES_PATH, POOL_PATH, ensureDirs } from '../paths.js';

/**
 * One free-licence image from Wikimedia Commons.
 *
 * Everything needed to render a credit line lives here, because a credit
 * is a licence condition and not a nice-to-have: a card without it is a
 * licence breach, not a cosmetic bug (CLAUDE.md §10).
 *
 * @typedef {object} ImageCandidate
 * @property {string} file Commons file title, e.g. 'File:Igbo-Ukwu bronze vessel.jpg'.
 * @property {string} url Scaled to roughly the width the card and the
 *   share card both need.
 * @property {string} descriptionUrl The Commons file page. The attribution
 *   trail, kept for the record.
 * @property {number} width
 * @property {number} height
 * @property {string} license Human-readable, e.g. 'CC BY-SA 4.0'. Goes in
 *   `FactImage.license`.
 * @property {string} licenseId Machine-readable where Commons gives one,
 *   e.g. 'cc-by-sa-4.0'.
 * @property {string} artist Author, HTML stripped. Empty for many
 *   public-domain works.
 * @property {string} description Commons' own caption. What the model
 *   reads, and what the reviewer sees.
 * @property {string} [via] Where the picture was found — a Commons file
 *   says 'Wikimedia Commons', a web result says the site. Drives the
 *   credit line, so it must never be guessed.
 * @property {string} [thumbnail] A small copy for the review grid, where
 *   one exists. The card and the export always use `url`.
 */

/**
 * 'proposed' is the model's suggestion and is NOT publishable — it is a
 * queue entry waiting for a person. Only 'accepted' reaches the app.
 * 'rejected' is a decision too: it says this fact stays typographic, and
 * it stops the next run proposing the same image again.
 *
 * @typedef {'proposed' | 'accepted' | 'rejected'} ImageStatus
 */

export const IMAGE_STATUSES = ['proposed', 'accepted', 'rejected'];

/**
 * @typedef {object} ImageDecision
 * @property {ImageStatus} status
 * @property {string} file Commons file title of the chosen image.
 * @property {string} reasoning Why this image was matched to this fact.
 * @property {string} decidedBy Who decided. Empty while the decision is
 *   still the model's.
 * @property {string} decidedAt Date only. What the page shows.
 * @property {string} [at] Full timestamp. What the review list sorts by —
 *   a date alone cannot say which of two pictures changed this morning
 *   was the second.
 * @property {string[]} [refused] Files this fact has been refused. A
 *   rejection means "not that photograph", not "no photograph", so the
 *   fact is refilled on the next run and these are excluded from it.
 */

/**
 * factId -> the image decision for it.
 * @typedef {Record<string, ImageDecision>} ImageStore
 */

/** @param {unknown} value */
function isStatus(value) {
  return typeof value === 'string' && IMAGE_STATUSES.includes(value);
}

/**
 * A corrupt entry should cost one image, not the whole store.
 *
 * @param {string} raw
 * @returns {ImageStore}
 */
function parse(raw) {
  const parsed = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return {};

  /** @type {ImageStore} */
  const store = {};
  for (const [factId, value] of Object.entries(parsed)) {
    if (typeof value !== 'object' || value === null) continue;
    if (!isStatus(value.status)) continue;
    if (typeof value.file !== 'string') continue;

    /*
      Every field is copied out by name, so one this does not know about
      is one that does not survive a reload. That bit twice: `at` was
      being written by the review page and dropped on the way back in,
      which quietly made the newest-first sort blind to a picture change,
      and `refused` carries the whole meaning of a rejection into the
      next run. Adding a field to a decision means adding it here.
    */
    store[factId] = {
      status: value.status,
      file: value.file,
      reasoning: typeof value.reasoning === 'string' ? value.reasoning : '',
      decidedBy: typeof value.decidedBy === 'string' ? value.decidedBy : '',
      decidedAt: typeof value.decidedAt === 'string' ? value.decidedAt : '',
      at: typeof value.at === 'string' ? value.at : '',
      refused: Array.isArray(value.refused)
        ? value.refused.filter((f) => typeof f === 'string' && f.length > 0)
        : [],
    };
  }
  return store;
}

/** @returns {Promise<ImageStore>} */
export async function loadImages() {
  try {
    return parse(await readFile(IMAGES_PATH, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    console.warn(`  Could not read images.json, starting empty: ${String(error)}`);
    return {};
  }
}

/** @param {ImageStore} store */
export async function saveImages(store) {
  await ensureDirs();
  await writeFile(IMAGES_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

/**
 * @param {string} factId
 * @param {ImageDecision} decision
 * @returns {Promise<ImageStore>}
 */
export async function saveImageDecision(factId, decision) {
  const store = await loadImages();
  store[factId] = decision;
  await saveImages(store);
  return store;
}

/**
 * Wikipedia article title -> every image that survived the licence filter.
 * @typedef {Record<string, ImageCandidate[]>} ImagePool
 */

/**
 * The bucket searched-for images live in.
 *
 * A key in the pool like any article's, so every consumer — the export's
 * `findCandidate`, the server's refusal to accept a file outside the
 * pool, the swap UI — works on a found image without being told it is
 * one. It is not an article title, so the harvester never tries to fetch
 * it, and it never turns up as some unrelated row's swap strip.
 */
export const FOUND_KEY = 'Found by search';

/** @returns {Promise<ImageCandidate[]>} */
export async function loadFound() {
  try {
    const parsed = JSON.parse(await readFile(FOUND_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Keep what a search turned up, so an accepted one keeps its licence.
 *
 * Append-only and deduplicated by file. A decision stores only the file
 * name; everything a credit line is built from lives here, so dropping an
 * entry some fact already points at would ship a photograph with no
 * attribution — the one bug in this stage that is a licence breach rather
 * than a blank card.
 *
 * @param {ImageCandidate[]} candidates
 */
export async function rememberFound(candidates) {
  const existing = await loadFound();
  const byFile = new Map(existing.map((c) => [c.file, c]));
  for (const candidate of candidates) {
    if (!byFile.has(candidate.file)) byFile.set(candidate.file, candidate);
  }
  await ensureDirs();
  const all = [...byFile.values()];
  await writeFile(FOUND_PATH, `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  return all;
}

/**
 * The harvested pool, with the found images folded in.
 *
 * Two files because they decay differently: the harvested pool can be
 * rebuilt from an article at any time, a search result is what one query
 * returned on one day. Merged on read so nothing downstream has to know
 * there are two.
 *
 * @returns {Promise<ImagePool>}
 */
export async function loadPool() {
  /** @type {ImagePool} */
  let pool = {};
  try {
    const parsed = JSON.parse(await readFile(POOL_PATH, 'utf8'));
    if (typeof parsed === 'object' && parsed !== null) pool = parsed;
  } catch {
    pool = {};
  }

  const found = await loadFound();
  if (found.length > 0) pool = { ...pool, [FOUND_KEY]: found };
  return pool;
}

/** @param {ImagePool} pool */
export async function savePool(pool) {
  await ensureDirs();
  // The found bucket came from `data/`. A stage that rewrites the
  // generated pool must not fork a second copy of it into a file that is
  // deleted as disposable.
  const { [FOUND_KEY]: _found, ...harvested } = pool;
  await writeFile(POOL_PATH, `${JSON.stringify(harvested, null, 2)}\n`, 'utf8');
}

/**
 * Find a candidate by file title across every pool.
 *
 * @param {ImagePool} pool
 * @param {string} file
 * @returns {ImageCandidate | null}
 */
export function findCandidate(pool, file) {
  for (const candidates of Object.values(pool)) {
    const hit = candidates.find((c) => c.file === file);
    if (hit) return hit;
  }
  return null;
}

/**
 * The credit line shown on the card and burned into every share export.
 *
 * Attribution is a licence condition, so this is built from the record
 * rather than typed by hand. Public-domain works often have no named
 * author, which is why the artist is conditional and Commons is not.
 *
 * @param {ImageCandidate} candidate
 * @returns {string}
 */
export function creditFor(candidate) {
  const artist = (candidate.artist ?? '').trim();
  /*
    Where the picture actually came from.

    This used to say Wikimedia Commons unconditionally, which was true
    when Commons was the only source. Against a web search it would print
    a credit naming a repository that has never held the file — a false
    attribution, which is worse than a vague one, and it would be baked
    into every share card.

    `via` is set by whatever found the image, so the line follows the
    picture instead of the code's assumption about it.
  */
  const via = (candidate.via ?? '').trim() || 'Wikimedia Commons';
  if (artist.length > 0 && artist.toLowerCase() !== via.toLowerCase()) {
    return `Photo · ${artist} · ${via}`;
  }
  return `Photo · ${via}`;
}

/**
 * What is actually left to do about images, and what never will be.
 *
 * An undecided fact is not automatically work. Three states hide behind
 * "no decision yet", and only two of them are askable:
 *
 *   pickable   its article has licence-clean images on disk. One click.
 *   needsRun   its article has never been harvested. A run would try it.
 *   stalled    its article was harvested and Commons had nothing free.
 *
 * `stalled` no longer means stuck. It means Commons has nothing free for
 * that article, and the run's second pass searches the web per fact for
 * exactly those — so they are still work a run can move, which is why
 * `actionable` counts all three. What it stops counting is a fact that
 * already has a picture.
 *
 * An absent pool key and an empty one mean different things on purpose —
 * `harvest-images` deliberately does not cache [] for an article whose
 * fetch failed, so absent means "not tried", never "nothing there".
 *
 * The test is HAS A PICTURE, not HAS A DECISION. A rejection is a
 * decision that leaves the fact blank, and counting it as settled is
 * what let 43 facts sit imageless through every run.
 *
 * @param {import('../../lib/types/provenance.js').SourcedFact[]} corpus
 * @param {import('./images.js').ImageStore} images
 * @param {ImagePool} pool
 */
export function splitImageWork(corpus, images, pool) {
  let pickable = 0;
  let needsRun = 0;
  let stalled = 0;

  for (const entry of corpus) {
    const decision = images[entry.fact.id];
    if (decision && decision.status === 'accepted' && decision.file.length > 0) continue;
    const article = entry.provenance.sources[0]?.shortName ?? '';
    if (!(article in pool)) needsRun += 1;
    else if (pool[article].length > 0) pickable += 1;
    else stalled += 1;
  }

  return { pickable, needsRun, stalled, actionable: pickable + needsRun + stalled };
}

export { FOUND_PATH, IMAGES_PATH, POOL_PATH };
