/**
 * Searching the corpus.
 *
 * Entirely in memory over a few hundred facts, which is why there is no
 * index, no debounce and no spinner: the whole corpus is already on the
 * device (see `cache.ts`), so a query is a loop and the results are there
 * before the key repeats. It also works with the phone in flight mode,
 * which a server-side search never would.
 *
 * Pure. It is handed the facts rather than reaching for them, so it can be
 * reasoned about and tested without a corpus loaded; `index.ts` is the one
 * place that knows where facts live (§3).
 */

import type { Fact } from '@/src/types';

/** A fact that matched, and how well. */
export interface SearchHit {
  fact: Fact;
  /** Canonical number, so the row can name what the reader can quote. */
  number: number;
  score: number;
}

/**
 * A bare number is a fact number, not a word.
 *
 * Canonical numbering made #57 the same card on every phone, which makes
 * it the one thing about a fact a person can say out loud to someone else.
 * So the search box takes it: typing `57` goes to Fact #57 rather than
 * finding every fact containing the digits 5 and 7. That is a button saved
 * and the only interpretation anyone typing three digits ever wants.
 */
function asFactNumber(query: string): number | null {
  return /^#?\d{1,5}$/.test(query) ? Number(query.replace('#', '')) : null;
}

/** Everything about a fact that is worth matching against, lowercased once. */
function haystack(fact: Fact): { headline: string; rest: string } {
  return {
    headline: fact.fact.toLowerCase(),
    rest: [
      ...fact.deepDive.body,
      fact.deepDive.whyItMatters,
      fact.source.name,
      fact.category,
    ]
      .join(' ')
      .toLowerCase(),
  };
}

/**
 * Match, rank, return.
 *
 * Every term has to appear somewhere — AND, not OR. With a corpus this
 * small OR returns half of it for a two-word query, and a result list that
 * long is the same as no result list.
 *
 * A hit in the fact itself outweighs one buried in the deep dive, because
 * someone searching "Babayaro" wants the fact about Babayaro above the
 * three articles that mention him in passing.
 */
export function matchFacts(
  query: string,
  facts: Fact[],
  numberOf: (id: string) => number,
): SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const wanted = asFactNumber(trimmed);
  if (wanted !== null) {
    const found = facts.find((fact) => numberOf(fact.id) === wanted);
    return found ? [{ fact: found, number: wanted, score: 100 }] : [];
  }

  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  const hits: SearchHit[] = [];
  for (const fact of facts) {
    const { headline, rest } = haystack(fact);

    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      const inHeadline = headline.includes(term);
      const inRest = rest.includes(term);
      if (!inHeadline && !inRest) {
        matchedAll = false;
        break;
      }
      score += inHeadline ? 3 : 1;
    }
    if (!matchedAll) continue;

    // The whole query as one phrase beats the same words scattered.
    if (terms.length > 1 && headline.includes(trimmed.toLowerCase())) score += 4;

    hits.push({ fact, number: numberOf(fact.id), score });
  }

  // Ties go to the lower number, so a repeated search is a stable list
  // rather than one that reorders itself under the reader's thumb.
  return hits.sort((a, b) => b.score - a.score || a.number - b.number);
}
