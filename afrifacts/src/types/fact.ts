/**
 * The contract.
 *
 * These types are the single definition that the app, the dummy data, and
 * phase 2's database rows all answer to. Widening one of them is a deliberate
 * decision, not a convenience.
 */

export type Category =
  | 'History'
  | 'Business'
  | 'Culture'
  | 'Food'
  | 'Sports'
  | 'Records'
  | 'Health';

export const CATEGORIES: readonly Category[] = [
  'History',
  'Business',
  'Culture',
  'Food',
  'Sports',
  'Records',
  'Health',
] as const;

/**
 * ISO 3166-1 alpha-2, or 'AFR' for pan-African.
 * Deliberately a plain string: no type ever encodes the launch market.
 */
export type CountryCode = string;

export interface DeepDive {
  /** One string per paragraph. */
  body: string[];
  /** The signature block of every deep dive: what this fact connects to. */
  whyItMatters: string;
  /** Minutes. */
  readTime: number;
  /** Seeds the placeholder in the "Ask about this" box. */
  suggestedQuestion: string;
}

export interface Source {
  name: string;
  url: string;
  verified: boolean;
}

export interface FactImage {
  url: string;
  /** e.g. 'Photo \u00b7 Wikimedia Commons'. Never dropped from a card or an export. */
  credit: string;
  /** e.g. 'CC BY-SA 4.0'. */
  license: string;
  /** Dark panel tone drawn from the image's dominant colours. */
  panelColor: string;
}

export interface Fact {
  id: string;
  country: CountryCode;
  category: Category;
  fact: string;
  deepDive: DeepDive;
  source: Source;
  /**
   * Null when the fact has no image. Nullable rather than optional on purpose,
   * so every card component has to decide which variant it renders.
   */
  image: FactImage | null;
  /** Shown on share cards. */
  factNumber: number;
  relatedIds: string[];
}

export interface QuizQuestion {
  id: string;
  factId: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

/** A fact carries an image, so it renders as a photo card. */
export function hasImage(fact: Fact): fact is Fact & { image: FactImage } {
  return fact.image !== null;
}
