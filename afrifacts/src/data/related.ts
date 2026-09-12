/**
 * "More about Awolowo": related facts, found by what a fact is ABOUT.
 *
 * The `relatedIds` field on a fact has never been populated. All 109 facts
 * in the corpus carry an empty array, so the deep dive's related section
 * has been rendering nothing at all. Rather than hand-curate several
 * hundred links, this derives them, and it derives them from the fact
 * sentence itself, which is where a fact says what it is about.
 *
 * WHY NAMES RATHER THAN WORDS
 *
 * The first cut scored shared words weighted by rarity, and it linked
 * Calabar's first hospital to a heart transplant because both sentences
 * contained "hospital". Facts are one sentence long, so word overlap at
 * that length is mostly coincidence.
 *
 * What is not coincidence is a shared NAME. So the signal here is runs of
 * consecutive capitalised words: "Zuma Rock", "Eze Nri", "Moshood Abiola".
 * A person is named in full once and by surname everywhere after, so the
 * parts of a multi-word name are indexed too, or "Moshood Abiola" would
 * never meet the four other facts that just say "Abiola".
 *
 * Shared rare words survive as a weak fallback, at a fraction of the
 * weight, for facts that share a subject without sharing a name.
 *
 * Measured on the real corpus, which is what the tuning was for: Awolowo
 * finds three Awolowo facts, Calabar five Calabar facts, Zuma Rock finds
 * Zuma Rock. It is not perfect. Wizkid's "Guinness Book of Records" still
 * reaches "World Book Capital" through the fragment "Book", which is why
 * the shared term is printed on every card. A reader who can see WHY two
 * facts were linked can dismiss a bad link at a glance, where an
 * unexplained one just looks like the app being stupid.
 */

import type { Fact } from '@/src/types';

/** Grammatical words, and the handful of verbs every fact happens to use. */
const STOP = new Set(
  (
    'a an the and or but if then than that this these those of in on at to for from by with without ' +
    'into over under after before during while as is are was were be been being it its his her their ' +
    'our your my he she they we you i not no nor so such own same too very can will just should now ' +
    'what which who whom when where why how all any both each few more most other some only up down ' +
    'out off again further once about against between through above below here there also had has ' +
    'have having did does do would could may might must one two three first second new old many much ' +
    'them him us me year years time world made make used using known became become'
  ).split(' '),
);

