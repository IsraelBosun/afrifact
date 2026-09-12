/**
 * The only way screens and components reach data.
 *
 * This module used to import a generated file of facts. It now reads
 * Supabase — and because every screen goes through here, that swap
 * touched this file and the root layout and nothing else. That was the
 * point of the rule, and it held.
 *
 * WHY THE GETTERS ARE STILL SYNCHRONOUS
 *
 * The corpus is fetched once, at launch, into the store below. The
 * alternative — a promise per getter — would have put a loading state
 * into all six screens, and bought nothing: the feed jumps to arbitrary
 * facts as you swipe, the deep dive resolves related ids, and the quiz
 * draws from three different facts. Every one of those wants the whole
 * set in hand, not a page of it.
 *
 * This holds while the corpus is hundreds of facts. At thousands it
 * becomes a page-as-you-swipe problem, and `remote.ts` is where that
 * lands rather than here.
 *
 * WHERE THE CORPUS COMES FROM
 *
 * `cache.ts` first, `remote.ts` second. The network is only reached on
 * the first launch after install and behind the user when the stored
 * copy is old — so the app opens offline, and opens faster online.
 */

import { useSyncExternalStore } from 'react';

import { CATEGORIES, type Country, type Fact, type QuizQuestion, type UserProfile, type UserStats } from '@/src/types';

import { loadBookmarks, savedIds } from './bookmarks';
import { isStale, readCache, writeCache } from './cache';
import { ALL_AFRICA, flagFor, knownCountryCodes, nameFor } from './countries';
import { getCountry, initCountry, loadCountry } from './country';
import {
  clearDealPosition,
  dealOrder,
  loadDeal,
  loadDealPosition,
  reconcileDeal,
  resetDeal,
  reshuffleDeal,
} from './deal';
import { factForDay } from './daily';
import { fetchFacts, fetchQuizQuestions } from './remote';
import { buildRelatedIndex, relatedTo, type RelatedFact, type RelatedIndex } from './related';
import {
  accuracyOf,
  daysSetOf,
  progress,
  resetAnsweredQuestions,
  streakOf,
  wasAnswered,
  weekOf,
} from './progress';
import { matchFacts, type SearchHit } from './search';

export { isSaved, toggleSaved, useSavedIds } from './bookmarks';
export { getCountry, setCountry, useCountry } from './country';
export { flagFor, nameFor } from './countries';
export { dealPosition, setDealPosition, useDeal } from './deal';
export { factForDay } from './daily';
export {
  loadProgress,
  noteFactSeen,
  recordQuizRun,
  setDisplayName,
  useProgress,
} from './progress';
export type { RelatedFact } from './related';
export type { SearchHit } from './search';

/** Deal the feed again, renumbering from 1. What the shuffle button does. */
export function reshuffleFeed(): void {
  reshuffleDeal(facts);
}

/*
  The corpus, in memory.

  Empty until `loadCorpus()` resolves. The root layout holds the splash
  screen until it does, for the same reason it holds it for fonts: the
  app opens directly into a fact, and a frame of empty feed is worse
  than a frame of splash.
*/
let facts: Fact[] = [];
let quizQuestions: QuizQuestion[] = [];

/** Whether this session's facts came off the device rather than the network. */
let fromCache = false;

async function fetchBoth(): Promise<[Fact[], QuizQuestion[]]> {
  return Promise.all([fetchFacts(), fetchQuizQuestions()]);
}

/**
 * Fill the store. Called once, from the root layout.
 *
 * The device first, then the network. A cached corpus is used as-is and
 * the launch does not touch the network at all — which is the whole
 * point: opening the app on a train should show facts, not the retry
 * screen, when the phone already downloaded all of them yesterday. It is
 * also faster, by a round trip and 450KB, on every launch.
 *
 * Throws only when there is nothing on the device AND the network
 * fails. An app that silently shows nothing is indistinguishable from an
 * app with no content, and the layout can say "couldn't reach the facts,
 * retry" only if it is told.
 */
