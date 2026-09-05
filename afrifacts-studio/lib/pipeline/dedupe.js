/**
 * Cutting 320 candidates down to something a person can actually read.
 *
 * The first full run produced 320 facts across ten documents, and the
 * response to it was the correct one: nobody has the latitude to skim 300
 * variants of the same thing. Most of that volume was not ten times more
 * knowledge, it was the same finding restated — three separate "facts"
 * about the Igbo-Ukwu beads, each quoting a neighbouring sentence.
 *
 * Everything in this file is string work. No model. Two reasons: a model
 * asked to spot its own near-duplicates is unreliable at exactly the
 * moment it matters, and this has to run over hundreds of candidates
 * without costing a call each.
 *
 * Three passes, cheapest first:
 *   1. Boring shapes    — junk we can recognise by pattern.
 *   2. Same passage     — facts quoting the same sentence are one fact.
 *   3. Near-duplicates  — high word overlap, compared across every
 *                          document in the run, not within one.
 */

import { keyOf } from './candidate-key.js';

/**
 * @typedef {object} Culled
 * @property {import('./extract.js').Candidate} candidate
 * @property {string} reason
 */

/**
 * @typedef {object} DedupeResult
 * @property {import('./extract.js').Candidate[]} kept
 * @property {Culled[]} culled
 */

const STOP = new Set([
  'the','a','an','and','or','but','of','in','on','at','to','for','from','by','with','as','is',
  'was','were','are','be','been','it','its','this','that','these','those','which','who','when',
  'where','while','has','have','had','not','also','than','then','there','their','they','he','she',
  'his','her','one','two','over','more','most','some','into','about','after','before','during',
  'between','under','around','through','up','down','out','all','only','other','such','no','can',
  'would','could','first','many','much','well','known','used','made','became','being','so','if',
]);

