/** Everything the profile and streak UI reads. Phase 1 serves this from dummy data. */

export interface UserStats {
  dayStreak: number;
  factsLearned: number;
  savedCount: number;
  /** Percentage, 0-100. */
  quizAccuracy: number;
  /** Seven booleans, Monday first: was the streak kept that day. */
  week: boolean[];
}

export interface UserProfile {
  name: string;
  /** ISO date string. Rendered as e.g. 'Joined March 2026'. */
  joinedAt: string;
  avatarUrl: string | null;
  /** The country whose feed the user is currently reading. */
  country: string;
}

export interface Country {
  /** ISO 3166-1 alpha-2, or 'AFR' for the pinned pan-African entry. */
  code: string;
  name: string;
  flag: string;
  /** False for countries with no published facts yet. */
  hasContent: boolean;
}