export async function loadCorpus(): Promise<void> {
  // Bookmarks and the chosen country ride along: all three are one
  // AsyncStorage read, all three are needed before the first frame, and
  // neither of the other two throws, so they cannot turn a working corpus
  // into the retry screen.
  const [cached] = await Promise.all([
    readCache(),
    loadBookmarks(),
    loadCountry(),
    loadDeal(),
    loadDealPosition(),
  ]);

  if (cached) {
    facts = cached.facts;
    quizQuestions = cached.quiz;
    fromCache = true;
    initCountry(busiestCountry());
    // Drops ids the corpus no longer has and appends anything new. This is
    // what makes a delete in the studio close its own gap.
    renumber();
    reconcileDeal(facts);
    if (isStale(cached.savedAt)) refreshInBackground();
    return;
  }

  const [loadedFacts, loadedQuiz] = await fetchBoth();
  facts = loadedFacts;
  quizQuestions = loadedQuiz;
  fromCache = false;
  renumber();
  reconcileDeal(facts);
  // After the corpus, never before: the default is whichever country the
  // corpus turns out to be about, so it cannot be computed until there is
  // one. A stored choice is left alone.
  initCountry(busiestCountry());
  await writeCache(loadedFacts, loadedQuiz);
}

/**
 * Fetch a fresher corpus for NEXT launch, not this one.
 *
 * Deliberately not applied to the store in flight. The feed is a paged
 * vertical list the user is swiping through, so replacing the array
 * underneath them reorders the cards mid-gesture and can send a deep
 * dive to a fact that is no longer at that index. Facts are not news;
 * being half a day behind an approval costs nothing, and shuffling the
 * screen someone is reading costs their place.
 *
 * Every failure is swallowed. This runs behind a working app, and there
 * is no version of "the background refresh failed" that the user can act
 * on or would want to be told.
 */
function refreshInBackground(): void {
  void fetchBoth()
    .then(([freshFacts, freshQuiz]) => writeCache(freshFacts, freshQuiz))
    .catch(() => {});
}

/*
  A counter that changes whenever the corpus in memory is replaced.

  The getters below are synchronous reads of module state, which was fine
  while that state was written once at launch. Pull-to-refresh writes it
  again, mid-session, and React has no way to know — so screens subscribe
  to this and re-read.
*/
let corpusVersion = 0;
const corpusListeners = new Set<() => void>();

function subscribeCorpus(listener: () => void): () => void {
  corpusListeners.add(listener);
  return () => corpusListeners.delete(listener);
}

function getCorpusVersion(): number {
  return corpusVersion;
}

/** Re-renders the caller when the corpus is replaced. */
export function useCorpusVersion(): number {
  return useSyncExternalStore(subscribeCorpus, getCorpusVersion, getCorpusVersion);
}

/**
 * Go and get the corpus now, ignoring the cache's age.
 *
 * The counterpart to `refreshInBackground`, and deliberately different
 * from it: that one refuses to touch the live store because the user is
 * mid-swipe and reordering the feed under them would lose their place.
 * This one is a pull-to-refresh — the user asked, they are at the top of
 * the list, and a refresh that changed nothing on screen would look
 * broken.
 *
 * Throws on a failed fetch. The caller is a gesture with a spinner
 * attached, so it can say so and stop; swallowing it here would spin
 * forever and call it success.
 */
export async function refreshCorpus(): Promise<void> {
  const [freshFacts, freshQuiz] = await fetchBoth();
  facts = freshFacts;
  quizQuestions = freshQuiz;
  fromCache = false;
  /*
    A refresh starts the run over: Fact #1, in order.

    `resetDeal` rather than `reconcileDeal` because this is the moment the
    corpus itself changed. Keeping a shuffle across it would leave the
    reader mid-deal in a set that is no longer the one that was dealt, and
    a delete in the studio is exactly what this gesture exists to collect —
    so the numbering is rebuilt and the gap closes in the same breath.
  */
  renumber();
  resetDeal(freshFacts);
  clearDealPosition();
  await writeCache(freshFacts, freshQuiz);

  corpusVersion += 1;
  for (const listener of corpusListeners) listener();
}

/** True once the corpus is in hand. */
export function isLoaded(): boolean {
  return facts.length > 0;
}

/**
 * True when this session is running on a stored corpus.
 *
 * Nothing renders it yet. It is here because "why is this fact missing"
 * is otherwise unanswerable from inside the app, and the answer is
 * usually this.
 */
export function isFromCache(): boolean {
  return fromCache;
}