/** Drop the possessive, then anything that is not a letter, digit or hyphen. */
function bare(word: string): string {
  return word.replace(/['’]s$/, '').replace(/[^A-Za-z0-9-]/g, '');
}

/** Lowercase, punctuation-free, and de-pluralised enough to match. */
function norm(word: string): string {
  const w = bare(word).toLowerCase().replace(/[^a-z0-9]/g, '');
  return w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w;
}

function words(text: string): string[] {
  return text
    .split(/\s+/)
    .map(norm)
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

/**
 * Names found in a sentence: normalised key to the form to show a reader.
 *
 * A run is broken by any word that is not capitalised, so "Guinness Book of
 * Records" yields "Guinness Book" and "Records" rather than one long
 * string. Sentence-initial words are included: a great many facts open with
 * the person's name, and excluding position zero lost every one of them.
 */
function namesIn(text: string): Map<string, string> {
  const found = new Map<string, string>();

  const add = (run: string[]) => {
    const key = run.map(norm).join(' ');
    if (key.replace(/ /g, '').length >= 3) found.set(key, run.map(bare).join(' '));
  };

  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    let run: string[] = [];
    const flush = () => {
      if (run.length === 0) return;
      add(run);
      // Index the parts as well as the whole, so a surname on its own is
      // still a match. This is what links "Moshood Abiola" to "Abiola".
      if (run.length > 1) for (const word of run) add([word]);
      run = [];
    };

    for (const raw of sentence.split(/\s+/)) {
      const clean = bare(raw);
      if (/^[A-Z][a-zA-Z-]+$/.test(clean) && !STOP.has(norm(clean))) run.push(raw);
      else flush();
    }
    flush();
  }
  return found;
}

/** A fact that shares a subject, and the term that says so. */
export interface RelatedFact {
  fact: Fact;
  /** The strongest shared term, in the form it is written. Shown on the card. */
  shared: string;
  score: number;
}

/**
 * The corpus, prepared for lookup.
 *
 * Built once per corpus rather than per fact opened: every deep dive would
 * otherwise re-tokenise all 109 facts on mount.
 */
export interface RelatedIndex {
  facts: Fact[];
  terms: Set<string>[];
  names: Map<string, string>[];
  /** How many facts each term and each name appears in. */
  termDf: Map<string, number>;
  nameDf: Map<string, number>;
  byId: Map<string, number>;
}

export function buildRelatedIndex(facts: Fact[]): RelatedIndex {
  const terms = facts.map((f) => new Set(words(f.fact)));
  const names = facts.map((f) => namesIn(f.fact));
  const termDf = new Map<string, number>();
  const nameDf = new Map<string, number>();

  for (const set of terms) for (const t of set) termDf.set(t, (termDf.get(t) ?? 0) + 1);
  for (const map of names) for (const k of map.keys()) nameDf.set(k, (nameDf.get(k) ?? 0) + 1);

  return {
    facts,
    terms,
    names,
    termDf,
    nameDf,
    byId: new Map(facts.map((f, i) => [f.id, i])),
  };
}

/*
  Tuned against the real corpus, not chosen. Each of these was moved and the
  output read before it was left where it is.
*/

/**
 * A name in more than this many facts is a category, not a subject.
 *
 * This is what stops "Nigerian" — capitalised, and in a tenth of the
 * corpus — from linking every fact to every other one.
 */
const NAME_MAX_DF = 8;
/** A shared plain word only counts if it is genuinely rare. */
const TERM_MAX_DF = 4;
/** Plain words are the fallback, so they are worth a fraction of a name. */
const TERM_WEIGHT = 0.6;
/**
 * Drop anything scoring less than this share of the best match.
 *
 * Without it every fact had eight related facts and most of the tail was
 * coincidence. A relative cut rather than an absolute one, because a fact
 * with one strong link and a fact with six weak ones both deserve to show
 * only what they actually have.
 */
const KEEP_RATIO = 0.5;
const LIMIT = 10;

export function relatedTo(index: RelatedIndex, id: string): RelatedFact[] {
  const self = index.byId.get(id);
  if (self === undefined) return [];

  const myTerms = index.terms[self];
  const myNames = index.names[self];
  const total = index.facts.length;

  const hits: RelatedFact[] = [];
  for (let i = 0; i < total; i++) {
    if (i === self) continue;

    let score = 0;
    let shared = '';
    let strongest = 0;

    for (const [key, display] of index.names[i]) {
      if (!myNames.has(key) || (index.nameDf.get(key) ?? 0) > NAME_MAX_DF) continue;
      // A longer shared name is a stronger claim: "Zuma Rock" says more
      // about two facts than "Zuma" on its own.
      const weight = 5 + key.split(' ').length * 3;
      score += weight;
      if (weight > strongest) {
        strongest = weight;
        shared = myNames.get(key) ?? display;
      }
    }

    for (const term of index.terms[i]) {
      const df = index.termDf.get(term) ?? 0;
      if (!myTerms.has(term) || df > TERM_MAX_DF) continue;
      const weight = Math.log(total / df) * TERM_WEIGHT;
      score += weight;
      if (weight > strongest) {
        strongest = weight;
        shared = term;
      }
    }

    if (score > 0) hits.push({ fact: index.facts[i], shared, score });
  }

  hits.sort((a, b) => b.score - a.score || a.fact.factNumber - b.fact.factNumber);
  const best = hits.length > 0 ? hits[0].score : 0;
  return hits.filter((h) => h.score >= best * KEEP_RATIO).slice(0, LIMIT);
}
