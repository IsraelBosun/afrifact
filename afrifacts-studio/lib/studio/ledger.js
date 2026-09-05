/**
 * What work has already been paid for.
 *
 * The pipeline had no memory of its own runs. Fetch skipped a cached
 * article, but extract did not: clicking Run sent all 46 cached documents
 * to the model again, produced the same candidates, and overwrote the
 * triaged file with them. The money was spent before anything on screen
 * said what was about to happen.
 *
 * So a stage records what it processed and what it produced. The unit is
 * the thing that was worked on — a document slug for extract — and the
 * value carries the REVISION it was worked on at. That is the part that
 * makes this correct rather than merely cheap: a re-fetched article is a
 * different document even under the same slug, and re-extracting it is
 * work, not repetition.
 *
 * This lives in `data/` with the other precious files. It is not a cache:
 * deleting it does not cost a recompute, it costs a re-run of everything
 * the pipeline has ever done, at full price.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { LEDGER_PATH, ensureDirs } from '../paths.js';

/**
 * @typedef {object} ExtractEntry
 * @property {string} revisionId The revision the document was extracted at.
 * @property {string} at ISO 8601.
 * @property {string} model Which model was paid. A model change is a
 *   reason to re-run, and this is what makes that visible.
 * @property {number} candidates How many survived the verifier.
 * @property {number} rejected
 */

/**
 * @typedef {object} Ledger
 * @property {Record<string, ExtractEntry>} extract Keyed by document slug.
 */

/** @returns {Ledger} */
function empty() {
  return { extract: {} };
}

/**
 * Read the ledger.
 *
 * A corrupt file returns an empty ledger rather than throwing. The cost of
 * that is re-running work; the cost of throwing is a pipeline that will
 * not start at all. But it says so, because silently re-paying for 46
 * documents is exactly the failure this file exists to prevent.
 *
 * @returns {Promise<Ledger>}
 */
export async function loadLedger() {
  try {
    const parsed = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
    if (typeof parsed !== 'object' || parsed === null) return empty();
    return { extract: typeof parsed.extract === 'object' && parsed.extract ? parsed.extract : {} };
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn(`  ledger.json unreadable (${error.message}). Treating every stage as unrun.`);
    }
    return empty();
  }
}

/**
 * @param {Ledger} ledger
 * @returns {Promise<void>}
 */
export async function saveLedger(ledger) {
  await ensureDirs();
  await writeFile(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
}

/**
 * Has this exact document, at this exact revision, been extracted already?
 *
 * @param {Ledger} ledger
 * @param {string} slug
 * @param {string} revisionId
 * @param {string} model
 * @returns {{ done: boolean, why: string }}
 */
export function extractDone(ledger, slug, revisionId, model) {
  const entry = ledger.extract[slug];
  if (!entry) return { done: false, why: 'never extracted' };
  if (entry.revisionId !== revisionId) {
    return { done: false, why: `re-fetched since (rev ${entry.revisionId} -> ${revisionId})` };
  }
  if (entry.model !== model) {
    return { done: false, why: `extracted with ${entry.model}, now on ${model}` };
  }
  return {
    done: true,
    why: `${entry.candidates} candidates on ${entry.at.slice(0, 10)}`,
  };
}

/**
 * Record an extraction. Overwrites any earlier entry for the slug — the
 * ledger holds the current state of a document, not its history.
 *
 * @param {string} slug
 * @param {Omit<ExtractEntry, 'at'>} entry
 * @returns {Promise<void>}
 */
export async function recordExtract(slug, entry) {
  const ledger = await loadLedger();
  ledger.extract[slug] = { ...entry, at: new Date().toISOString() };
  await saveLedger(ledger);
}
