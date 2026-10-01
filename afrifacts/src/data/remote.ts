/**
 * The database, over plain HTTP.
 *
 * Plain fetch, not `@supabase/supabase-js`, even though the app now has
 * that client for accounts (`src/auth/client.ts`). The corpus is public
 * and is read with the anon key whoever is signed in, so it is kept apart
 * from the session on purpose: an expired token or a half-finished sign-in
 * must never be able to empty the feed. The studio reaches PostgREST the
 * same way.
 *
 * WHAT THE KEY HERE IS, AND IS NOT
 *
 * `EXPO_PUBLIC_SUPABASE_ANON_KEY` is inlined into the bundle and can be
 * read out of the APK by anyone. That is expected: it identifies the
 * project, it does not authorise anything. Row Level Security decides
 * what a request may see, and the anon role has a grant on exactly two
 * tables. Passages, reviewer names and surprise scores are not merely
 * filtered out — they return 42501, permission denied.
 *
 * Rows come back in Postgres's snake_case and are mapped here into the
 * shapes in `src/types/fact.ts`, so nothing downstream of this file
 * knows the database exists.
 */

import type { Category, Fact, QuizQuestion } from '@/src/types';

const URL_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * The tables live in `afrifacts`, not `public`, so the project can be
 * shared with other work. PostgREST needs telling per request, and the
 * schema must also be on the API's exposed list.
 */
const SCHEMA = process.env.EXPO_PUBLIC_SUPABASE_SCHEMA ?? 'afrifacts';

export const isConfigured = URL_BASE.length > 0 && ANON_KEY.length > 0;

/** A row as Postgres returns it. */
type FactRow = {
  id: string;
  country: string;
  category: string;
  fact: string;
  deep_dive: Fact['deepDive'];
  source: Fact['source'];
  image: Fact['image'];
  fact_number: number;
  related_ids: string[] | null;
};

type QuizRow = {
  id: string;
  fact_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

async function query<T>(path: string): Promise<T[]> {
  if (!isConfigured) {
    throw new Error(
      'No Supabase URL or key. Copy afrifacts/.env.example to .env and fill it in.',
    );
  }

  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Accept-Profile': SCHEMA,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let detail = body.slice(0, 200);
    try {
      const parsed = JSON.parse(body);
      detail = [parsed.message, parsed.hint].filter(Boolean).join(' — ');
    } catch {
      /* not JSON; the status is what there is */
    }
    throw new Error(`${res.status}: ${detail}`);
  }

  return (await res.json()) as T[];
}

/**
 * Every published fact, in the order they were written.
 *
 * The whole corpus in one request. At 148 facts that is a few hundred
 * kilobytes and one round trip, and it makes every screen's data
 * synchronous — the feed can jump to any fact, the deep dive can resolve
 * a related id, and the quiz can draw from three different facts without
 * any of them waiting on the network.
 *
 * This is the thing to change first when the corpus is large. Several
 * hundred facts is still fine; several thousand is a page-as-you-swipe
 * problem, and this function is where that lands.
 *
 * `published` is not filtered here. The policy on the table does it, so
 * an unpublished fact is not returned to this key at all.
 */
export async function fetchFacts(): Promise<Fact[]> {
  const rows = await query<FactRow>('facts?select=*&order=fact_number&limit=5000');
  return rows.map((row) => ({
    id: row.id,
    country: row.country,
    category: row.category as Category,
    fact: row.fact,
    deepDive: row.deep_dive,
    source: row.source,
    // Null is a designed value, not a gap: the typographic card is a real
    // variant and `hasImage` branches on exactly this.
    image: row.image ?? null,
    factNumber: row.fact_number,
    relatedIds: row.related_ids ?? [],
  }));
}

export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const rows = await query<QuizRow>('quiz_questions?select=*&limit=5000');
  return rows.map((row) => ({
    id: row.id,
    factId: row.fact_id,
    question: row.question,
    options: row.options as QuizQuestion['options'],
    correctIndex: row.correct_index as QuizQuestion['correctIndex'],
    explanation: row.explanation,
  }));
}