/** @param {string} text */
function tokens(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/**
 * Overlap as a share of the smaller set, so a short fact inside a long one counts.
 * @param {Set<string>} a
 * @param {Set<string>} b
 */
function overlap(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/** Ordinary inflection, so 'cousins' does not read as new beside 'cousin'. */
const stem = (word) => word.replace(/(ing|ed|es|s)$/, '');

/**
 * What this candidate says that the thing it resembles does not.
 *
 * The question `overlap` cannot answer. Two sentences can share
 * two-thirds of their words and differ by the only word that matters —
 * measured on the real corpus, a candidate reading "Dolapo Osinbajo is a
 * granddaughter of Obafemi Awolowo, and her husband's family are Awolowo
 * cousins" was culled at 0.67 against a corpus fact saying the
 * granddaughter half alone. The cousins were the fact. Overlap saw a
 * duplicate because a duplicate is what most of the sentence was.
 *
 * Compared against the twin's PASSAGE as well as its text: a corpus fact
 * is one sentence written from several, and a word it did not use but
 * its source did is not new information, just a different edit of the
 * same evidence.
 *
 * @param {string} text
 * @param {Set<string>} knownWords
 * @param {Set<string>} knownNumbers
 * @returns {string[]}
 */
function whatItAdds(text, knownWords, knownNumbers) {
  const known = new Set([...knownWords].map(stem));
  const added = [];

  for (const word of tokens(text)) {
    if (knownWords.has(word) || known.has(stem(word))) continue;
    added.push(word);
  }
  for (const number of (text.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[.,]+$/, ''))) {
    const bare = number.replace(/[,.]/g, '');
    if (![...knownNumbers].some((k) => k.replace(/[,.]/g, '') === bare)) added.push(number);
  }

  // A year is caught twice — once as a token, once as a number — and
  // "adds: 1989, 1989" reads like a bug to whoever is judging the fact.
  return [...new Set(added)];
}

/**
 * Shapes that are never interesting, recognised by pattern.
 *
 * Each of these was observed in a real run after the prompt explicitly
 * asked the model not to produce it. The model does not feel what is
 * boring, so the filter has to be mechanical rather than instructed.
 *
 * @type {{ test: RegExp, reason: string }[]}
 */
const BORING = [
  {
    test: /\b(resumed|conducted|led|directed|undertaken|carried out)\b.{0,60}\b(under|by)\b.{0,40}\b(archaeologist|researcher|professor|dr|scholar|team)\b/i,
    reason: 'Who did the fieldwork. Administrative, not surprising.',
  },
  {
    test: /\b(university|institute|foundation|council|department|society|association|commission|ministry of)\b.{0,80}\b(cooperation|partnership|collaboration|in association|work on|works on)\b/i,
    reason: 'Institutional partnership. Nobody sends this to a friend.',
  },
  {
    test: /\b(demonstrat\w+|show\w*|indicat\w+|suggest\w+|reveal\w+|document\w+|confirm\w+|highlight\w+)\b.{0,70}\b(significance|importance|complexity|sophistication|participation|specialisation|specialization)\b/i,
    reason: "A historian's conclusion about significance, not a fact.",
  },
  {
    test: /\b(is |was |remains |considered |regarded )?\w*\s?(particularly |especially |highly )?(significant|important|notable|remarkable|noteworthy)\b(?!.*\d)/i,
    reason: 'Asserts importance without giving the thing that is important.',
  },
  {
    test: /\b\d+\s+(administrative\s+)?(wards|local government areas|lgas|districts|subdivisions)\b/i,
    reason: 'Administrative subdivision counts. True and inert.',
  },
  {
    test: /\b(comprises|consists of|is divided into|is made up of|is bordered by|is located in|is situated in)\b/i,
    reason: 'Gazetteer description. Reference-book filler.',
  },
  {
    test: /\b(festival|ceremony|celebration)\b.{0,50}\b(centers?|centres?|focuses)\s+on\b/i,
    reason: 'A festival described in the abstract, with nothing specific in it.',
  },
  {
    test: /\b(publications?|study|studies|paper|article|research|analysis|excavations?)\b.{0,40}\b(published|issued|appeared|released)\b.{0,30}\bin\s+(19|20)\d\d\b(?!.*\b(found|showed that|revealed that)\b)/i,
    reason: 'When a study was published, with no finding in it.',
  },
  {
    test: /\bnamed\s+(igbo\s+\w+,?\s*){2,}/i,
    reason: 'A list of site names. A catalogue, not a fact.',
  },
];

/**
 * @param {string} fact
 * @returns {string | null}
 */
function boringReason(fact) {
  for (const { test, reason } of BORING) {
    if (test.test(fact)) return reason;
  }
  return null;
}

/**
 * A rough score for which of two near-identical facts to keep.
 *
 * Prefers concrete detail — numbers, proper nouns, a reasonable length —
 * because that is what separates "more than 150,000 beads, some made in
 * Egypt" from "many beads were found". Deliberately crude: it only ever
 * chooses between candidates that already say the same thing.
 *
 * @param {import('./extract.js').Candidate} c
 */
function richness(c) {
  const fact = c.fact;
  const digits = (fact.match(/\d/g) ?? []).length;
  const propers = (fact.match(/\b[A-Z][a-z]{2,}/g) ?? []).length;
  const length = fact.length;
  // Very short facts are usually vague; very long ones are usually lists.
  const shape = length > 60 && length < 220 ? 2 : 0;
  return digits * 1.5 + propers + shape;
}

/**
 * Normalised passage, so trivial whitespace differences do not hide a match.
 * @param {import('./extract.js').Candidate} c
 */
function passageKey(c) {
  return c.passage.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Cull duplicates and junk.
 *
 * `perDocument` caps how many survive from any one source. Ten documents
 * yielding eight each is eighty candidates — a sitting's work, not a
 * week's. The cap is applied last so it keeps the best, not the first.
 *
 * @param {import('./extract.js').Candidate[]} candidates
 * @param {{ perDocument?: number, similarity?: number }} [options]
 * @returns {DedupeResult}
 */
export function dedupe(candidates, options = {}) {
  const perDocument = options.perDocument ?? 6;
  const similarity = options.similarity ?? 0.45;

  /** @type {Culled[]} */
  const culled = [];
  /** @type {import('./extract.js').Candidate[]} */
  const surviving = [];

  // Pass 1: boring shapes.
  for (const candidate of candidates) {
    const reason = boringReason(candidate.fact);
    if (reason) culled.push({ candidate, reason });
    else surviving.push(candidate);
  }

  // Pass 2: one fact per passage. Facts quoting the same sentence are
  // variants of a single fact, however differently they are worded.
  const byPassage = new Map();
  for (const candidate of surviving) {
    const key = passageKey(candidate);
    const held = byPassage.get(key);
    if (!held) {
      byPassage.set(key, candidate);
      continue;
    }
    const [keep, drop] =
      richness(candidate) > richness(held) ? [candidate, held] : [held, candidate];
    byPassage.set(key, keep);
    culled.push({ candidate: drop, reason: 'Same passage as a fact already kept.' });
  }

  // Pass 3: near-duplicates across different passages.
  //
  // Compared across the WHOLE run, not within one document. Related pages
  // overlap heavily — Fela, Funmilayo Ransome-Kuti and Soyinka all carry
  // the same family, so the same fact arrives three times wearing three
  // slugs. Within-document comparison cannot see that, and it is the
  // duplication a reader actually notices.
  //
  // The cost: two independent sources saying the same thing is
  // corroboration, and this throws one away. That is the right trade here
  // because the survivor keeps its own passage and citation, and a second
  // source is recoverable later from the article's footnotes. A reader
  // scrolling the same fact twice is not recoverable.
  /** @type {import('./extract.js').Candidate[]} */
  const kept = [];
  const tokenCache = new Map();
  /** @param {import('./extract.js').Candidate} c */
  const tokensOf = (c) => {
    let t = tokenCache.get(c);
    if (!t) {
      t = tokens(c.fact);
      tokenCache.set(c, t);
    }
    return t;
  };

  for (const candidate of byPassage.values()) {
    const twin = kept.find((other) => overlap(tokensOf(candidate), tokensOf(other)) >= similarity);
    if (!twin) {
      kept.push(candidate);
      continue;
    }
    if (richness(candidate) > richness(twin)) {
      kept[kept.indexOf(twin)] = candidate;
      culled.push({
        candidate: twin,
        reason: `Near-duplicate of a stronger fact from '${twin.slug}'.`,
      });
    } else {
      culled.push({
        candidate,
        reason: `Near-duplicate of a fact already kept from '${twin.slug}'.`,
      });
    }
  }

  // Pass 4: the per-document cap, keeping the richest.
  /** @type {import('./extract.js').Candidate[]} */
  const final = [];
  const counts = new Map();
  const ranked = [...kept].sort((a, b) => richness(b) - richness(a));

  for (const candidate of ranked) {
    const seen = counts.get(candidate.slug) ?? 0;
    if (seen >= perDocument) {
      culled.push({ candidate, reason: `Over the cap of ${perDocument} from one document.` });
      continue;
    }
    counts.set(candidate.slug, seen + 1);
    final.push(candidate);
  }

  // Restore input order so triage reads in document order, not score order.
  const order = new Map(candidates.map((c, i) => [c, i]));
  final.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));

  return { kept: final, culled };
}