/**
 * A quiz card is injected into the feed after every N facts.
 *
 * Counted in cards as they are dealt, not in corpus positions, so a
 * shuffled feed still breaks at the same rhythm — the injection below runs
 * after the ordering, on whatever order came out of it.
 *
 * Seven rather than three: at three the feed was two facts and an
 * interruption, which is a quiz app with facts between the quizzes rather
 * than the other way round.
 */
export const QUIZ_INTERVAL = 7;

export type FeedItem =
  /** `number` is the canonical "Fact #N", the same on every device. */
  | { kind: 'fact'; fact: Fact; number: number }
  | { kind: 'quiz'; seenCount: number }
  | { kind: 'end'; total: number };

/*
  The canonical numbering: fact id to "Fact #N".

  Rebuilt whenever the corpus is replaced, never stored. That is what makes
  a deletion close its own gap — the numbers are a function of the facts
  that exist, so removing one renumbers everything after it by definition
  and there is nothing left behind to point at a hole.

  Ordered by `factNumber`, which is the digits out of the id and therefore
  the order the facts were written. It is used only as a sort key and never
  shown: it starts at 1001 and has 46 holes in its range, which is exactly
  why the displayed number is this index instead.

  Deliberately NOT the deal position. The deal is one reader's shuffle, so
  its first card is always number one — which made "Fact #1" mean "the top
  of my feed" rather than a particular fact, and meant a refresh appeared
  to renumber the corpus.
*/
let canonicalNumbers = new Map<string, number>();

/*
  Related facts are derived from the corpus too, so the index they need is
  invalidated in exactly the same breath as the numbering. Cleared rather
  than rebuilt: it costs a pass over every fact, and a session that never
  opens a deep dive should never pay for it.
*/
let relatedIndex: RelatedIndex | null = null;

function renumber(): void {
  const ordered = [...facts].sort(
    (a, b) => a.factNumber - b.factNumber || a.id.localeCompare(b.id),
  );
  canonicalNumbers = new Map(ordered.map((fact, index) => [fact.id, index + 1]));
  relatedIndex = null;
}

/**
 * The feed for a country and category lane, with quiz cards injected.
 * `category` of 'For You' means every lane.
 *
 * The order comes from the deal (`deal.ts`), not from here and not from
 * the corpus: facts mined from one article share a category and were
 * numbered consecutively, so corpus order opened the feed with eleven
 * History cards in a row.
 *
 * Two orderings at once, and they are not the same one. The deal decides
 * what comes next; the canonical numbering decides what each card is
 * called. So a shuffled feed can open on Fact #92 and still be in a
 * sensible order, and "Fact #1" means one particular fact to everybody
 * rather than "whatever landed at the top of my shuffle".
 */
export function getFeed(options: { country?: string; category?: string } = {}): FeedItem[] {
  const { country = ALL_AFRICA, category = 'For You' } = options;

  const byId = new Map(facts.map((fact) => [fact.id, fact]));

  const pool = dealOrder()
    .map((id) => byId.get(id))
    .filter((fact): fact is Fact => fact !== undefined)
    .filter(
      (fact) =>
        (country === ALL_AFRICA || fact.country === country) &&
        (category === 'For You' || fact.category === category),
    );

  const items: FeedItem[] = [];
  pool.forEach((fact, i) => {
    const seen = i + 1;
    items.push({ kind: 'fact', fact, number: canonicalNumbers.get(fact.id) ?? 0 });
    if (seen % QUIZ_INTERVAL === 0 && seen < pool.length) {
      items.push({ kind: 'quiz', seenCount: seen });
    }
  });

  // The end is a place now that the cards are numbered. Without a card
  // here the feed simply stops, and reaching the last one reads as the
  // app having run out rather than the reader having finished.
  if (pool.length > 0) items.push({ kind: 'end', total: pool.length });

  return items;
}

/**
 * Every fact for the country on screen, unordered and without quiz cards.
 *
 * For things that need the pool rather than the feed — the notification
 * scheduler picks a fortnight of facts from this. Scoped to the selected
 * country so the fact posted at 7am comes from wherever the reader has
 * been reading.
 */
