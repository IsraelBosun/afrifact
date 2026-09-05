/**
 * The only way screens and components reach data.
 *
 * Right now every function returns dummy content. In phase 2 these call
 * Supabase instead. Because every screen goes through this module, that
 * swap touches this file alone. Do not import dummyFacts.ts anywhere else.
 */

import type { Country, Fact, QuizQuestion, UserProfile, UserStats } from '@/src/types';

import { facts, quizQuestions } from './dummyFacts';

/** A quiz card is injected into the feed after every N facts. */
export const QUIZ_INTERVAL = 3;

export type FeedItem =
  | { kind: 'fact'; fact: Fact }
  | { kind: 'quiz'; seenCount: number };

/**
 * The feed for a country and category lane, with quiz cards injected.
 * `category` of 'For You' means every lane.
 */
export function getFeed(options: { country?: string; category?: string } = {}): FeedItem[] {
  const { country = 'NG', category = 'For You' } = options;

  const pool = facts.filter(
    (f) =>
      (country === 'AFR' || f.country === country) &&
      (category === 'For You' || f.category === category),
  );

  const items: FeedItem[] = [];
  pool.forEach((fact, i) => {
    items.push({ kind: 'fact', fact });
    const seen = i + 1;
    if (seen % QUIZ_INTERVAL === 0 && seen < pool.length) {
      items.push({ kind: 'quiz', seenCount: seen });
    }
  });
  return items;
}

export function getFactById(id: string): Fact | undefined {
  return facts.find((f) => f.id === id);
}

export function getRelatedFacts(id: string): Fact[] {
  const fact = getFactById(id);
  if (!fact) return [];
  return fact.relatedIds
    .map(getFactById)
    .filter((f): f is Fact => f !== undefined);
}

/** A quiz run is three questions. §4.3: under thirty seconds. */
export const QUIZ_LENGTH = 3;

/**
 * Three questions for one run.
 *
 * This used to return the whole array. That was survivable while the
 * corpus held six questions and became a bug the moment it held 444 —
 * the quiz screen renders one question per entry, so a run would have
 * been 444 questions long with a progress bar reading 'Question 2 of
 * 444'.
 *
 * The three come from three different facts. Drawing at random from a
 * flat list puts all three questions about one fact in the same run
 * often enough to notice, and a run that asks the same thing three ways
 * is one question wearing a disguise.
 */
export function getQuiz(): QuizQuestion[] {
  const byFact = new Map<string, QuizQuestion[]>();
  for (const question of quizQuestions) {
    byFact.set(question.factId, [...(byFact.get(question.factId) ?? []), question]);
  }

  const factIds = [...byFact.keys()];
  const picked: QuizQuestion[] = [];

  while (picked.length < QUIZ_LENGTH && factIds.length > 0) {
    const [factId] = factIds.splice(Math.floor(Math.random() * factIds.length), 1);
    const group = byFact.get(factId) ?? [];
    if (group.length > 0) picked.push(group[Math.floor(Math.random() * group.length)]);
  }

  return picked;
}

export function getSavedFacts(): Fact[] {
  return facts;
}

export function getUserStats(): UserStats {
  return {
    dayStreak: 7,
    factsLearned: 124,
    savedCount: 18,
    quizAccuracy: 86,
    week: [true, true, true, true, true, false, false],
  };
}

export function getUserProfile(): UserProfile {
  return {
    name: 'Israel',
    joinedAt: '2026-08-01',
    avatarUrl: null,
    country: 'NG',
  };
}

export function getCountries(): Country[] {
  return [
    { code: 'AFR', name: 'Africa · all countries', flag: '🌍', hasContent: true },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', hasContent: true },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', hasContent: false },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', hasContent: false },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', hasContent: false },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳', hasContent: false },
  ];
}

/** Lane chips across the top of the feed. 'For You' is always first. */
export function getCategoryLanes(): string[] {
  return ['For You', 'History', 'Business', 'Culture', 'Food', 'Sports'];
}
