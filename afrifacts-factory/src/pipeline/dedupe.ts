/**
 * Cutting 320 candidates down to something a person can actually read.
 *
 * The first full run produced 320 facts across ten documents, and the
 * founder's response was the correct one: nobody has the latitude to skim
 * 300 variants of the same thing. Most of that volume was not ten times
 * more knowledge, it was the same finding restated — three separate
 * "facts" about the Igbo-Ukwu beads, each quoting a neighbouring sentence.
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

import type { Candidate } from './extract';

export interface Culled {
  candidate: Candidate;
  reason: string;
}

export interface DedupeResult {
  kept: Candidate[];
  culled: Culled[];
}

const STOP = new Set([
  'the','a','an','and','or','but','of','in','on','at','to','for','from','by','with','as','is',
  'was','were','are','be','been','it','its','this','that','these','those','which','who','when',
  'where','while','has','have','had','not','also','than','then','there','their','they','he','she',
  'his','her','one','two','over','more','most','some','into','about','after','before','during',
  'between','under','around','through','up','down','out','all','only','other','such','no','can',
  'would','could','first','many','much','well','known','used','made','became','being','so','if',
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/** Overlap as a share of the smaller set, so a short fact inside a long one counts. */
function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/**
 * Shapes that are never interesting, recognised by pattern.
 *
 * Each of these was observed in a real run after the prompt explicitly
 * asked the model not to produce it. The model does not feel what is
 * boring, so the filter has to be mechanical rather than instructed.
 */
const BORING: { test: RegExp; reason: string }[] = [
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

function boringReason(fact: string): string | null {
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
 */
function richness(c: Candidate): number {
  const fact = c.fact;
  const digits = (fact.match(/\d/g) ?? []).length;
  const propers = (fact.match(/\b[A-Z][a-z]{2,}/g) ?? []).length;
  const length = fact.length;
  // Very short facts are usually vague; very long ones are usually lists.
  const shape = length > 60 && length < 220 ? 2 : 0;
  return digits * 1.5 + propers + shape;
}

/** Normalised passage, so trivial whitespace differences do not hide a match. */
function passageKey(c: Candidate): string {
  return c.passage.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Cull duplicates and junk.
 *
 * `perDocument` caps how many survive from any one source. Ten documents
 * yielding eight each is eighty candidates — a sitting's work, not a
 * week's. The cap is applied last so it keeps the best, not the first.
 */
export function dedupe(
  candidates: Candidate[],
  options: { perDocument?: number; similarity?: number } = {},
): DedupeResult {
  const perDocument = options.perDocument ?? 6;
  const similarity = options.similarity ?? 0.45;

  const culled: Culled[] = [];
  const surviving: Candidate[] = [];

  // Pass 1: boring shapes.
  for (const candidate of candidates) {
    const reason = boringReason(candidate.fact);
    if (reason) culled.push({ candidate, reason });
    else surviving.push(candidate);
  }

  // Pass 2: one fact per passage. Facts quoting the same sentence are
  // variants of a single fact, however differently they are worded.
  const byPassage = new Map<string, Candidate>();
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
  const kept: Candidate[] = [];
  const tokenCache = new Map<Candidate, Set<string>>();
  const tokensOf = (c: Candidate): Set<string> => {
    let t = tokenCache.get(c);
    if (!t) {
      t = tokens(c.fact);
      tokenCache.set(c, t);
    }
    return t;
  };

  for (const candidate of byPassage.values()) {
    const twin = kept.find(
      (other) => overlap(tokensOf(candidate), tokensOf(other)) >= similarity,
    );
    if (!twin) {
      kept.push(candidate);
      continue;
    }
    if (richness(candidate) > richness(twin)) {
      kept[kept.indexOf(twin)] = candidate;
      culled.push({ candidate: twin, reason: `Near-duplicate of a stronger fact from '${twin.slug}'.` });
    } else {
      culled.push({ candidate, reason: `Near-duplicate of a fact already kept from '${twin.slug}'.` });
    }
  }

  // Pass 4: the per-document cap, keeping the richest.
  const final: Candidate[] = [];
  const counts = new Map<string, number>();
  const ranked = [...kept].sort((a, b) => richness(b) - richness(a));

  for (const candidate of ranked) {
    const seen = counts.get(candidate.slug) ?? 0;
    if (seen >= perDocument) {
      culled.push({
        candidate,
        reason: `Over the cap of ${perDocument} from one document.`,
      });
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