export function getFactPool(): Fact[] {
  const country = getCountry();
  if (country === ALL_AFRICA) return facts;
  const inCountry = facts.filter((fact) => fact.country === country);
  // Never hand back nothing because a country ran dry: a notification with
  // a fact from elsewhere beats no notification at all.
  return inCountry.length > 0 ? inCountry : facts;
}

export function getFactById(id: string): Fact | undefined {
  return facts.find((f) => f.id === id);
}

/**
 * The canonical "Fact #N".
 *
 * The same answer everywhere: the feed card, the deep dive, the exported
 * image, and every other device running the same published corpus. 0 when
 * the fact is not in the corpus, which callers read as "no number to show"
 * rather than as fact zero.
 */
export function getFactNumber(id: string): number {
  return canonicalNumbers.get(id) ?? 0;
}

/**
 * Today's fact, for the Today button and the morning notification.
 *
 * Drawn from the country pool rather than the whole corpus, so a reader on
 * Ghana gets a Ghanaian fact of the day rather than whatever the global
 * hash happened to land on.
 */
export function getTodaysFact(): Fact | null {
  return factForDay(new Date(), getFactPool());
}

/**
 * Search the whole corpus, not the country pool.
 *
 * Deliberately wider than the feed. Someone typing a name is looking for
 * one particular fact, and hiding it because their country selector is set
 * elsewhere would be the app refusing to answer a question it can answer.
 * Numbering is corpus-wide too, so a hit's "#57" means the same thing here
 * as it does on the card.
 */
export function searchFacts(query: string): SearchHit[] {
  return matchFacts(query, facts, getFactNumber);
}

/**
 * Facts about the same subject, for the row under a deep dive.
 *
 * Curated `relatedIds` come first when a fact has any, because a link
 * someone chose beats a link something inferred. None of the 109 facts in
 * the corpus has one today, so in practice this is the derived list; the
 * branch is here so that hand-authored links keep working the day the
 * pipeline starts writing them.
 *
 * The index is built on the first deep dive of a session and reused after
 * that, which is what keeps this from re-reading the corpus per fact.
 */
export function getRelatedFacts(id: string): RelatedFact[] {
  const fact = getFactById(id);
  if (!fact) return [];

  const curated = fact.relatedIds
    .map(getFactById)
    .filter((f): f is Fact => f !== undefined)
    .map((f) => ({ fact: f, shared: '', score: Infinity }));

  relatedIndex ??= buildRelatedIndex(facts);
  const seen = new Set([id, ...curated.map((c) => c.fact.id)]);
  const derived = relatedTo(relatedIndex, id).filter((r) => !seen.has(r.fact.id));

  return [...curated, ...derived];
}

/** A quiz run is three questions. §4.3: under thirty seconds. */
export const QUIZ_LENGTH = 3;

/**
 * Three questions for one run.
 *
 * This used to return the whole array. That was survivable while the
 * corpus held six questions and became a bug the moment it held 444 -
 * the quiz screen renders one question per entry, so a run would have
 * been 444 questions long with a progress bar reading 'Question 2 of
 * 444'.
 *
 * The three come from three different facts. Drawing at random from a
 * flat list puts all three questions about one fact in the same run
 * often enough to notice, and a run that asks the same thing three ways
 * is one question wearing a disguise.
 *
 * NOTHING IS ASKED TWICE WHILE SOMETHING IS UNASKED
 *
 * Random with no memory was fine at six questions and wrong at 480: a
 * reader who plays daily starts meeting repeats within the first week,
 * and a repeat is not a quiz, it is a recall test. So facts holding a
 * question the reader has never seen are drawn from first, and an
 * already-answered question is only served to keep a run from coming up
 * short. When the whole corpus has been answered the record is cleared
 * and the cycle starts again, which is the honest end of a finite set.
 */
export function getQuiz(length: number = QUIZ_LENGTH): QuizQuestion[] {
  return deal(quizQuestions, length);
}

/**
 * The same deal, restricted to named questions.
 *
 * A challenge carries exact ids, because the whole point is that two
 * people answer the same three things. Unknown ids are dropped rather
 * than faked: the corpus moves, and a challenge sent last month may name
 * a question that has since been retired.
 */
