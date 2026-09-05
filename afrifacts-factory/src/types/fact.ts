/**
 * The published fact shape.
 *
 * This mirrors `afrifacts/src/types/fact.ts` field for field. The two are
 * deliberately not shared: the app and the factory are separate projects
 * and the database is the only thing between them. If you change one,
 * change the other in the same commit.
 *
 * Everything the app renders lives here. Everything that proves a fact is
 * true lives in `provenance.ts`, which the app never sees.
 */

export type Category = 'History' | 'Business' | 'Culture' | 'Food' | 'Sports';

export const CATEGORIES: readonly Category[] = [
  'History',
  'Business',
  'Culture',
  'Food',
  'Sports',
] as const;

/** ISO 3166-1 alpha-2, or 'AFR' for pan-African. Never narrowed to 'NG'. */
export type CountryCode = string;

export interface DeepDive {
  /** One string per paragraph. */
  body: string[];
  whyItMatters: string;
  /** Minutes. */
  readTime: number;
  suggestedQuestion: string;
}

export interface Source {
  name: string;
  url: string;
  verified: boolean;
}

export interface FactImage {
  url: string;
  /** 'Photo · Wikimedia Commons' */
  credit: string;
  /** 'CC BY-SA 4.0' */
  license: string;
  /** Dark panel tone for the photo card. */
  panelColor: string;
}

export interface Fact {
  /** 'nf_0087' */
  id: string;
  country: CountryCode;
  category: Category;
  fact: string;
  deepDive: DeepDive;
  source: Source;
  /** null when the fact has no image, so every card decides its variant. */
  image: FactImage | null;
  /** Shown on share cards. */
  factNumber: number;
  relatedIds: string[];
}

export interface QuizQuestion {
  /** 'q_0210' */
  id: string;
  factId: string;
  question: string;
  /** Always exactly four. */
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}
