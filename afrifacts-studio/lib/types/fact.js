/**
 * The published fact shape.
 *
 * This mirrors `afrifacts/src/types/fact.ts` field for field. The two are
 * deliberately not shared: the app is a separate project and the database
 * is the only thing between them. If you change one, change the other in
 * the same commit.
 *
 * The app side is TypeScript and this side is not, so these typedefs are
 * the contract's only written form here — and JSDoc does not enforce
 * anything at runtime. `validate.js` is what actually holds the line;
 * these exist so the editor can autocomplete a field and catch a typo,
 * not so a malformed fact is impossible. When the two disagree, validate
 * is right.
 *
 * Everything the app renders lives here. Everything that proves a fact is
 * true lives in `provenance.js`, which the app never sees.
 */

/** @typedef {'History' | 'Business' | 'Culture' | 'Food' | 'Sports' | 'Records' | 'Health'} Category */

/** @type {readonly Category[]} */
export const CATEGORIES = ['History', 'Business', 'Culture', 'Food', 'Sports', 'Records', 'Health'];

/**
 * ISO 3166-1 alpha-2, or 'AFR' for pan-African. Never narrowed to 'NG'.
 * @typedef {string} CountryCode
 */

/**
 * @typedef {object} DeepDive
 * @property {string[]} body One string per paragraph.
 * @property {string} whyItMatters
 * @property {number} readTime Minutes.
 * @property {string} suggestedQuestion
 */

/**
 * @typedef {object} Source
 * @property {string} name
 * @property {string} url
 * @property {boolean} verified
 */

/**
 * @typedef {object} FactImage
 * @property {string} url
 * @property {string} credit 'Photo · Wikimedia Commons'
 * @property {string} license 'CC BY-SA 4.0'
 * @property {string} panelColor Dark panel tone for the photo card.
 */

/**
 * @typedef {object} Fact
 * @property {string} id 'nf_0087'
 * @property {CountryCode} country
 * @property {Category} category
 * @property {string} fact
 * @property {DeepDive} deepDive
 * @property {Source} source
 * @property {FactImage | null} image null when the fact has no image, so
 *   every card component has to decide which variant it renders.
 * @property {number} factNumber Shown on share cards.
 * @property {string[]} relatedIds
 */

/**
 * @typedef {object} QuizQuestion
 * @property {string} id 'q_0210'
 * @property {string} factId
 * @property {string} question
 * @property {string[]} options Always exactly four.
 * @property {0 | 1 | 2 | 3} correctIndex
 * @property {string} explanation
 */

/** True if `value` is one of the five categories. */
export function isCategory(value) {
  return typeof value === 'string' && CATEGORIES.includes(value);
}