export function getQuizByIds(ids: string[]): QuizQuestion[] {
  const byId = new Map(quizQuestions.map((q) => [q.id, q]));
  return ids.map((id) => byId.get(id)).filter((q): q is QuizQuestion => q !== undefined);
}

/**
 * How many questions the reader has never been asked.
 *
 * Takes the answered ids rather than reading the store, so a caller that
 * renders this can depend on the same value React re-renders it for.
 * Reading module state here instead would make the number correct and
 * the dependency imaginary.
 */
export function unansweredCount(answered: string[]): number {
  const seen = new Set(answered);
  return quizQuestions.reduce((n, q) => (seen.has(q.id) ? n : n + 1), 0);
}

function groupByFact(questions: QuizQuestion[]): Map<string, QuizQuestion[]> {
  const byFact = new Map<string, QuizQuestion[]>();
  for (const question of questions) {
    byFact.set(question.factId, [...(byFact.get(question.factId) ?? []), question]);
  }
  return byFact;
}

function takeRandom<T>(pool: T[]): T | undefined {
  if (pool.length === 0) return undefined;
  return pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
}

/**
 * `length` questions from `length` different facts, freshest first.
 *
 * The count is a parameter rather than the constant it used to be, because
 * §4.3's three is now the shortest of three run lengths rather than the
 * only one. Everything below is unchanged by that: the tiers care about
 * how many are left to pick, not about how many were asked for.
 */
function deal(pool: QuizQuestion[], length: number): QuizQuestion[] {
  if (pool.length === 0 || length <= 0) return [];

  // Everything answered means the reader has finished the corpus. Clear
  // the record here rather than in the UI, so every caller of getQuiz
  // gets the same behaviour without having to know about it.
  if (pool.every((q) => wasAnswered(q.id))) resetAnsweredQuestions();

  const byFact = groupByFact(pool);
  const fresh: string[] = [];
  const stale: string[] = [];
  for (const [factId, questions] of byFact) {
    (questions.some((q) => !wasAnswered(q.id)) ? fresh : stale).push(factId);
  }

  const picked: QuizQuestion[] = [];

  // 1. The normal run: three different facts, each handing over a
  //    question the reader has never been asked.
  while (picked.length < length) {
    const factId = takeRandom(fresh);
    if (factId === undefined) break;

    const unseen = (byFact.get(factId) ?? []).filter((q) => !wasAnswered(q.id));
    const question = takeRandom(unseen);
    if (question !== undefined) picked.push(question);
  }

  // 2. Fewer than three facts still hold something unseen, but unseen
  //    questions remain. The two rules collide here and never-repeat
  //    wins: one fact contributing twice is a smaller compromise than
  //    asking something already answered, and the count on the quiz tab
  //    promises the second, not the first. Reachable only on the last
  //    run or two of a cycle.
  if (picked.length < length) {
    const chosen = new Set(picked.map((q) => q.id));
    const remaining = pool.filter((q) => !wasAnswered(q.id) && !chosen.has(q.id));
    while (picked.length < length) {
      const question = takeRandom(remaining);
      if (question === undefined) break;
      picked.push(question);
    }
  }

  // 3. Nothing unseen is left anywhere, so the run is padded with
  //    repeats. Only a corpus of fewer than three facts gets here: a
  //    full one is reset at the top instead.
  while (picked.length < length) {
    const factId = takeRandom(stale);
    if (factId === undefined) break;

    const question = takeRandom([...(byFact.get(factId) ?? [])]);
    if (question !== undefined) picked.push(question);
  }

  return picked;
}

/**
 * The saved facts, newest save first.
 *
 * This returned the whole corpus until saves were real, which made the
 * Saved tab show all 148 facts on a fresh install and the bookmark button
 * look like it did nothing.
 *
 * Ids with no fact behind them are dropped rather than rendered as holes:
 * a fact can be retired in the studio between one launch and the next, and
 * the save outlives it.
 */
export function getSavedFacts(): Fact[] {
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  return savedIds()
    .map((id) => byId.get(id))
    .filter((fact): fact is Fact => fact !== undefined);
}

/**
 * Still dummy, with one exception.
 *
 * `savedCount` is read from the real store, because the Saved tab now
 * shows a real number and a profile claiming a different one would be a
 * visible contradiction rather than a placeholder. The streak, facts
 * learned and quiz accuracy are next: nothing records a quiz result yet.
 */
