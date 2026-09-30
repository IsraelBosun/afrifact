/**
 * Fitting a fact on the card.
 *
 * The card grows its text panel to fit the fact and shrinks the photo to
 * make room. Past about 200 characters there is no room left and the
 * buttons are pushed off the card: measured on a 350-character Hushpuppi
 * fact. The founder's own exemplars run to a median of 136 and a maximum
 * of 221, so the limit costs nothing the collection was aiming for.
 *
 * The limit is enforced in `validate()`, which blocks publishing. This
 * file is the repair: one model call to cut a long fact down, and then
 * the SAME verifier every fact passes. A shorter fact is still a claim,
 * and a claim still has to come from its passage. A rewrite the verifier
 * rejects is thrown away, never shipped.
 */

import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { MAX_FACT_CHARS } from '../validate.js';
import { factGroundedInPassage } from './verify.js';

/** What the rewrite aims for, leaving headroom under the hard limit. */
export const TARGET_FACT_CHARS = 180;

/**
 * A shorter version of `fact`, grounded in `passage`, or null.
 *
 * @param {string} fact
 * @param {string} passage
 * @param {{ signal?: AbortSignal, onProgress?: (line: string) => void }} [options]
 * @returns {Promise<string | null>}
 */
export async function shorten(fact, passage, options = {}) {
  const prompt = await loadPrompt('shorten', {
    limit: String(TARGET_FACT_CHARS),
    fact,
    passage,
  });
  const raw = await completeJson(
    { model: MODELS.extract, prompt, temperature: 0, signal: options.signal },
    options.onProgress,
  );
  const short = typeof raw?.fact === 'string' ? raw.fact.trim() : '';
  if (short.length === 0 || short.length > MAX_FACT_CHARS) return null;
  return factGroundedInPassage(short, passage).ok ? short : null;
}
