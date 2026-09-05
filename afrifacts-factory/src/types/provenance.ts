/**
 * Everything that proves a fact is true.
 *
 * The app never reads any of this. It exists so that when a fact is
 * challenged — in a screenshot, in a reply, by a historian — the passage
 * and the page number can be produced in under a minute. That is the
 * difference between issuing a correction and losing the credibility the
 * whole app rests on.
 *
 * The rule this file enforces: a fact is EXTRACTED from a source, never
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
 */
export type SourceTier =
  /** Peer-reviewed journals, university press monographs, academic surveys. */
  | 'peer-reviewed'
  /** Census, central bank, statistics bureau, museum, UN agency. Primary data. */
  | 'institutional'
  /** Contemporary reporting, including newspaper archives. */
  | 'press'
  /** Reference works and encyclopedias. Aggregation, so weakest on its own. */
  | 'reference';

/**
 * Tiers that cannot carry a consequential fact by themselves.
 *
 * Press archives are excellent evidence that something was *reported* and
 * weaker evidence that it *happened* — the paper is usually relaying a
 * figure from elsewhere. Reference works are aggregation, which is where
 * generic facts come from in the first place.
 */
export const TIERS_NEEDING_CORROBORATION: readonly SourceTier[] = ['press', 'reference'] as const;

/**
 * A pointer precise enough that someone else can find the same words.
 *
 * URLs rot, so a URL alone is not enough for anything that matters. At
 * least one stable field should be set: doi, isbn, or archiveRef.
 */
export interface Locator {
  /** Preferred. Survives site moves and redesigns. */
  doi?: string;
  /** For books. Pair with `page`. */
  isbn?: string;
  /**
   * Archive-assigned identifier, e.g. an archive.ng scan or issue id.
   * Whatever the archive itself uses to address the document.
   */
  archiveRef?: string;
  /** May rot. Keep it, but never as the only locator. */
  url?: string;
  /** Publication or issue date, ISO 8601. For newspapers this is the issue. */
  publishedAt?: string;
  /** Page number or range, e.g. '114' or '112-115'. */
  page?: string;
  /** Where in a multi-part work: chapter, section, table number. */
  section?: string;
}

/** A single source backing a claim. */
export interface SourceRecord {
  /** Full citation as it would appear in a bibliography. */
  citation: string;
  /** Display name shown on the card, e.g. 'Guinness', 'World Bank'. */
  shortName: string;
  tier: SourceTier;
  locator: Locator;
  /**
   * The literal sentences the fact came from, quoted verbatim.
   *
   * The highest-value field in the schema. Never paraphrase it, never let
   * a model rewrite it, and never fill it in from memory — if the passage
   * cannot be quoted, the fact does not ship.
   */
  passage: string;
  /** Optional note: a caveat, a disagreement with another source, context. */
  note?: string;
}

/** Where the fact came from before review. */
export type FactOrigin =
  /** A person read the source and wrote the fact. */
  | 'manual'
  /** Extracted from a passage by the pipeline, then reviewed. */
  | 'pipeline';

export type ReviewStatus = 'draft' | 'approved' | 'rejected' | 'needs-work';

export interface Review {
  status: ReviewStatus;
  /** Who approved it. A name, so an approval is attributable. */
  reviewer: string;
  /** ISO 8601 date of the decision. */
  reviewedAt: string;
  /** Why it was rejected or what needs work. Required unless approved. */
  notes?: string;
}

/**
 * The three-axis surprise score.
 *
 * "Is this surprising?" is too vague to apply consistently, by a person or
 * a model, and consistency is what matters when one reviewer scores several
 * hundred facts over months. Scoring three things separately makes drift
 * visible: the bar tends to fall as the reviewer gets steeped in the
 * material and everything starts to feel obvious.
 *
 * A fact needs all three. Most candidates die on `priorProbability`.
 */
export interface SurpriseScore {
  /**
   * Would an educated Nigerian already know this? 1 = everyone knows it,
   * 5 = almost nobody does. The harshest filter and the most important.
   */
  priorProbability: 1 | 2 | 3 | 4 | 5;
  /**
   * Is there a number, a name, a date, a place? 1 = vague generality,
   * 5 = concrete and checkable.
   */
  specificity: 1 | 2 | 3 | 4 | 5;
  /**
   * Can you say *why* in two sentences? 1 = bare trivia, 5 = opens onto
   * something larger. This is what separates a fact from a deep dive.
   */
  explicability: 1 | 2 | 3 | 4 | 5;
}

/** The bar a fact must clear on every axis to be publishable. */
export const SURPRISE_THRESHOLD = 3 as const;

/**
 * Facts decay.
 *
 * "Lagos generates more GDP than most African countries" is true until it
 * is not. Economic and demographic claims need revisiting; a fact about
 * the 15th century does not. Cheap to record now, painful to retrofit
 * across several hundred rows later.
 */
export interface Decay {
  /**
   * 'permanent' for settled history; 'volatile' for anything resting on
   * current economic, demographic or record-holding data.
   */
  kind: 'permanent' | 'volatile';
  /** ISO 8601. When a volatile fact should be checked again. */
  reviewBy?: string;
}

/** The full audit record for one fact. */
export interface Provenance {
  /** Matches the `id` on the published Fact. */
  factId: string;
  origin: FactOrigin;
  /**
   * At least one. A fact resting only on a tier in
   * TIERS_NEEDING_CORROBORATION wants a second, independent source.
   */
  sources: SourceRecord[];
  surprise: SurpriseScore;
  review: Review;
  decay: Decay;
  /** ISO 8601. When the record was first created. */
  createdAt: string;
}

/** A fact together with the evidence for it. The factory's working unit. */
export interface SourcedFact {
  fact: import('./fact').Fact;
  provenance: Provenance;
}