/**
 * The profile's four cards and the streak flame, from what actually happened.
 *
 * Every number here was a constant until now, which meant a first-time
 * reader was shown a seven-day streak and 124 facts learned. Components
 * calling this need `useProgress()` alongside it to re-render, the same
 * arrangement `savedCount` already has with `useSavedIds()`.
 */
export function getUserStats(): UserStats {
  const record = progress();
  const days = daysSetOf(record);
  return {
    dayStreak: streakOf(days),
    factsLearned: record.seen.length,
    savedCount: savedIds().length,
    quizAccuracy: accuracyOf(record),
    quizAnswered: record.quizAnswered,
    week: weekOf(days),
  };
}

/**
 * Who the reader is, as far as the device knows.
 *
 * No account, so there is no name to fetch: it is empty until they type
 * one, and the profile asks rather than inventing. `joinedAt` is the first
 * day anything was recorded, not the install date, because that is the
 * day the app has evidence for.
 */
export function getUserProfile(): UserProfile {
  const record = progress();
  return {
    name: record.name,
    joinedAt: record.joinedAt,
    avatarUrl: null,
    country: getCountry(),
  };
}

/**
 * The country list, from the corpus rather than from a constant.
 *
 * This was a hardcoded six with Nigeria's `hasContent` set by hand. Now
 * whichever countries actually have approved facts come first and are
 * selectable, and every other African country follows as "coming soon" —
 * so publishing the first Ghanaian fact moves Ghana up the list on the
 * next refresh, with no app release and nothing to remember to edit.
 */
export function getCountries(): Country[] {
  const counts = new Map<string, number>();
  for (const fact of facts) {
    counts.set(fact.country, (counts.get(fact.country) ?? 0) + 1);
  }

  const withContent = [...counts.keys()].sort((a, b) =>
    nameFor(a).localeCompare(nameFor(b)),
  );
  const withContentSet = new Set(withContent);
  const rest = knownCountryCodes()
    .filter((code) => !withContentSet.has(code))
    .sort((a, b) => nameFor(a).localeCompare(nameFor(b)));

  const entry = (code: string, hasContent: boolean): Country => ({
    code,
    name: nameFor(code),
    flag: flagFor(code),
    hasContent,
  });

  return [
    { code: ALL_AFRICA, name: nameFor(ALL_AFRICA), flag: '🌍', hasContent: facts.length > 0 },
    ...withContent.map((code) => entry(code, true)),
    ...rest.map((code) => entry(code, false)),
  ];
}

/** Whichever country holds the most facts. The default when nobody has chosen. */
function busiestCountry(): string {
  const counts = new Map<string, number>();
  for (const fact of facts) {
    counts.set(fact.country, (counts.get(fact.country) ?? 0) + 1);
  }
  let best = ALL_AFRICA;
  let most = 0;
  for (const [code, count] of counts) {
    if (count > most) {
      best = code;
      most = count;
    }
  }
  return best;
}

/**
 * Lane chips across the top of the feed. 'For You' is always first.
 *
 * Derived from the categories the corpus actually contains, so a sixth
 * category approved in the studio grows a chip on its own. Known
 * categories keep the order in `CATEGORIES` — that order is a design
 * decision, not alphabetical accident — and anything unrecognised is
 * appended rather than dropped, because a fact with no lane to sit in
 * would otherwise be invisible in every view except 'For You'.
 *
 * A new category still wants a colour family added in `theme/colors.ts`.
 * Without one it borrows a stable family instead of crashing, which is a
 * soft landing and not a substitute.
 */
export function getCategoryLanes(country?: string): string[] {
  const inCountry =
    country === undefined || country === ALL_AFRICA
      ? facts
      : facts.filter((fact) => fact.country === country);

  // Scoped to the country on screen, so a lane can never be a chip that
  // leads to an empty feed. Ghana having no Food facts should not put a
  // Food chip above a Ghanaian feed.
  const present = new Set<string>(inCountry.map((fact) => fact.category));
  const known = CATEGORIES.filter((category) => present.has(category));
  const unknown = [...present]
    .filter((category) => !(CATEGORIES as readonly string[]).includes(category))
    .sort();
  return ['For You', ...known, ...unknown];
}
