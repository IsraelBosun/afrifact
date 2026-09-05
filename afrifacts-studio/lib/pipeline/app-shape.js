/**
 * Turning a reviewed corpus entry into the thing the app renders.
 *
 * These two functions used to live in `export-to-app.js`, the stage that
 * wrote a generated TypeScript file into the app project. That stage is
 * gone: the app reads Supabase now, and the file it wrote is deleted.
 * The shaping survived it, because the database stores facts in exactly
 * the shape the app renders them.
 */

import { categoryPanel } from '../theme.js';
import { creditFor, findCandidate } from '../studio/images.js';

/**
 * The app never sees provenance.
 *
 * Only the `fact` half of a SourcedFact crosses. Passages, surprise
 * scores, reviewer names and source tiers stay behind — in the studio's
 * own tables, which the app's key has no grant on. The app renders
 * facts, it does not audit them.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {import('../types/fact.js').FactImage | null} image
 */
export function toAppFact(entry, image) {
  return { ...entry.fact, image };
}

/**
 * Turn an accepted image decision into the app's FactImage, or null.
 *
 * Only 'accepted' crosses. A 'proposed' match is the model's suggestion
 * sitting in a queue, and shipping one would be the image equivalent of
 * publishing an unreviewed fact.
 *
 * Every field is checked before it is written, because a card with a
 * missing credit is a licence breach rather than a cosmetic bug
 * (CLAUDE.md §10). If anything is absent, the fact ships without an
 * image — which it renders perfectly well.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {import('../studio/images.js').ImageStore} images
 * @param {import('../studio/images.js').ImagePool} pool
 * @returns {import('../types/fact.js').FactImage | null}
 */
export function imageFor(entry, images, pool) {
  const decision = images[entry.fact.id];
  if (!decision || decision.status !== 'accepted' || decision.file.length === 0) return null;

  const candidate = findCandidate(pool, decision.file);
  if (!candidate) return null;

  const credit = creditFor(candidate);
  if (candidate.url.length === 0 || candidate.license.length === 0 || credit.length === 0) {
    return null;
  }

  return {
    url: candidate.url,
    credit,
    license: candidate.license,
    panelColor: categoryPanel(entry.fact.category),
  };
}