/**
 * Cull candidates the corpus already has.
 *
 * `dedupe` above compares a run against itself, which was the whole story
 * while there was one run. It is not the story at 131 facts: re-extracting
 * a document the pipeline has already been through returns the same
 * findings, they pass the verifier exactly as they did the first time, and
 * they arrive in triage looking new. The reviewer then re-reads work they
 * already did, and anything they keep is enriched into a SECOND fact with
 * a different id saying the same thing.
 *
 * Three ways a candidate is recognised as already done, strongest first:
 *
 *   1. Lineage. The store records the `candidateKey` a fact was promoted
 *      from. An exact match is not a similarity judgement at all — this
 *      candidate literally became that fact.
 *   2. Same passage. A corpus fact quoting the same sentence is the same
 *      fact however differently it is worded, which is pass 2's argument
 *      applied across runs instead of within one.
 *   3. Word overlap, the same measure and threshold as pass 3.
 *
 * Every cull names the fact id it collided with, because "already in the
 * corpus" and "the model found nothing" produce an identical empty triage
 * page, and those need to be told apart at a glance.
 *
 * This does NOT compare against queued facts. Holding a fact back is a
 * decision that it should not be in the app; it is not a decision that the
 * subject may never be written about again, and a held fact silently
 * blocking its own replacement would be very hard to diagnose.
 *
 * @param {import('./extract.js').Candidate[]} candidates
 * @param {import('../studio/facts.js').StoredFact[]} corpus
 * @param {{ similarity?: number }} [options]
 * @returns {DedupeResult}
 */
