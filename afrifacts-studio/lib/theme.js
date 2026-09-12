/**
 * The one piece of the app's design system the studio needs to know.
 *
 * `FactImage.panelColor` is part of the published contract, so whatever
 * writes a FactImage has to produce one. This mirrors the dark stop of
 * each category family in `afrifacts/src/theme/colors.ts` — like the fact
 * types, it is duplicated rather than shared, because the app is a
 * separate project with no code in common (CLAUDE.md §2). Change one,
 * change the other.
 *
 * Why the category colour and not a tone sampled from the photograph:
 *
 *   CLAUDE.md §4.1 says the panel colour comes from the image's dominant
 *   tones; §6 says one colour family per screen. Those pull against each
 *   other, and the category wins here for two reasons. A muddy brown
 *   sampled from a photo breaks the colour identity the whole design
 *   rests on. And sampling means decoding JPEGs in Node, which means a
 *   dependency in the project that holds the LLM keys — a cost this
 *   project has deliberately refused everywhere else.
 *
 *   If the cards later look detached from their photos, sampling can be
 *   added here and nothing else changes.
 */

/**
 * Dark stop per family. Text on these is white, so they must stay dark.
 * @type {Record<import('./types/fact.js').Category, string>}
 */
const PANEL = {
  Culture: '#04342C',
  History: '#4A1B0C',
  Business: '#26215C',
  Food: '#4B1528',
  Sports: '#042C53',
  Records: '#28350B',
  Health: '#04313A',
};

/**
 * @param {import('./types/fact.js').Category} category
 * @returns {string}
 */
export function categoryPanel(category) {
  return PANEL[category] ?? PANEL.Culture;
}
