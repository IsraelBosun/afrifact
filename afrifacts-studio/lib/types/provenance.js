/**
 * Everything that proves a fact is true.
 *
 * The app never reads any of this. It exists so that when a fact is
 * challenged — in a screenshot, in a reply, by a historian — the passage
 * and the page number can be produced in under a minute. That is the
 * difference between issuing a correction and losing the credibility the
 * whole app rests on.
 *
 * The rule this file describes: a fact is EXTRACTED from a source, never
 * generated from a model's memory. `passage` is what makes that checkable
 * rather than merely asserted, which is why it is required and why it is
 * the one field that can never be reconstructed later.
 */

/**
 * How much weight a source carries on its own.
 *
 * The tier is about the kind of evidence, not about quality within a kind:
 * a careful newspaper report is still press, and press reports what was
 * *claimed* as much as what happened.
 *
 * - `peer-reviewed` — journals, university press monographs, academic surveys.
 * - `institutional` — census, central bank, statistics bureau, museum, UN agency.
 * - `press` — contemporary reporting, including newspaper archives.
 * - `reference` — reference works and encyclopedias. Aggregation, so weakest alone.
 *
 * @typedef {'peer-reviewed' | 'institutional' | 'press' | 'reference'} SourceTier
 */

/** Every tier, for validating a value that came from JSON or a model. */
export const SOURCE_TIERS = ['peer-reviewed', 'institutional', 'press', 'reference'];

/**
 * Tiers that cannot carry a consequential fact by themselves.
 *
 * Press archives are excellent evidence that something was *reported* and
 * weaker evidence that it *happened* — the paper is usually relaying a
 * figure from elsewhere. Reference works are aggregation, which is where
 * generic facts come from in the first place.
 */
export const TIERS_NEEDING_CORROBORATION = ['press', 'reference'];

/**
 * A pointer precise enough that someone else can find the same words.
 *
 * URLs rot, so a URL alone is not enough for anything that matters. At
 * least one stable field should be set: doi, isbn, or archiveRef.
 *
 * @typedef {object} Locator
 * @property {string} [doi] Preferred. Survives site moves and redesigns.
 * @property {string} [isbn] For books. Pair with `page`.
 * @property {string} [archiveRef] Archive-assigned identifier, e.g. an
 *   archive.ng scan or issue id. Whatever the archive uses to address it.
 * @property {string} [url] May rot. Keep it, but never as the only locator.
 * @property {string} [publishedAt] ISO 8601. For newspapers, the issue date.
 * @property {string} [page] Page number or range, e.g. '114' or '112-115'.
 * @property {string} [section] Chapter, section, or table number.
 */

/**
 * A single source backing a claim.
 *
 * @typedef {object} SourceRecord
 * @property {string} citation Full citation as it would appear in a bibliography.
 * @property {string} shortName Display name on the card, e.g. 'Guinness'.
 * @property {SourceTier} tier
 * @property {Locator} locator
 * @property {string} passage The literal sentences the fact came from,
 *   quoted verbatim. The highest-value field in the schema. Never
 *   paraphrase it, never let a model rewrite it, and never fill it in
 *   from memory — if the passage cannot be quoted, the fact does not ship.
 * @property {string} [note] A caveat, a disagreement with another source, context.
 */

/**
 * Where the fact came from before review.
 *
 * - `manual` — a person read the source and wrote the fact.
 * - `pipeline` — extracted from a passage by the pipeline, then reviewed.
 *
 * @typedef {'manual' | 'pipeline'} FactOrigin
 */

/*
  There is no 'rejected'.

  It said the same thing as a fact being blocked — not publishable — but
  through a second, parallel mechanism: one a person set by hand, one the
  validator worked out. Two ways to express one state is how they drift,
  and the validator's is the one that cannot be wrong.

  So a fact that should not ship is either blocked by its own errors, or
  it is held back if it already shipped. Both are computed or recorded
  where the reason lives.
*/
/** @typedef {'draft' | 'approved' | 'needs-work'} ReviewStatus */

export const REVIEW_STATUSES = ['draft', 'approved', 'needs-work'];

/**
 * @typedef {object} Review
 * @property {ReviewStatus} status
 * @property {string} reviewer Who approved it. A name, so an approval is attributable.
 * @property {string} reviewedAt ISO 8601 date of the decision.
 * @property {string} [notes] What needs work. Required unless approved.
 */

/**
 * The three-axis surprise score, each 1-5.
 *
 * "Is this surprising?" is too vague to apply consistently, by a person or
 * a model, and consistency is what matters when one reviewer scores several
 * hundred facts over months. Scoring three things separately makes drift
 * visible: the bar tends to fall as the reviewer gets steeped in the
 * material and everything starts to feel obvious.
 *
 * A fact needs all three. Most candidates die on `priorProbability`.
 *
 * @typedef {object} SurpriseScore
 * @property {number} priorProbability Would an educated Nigerian already
 *   know this? 1 = everyone knows it, 5 = almost nobody does. The harshest
 *   filter and the most important.
 * @property {number} specificity Is there a number, a name, a date, a
 *   place? 1 = vague generality, 5 = concrete and checkable.
 * @property {number} explicability Can you say *why* in two sentences?
 *   1 = bare trivia, 5 = opens onto something larger.
 */

/** The bar a fact must clear on every axis to be publishable. */
export const SURPRISE_THRESHOLD = 3;

/** The three axis names, in the order they are reported. */
export const SURPRISE_AXES = ['priorProbability', 'specificity', 'explicability'];

/**
 * Facts decay.
 *
 * "Lagos generates more GDP than most African countries" is true until it
 * is not. Economic and demographic claims need revisiting; a fact about
 * the 15th century does not. Cheap to record now, painful to retrofit
 * across several hundred rows later.
 *
 * @typedef {object} Decay
 * @property {'permanent' | 'volatile'} kind 'permanent' for settled
 *   history; 'volatile' for anything resting on current economic,
 *   demographic or record-holding data.
 * @property {string} [reviewBy] ISO 8601. When a volatile fact should be
 *   checked again.
 */

/**
 * The full audit record for one fact.
 *
 * @typedef {object} Provenance
 * @property {string} factId Matches the `id` on the published Fact.
 * @property {FactOrigin} origin
 * @property {SourceRecord[]} sources At least one. A fact resting only on
 *   a tier in TIERS_NEEDING_CORROBORATION wants a second, independent source.
 * @property {SurpriseScore} surprise
 * @property {Review} review
 * @property {Decay} decay
 * @property {string} createdAt ISO 8601. When the record was first created.
 */

/**
 * A fact together with the evidence for it. The studio's working unit.
 *
 * @typedef {object} SourcedFact
 * @property {import('./fact.js').Fact} fact
 * @property {Provenance} provenance
 */

export {};