export function dedupeAgainstCorpus(candidates, corpus, options = {}) {
  const similarity = options.similarity ?? 0.45;

  const live = corpus.filter((entry) => entry?.record?.queued !== true);

  /** @type {Map<string, string>} candidateKey -> fact id */
  const byLineage = new Map();
  /** @type {Map<string, string>} normalised passage -> fact id */
  const byPassage = new Map();
  /** @type {{ id: string, tokens: Set<string>, known: Set<string>, numbers: Set<string> }[]} */
  const byTokens = [];

  for (const entry of live) {
    const id = entry?.fact?.id;
    if (typeof id !== 'string') continue;

    const key = entry.record?.candidateKey;
    if (typeof key === 'string' && key.length > 0 && !byLineage.has(key)) {
      byLineage.set(key, id);
    }

    // Everything this fact and its evidence between them already say. The
    // fact alone is too small a target: it is one sentence written from
    // several, so a word it happened not to use is not news.
    const passages = [];
    for (const source of entry.provenance?.sources ?? []) {
      const passage = typeof source?.passage === 'string' ? source.passage : '';
      if (passage.length === 0) continue;
      passages.push(passage);
      const normalised = passage.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!byPassage.has(normalised)) byPassage.set(normalised, id);
    }

    if (typeof entry.fact?.fact === 'string') {
      const whole = `${entry.fact.fact} ${passages.join(' ')}`;
      byTokens.push({
        id,
        tokens: tokens(entry.fact.fact),
        known: tokens(whole),
        numbers: new Set(
          (whole.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[.,]+$/, '')),
        ),
      });
    }
  }

  /** @type {import('./extract.js').Candidate[]} */
  const kept = [];
  /** @type {Culled[]} */
  const culled = [];

  for (const candidate of candidates) {
    const lineage = byLineage.get(keyOf(candidate));
    if (lineage) {
      culled.push({ candidate, reason: `Already enriched into ${lineage}.` });
      continue;
    }

    const passage = byPassage.get(passageKey(candidate));
    if (passage) {
      culled.push({ candidate, reason: `${passage} already quotes this passage.` });
      continue;
    }

    const mine = tokens(candidate.fact);
    const twin = byTokens.find((other) => overlap(mine, other.tokens) >= similarity);
    if (twin) {
      /*
        Resembling a fact is not the same as repeating it.

        This used to cull here, unconditionally, and that was the worst
        bug in the pipeline: it deleted the RICHER of two overlapping
        facts whenever the thinner one arrived first, silently, with the
        extra claim inside it. The corpus therefore grew toward whichever
        version of each fact it happened to see first — and since
        Wikipedia was always the first source, the extra thing a
        newspaper knew was systematically the thing thrown away.

        Its sibling `dedupe` above never had this problem: when two
        candidates collide within a run it compares `richness` and keeps
        the better one. It could do that because both were unpublished.
        Here the twin is a live fact with a factNumber printed on share
        cards, so it cannot be replaced — which leaves keeping both or
        losing one, and losing one has to be earned.

        So the cull now requires the candidate to add NOTHING: not a
        word, not a number, beyond what the twin and its own passage
        already say. Anything else survives and carries what it adds, for
        a person to judge in review.

        This deliberately errs toward keeping. A wrong keep costs one row
        somebody bins in two seconds. A wrong cull deletes a fact
        permanently and says nothing, and there is no page anywhere that
        shows you what you never saw.
      */
      const adds = whatItAdds(candidate.fact, twin.known, twin.numbers);
      if (adds.length === 0) {
        culled.push({ candidate, reason: `Says nothing ${twin.id} does not already say.` });
        continue;
      }
      kept.push({
        ...candidate,
        echoes: { id: twin.id, adds },
      });
      continue;
    }

    kept.push(candidate);
  }

  return { kept, culled };
}
