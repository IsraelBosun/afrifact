/**
 * Stage 3: check the model did not make it up.
 *
 * There is no model in this file, and that is the entire point. Asking a
 * model whether a model hallucinated is asking the same faculty that
 * produced the error to detect it. These are string operations, so they
 * are as reliable on the ten thousandth fact as on the first.
 *
 * Two checks, and they catch different failures:
 *
 *   1. The passage is really in the document. Catches a fabricated quote.
 *   2. Every specific claim in the fact is really in the passage. Catches
 *      the commoner failure — a real quote with the model's own knowledge
 *      welded onto it. In testing, a model quoting a passage about iron
 *      smelting at 550 BC wrote a fact adding "remarkably early for
 *      Sub-Saharan Africa", which is nowhere in the passage. Probably
 *      true. Not extracted. That distinction is the whole standard.
 */

export interface VerifyResult {
  ok: boolean;
  /** Why it failed, in the words a reviewer would want to read. */
  reasons: string[];
  /** Where the passage sits in the document, when it was found. */
  offset: number;
}

/**
 * Normalise only what a copy-paste can legitimately change.
 *
 * Whitespace runs, curly quotes, and dash variants differ between what a
 * model emits and what is on the page without any claim being altered.
 * Letters, digits and word order are left exactly alone — normalising
 * those would be normalising away the thing we are checking.
 */
function normalise(text: string): string {
  return text
    .replace(/[\u2018\u2019\u02BC\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Check 1: is the passage actually in the document? */
export function passageInDocument(passage: string, document: string): VerifyResult {
  const needle = normalise(passage);
  const hay = normalise(document);

  if (needle.length < 40) {
    return { ok: false, reasons: ['Passage is too short to be evidence of anything.'], offset: -1 };
  }
  const offset = hay.indexOf(needle);
  if (offset === -1) {
    return {
      ok: false,
      reasons: ['Passage is not in the source document. The model retyped or invented it.'],
      offset: -1,
    };
  }
  return { ok: true, reasons: [], offset };
}

/** Words too common to mean anything if they match. */
const STOP = new Set([
  'the','a','an','and','or','but','of','in','on','at','to','for','from','by','with','as','is',
  'was','were','are','be','been','it','its','this','that','these','those','which','who','when',
  'where','while','has','have','had','not','also','than','then','there','their','they','he','she',
  'his','her','one','two','over','more','most','some','into','about','after','before','during',
  'between','under','around','through','up','down','out','all','only','other','such','no','can',
  'would','could','first','many','much','well','known','used','made','became','being','so','if',
]);

function contentWords(text: string): string[] {
  return normalise(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s.,-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.,-]+|[.,-]+$/g, ''))
    .filter((w) => w.length > 0 && !STOP.has(w));
}

/** Anything a reader would check: a year, a figure, a measurement. */
function numbers(text: string): string[] {
  const found = normalise(text).match(/\d[\d,.]*/g) ?? [];
  return found.map((n) => n.replace(/[.,]+$/, ''));
}

/**
 * Check 2: does the fact claim anything the passage does not say?
 *
 * Deliberately asymmetric. A number in the fact that is absent from the
 * passage is an error — numbers are the checkable part, and a wrong one
 * is the screenshot that costs the app its credibility. Unmatched words
 * are scored rather than banned, because a fact is a rewrite of the
 * passage and some rephrasing is legitimate; too many of them means the
 * model wrote from memory rather than from the page.
 */
export function factGroundedInPassage(fact: string, passage: string): VerifyResult {
  const reasons: string[] = [];
  const passWords = new Set(contentWords(passage));
  const passNums = new Set(numbers(passage));

  const strayNums = numbers(fact).filter((n) => {
    if (passNums.has(n)) return false;
    // '1,500' in the fact against '1500' in the passage is the same claim.
    const bare = n.replace(/[,.]/g, '');
    return ![...passNums].some((p) => p.replace(/[,.]/g, '') === bare);
  });
  if (strayNums.length > 0) {
    reasons.push(
      `Fact states ${strayNums.map((n) => `'${n}'`).join(', ')}, which the passage does not.`,
    );
  }

  const factWords = contentWords(fact);
  const stray = factWords.filter((w) => {
    if (passWords.has(w)) return false;
    // Allow ordinary inflection: 'walls' against 'wall', 'built' against 'build'.
    const stem = w.replace(/(ing|ed|es|s)$/, '');
    return ![...passWords].some((p) => p === stem || p.replace(/(ing|ed|es|s)$/, '') === stem);
  });

  if (factWords.length > 0) {
    const ratio = stray.length / factWords.length;
    // A third is generous for a rewrite and still catches a fact whose
    // subject matter has drifted off the passage entirely.
    if (ratio > 0.34) {
      reasons.push(
        `${stray.length} of ${factWords.length} significant words are not in the passage ` +
          `(${stray.slice(0, 8).join(', ')}). The fact is not a restatement of the quote.`,
      );
    }
  }

  return { ok: reasons.length === 0, reasons, offset: -1 };
}

/**
 * Check the enrichment did not invent a figure.
 *
 * The deep dive is prose a model wrote, and the extraction verifier never
 * sees it. Measured on the first real run: 7 of 131 deep dives contained
 * a number that appears nowhere in the source document — an Academy
 * founded in 1780, an excavation dated 1959, a visit in 2016. All
 * plausible, all probably true, none of them extracted. That is precisely
 * the failure the standard exists to stop, so it is checked rather than
 * trusted.
 *
 * Only numbers are checked, not words. Prose legitimately rephrases and
 * connects; a figure is either in the source or it was supplied from
 * somewhere else. Numbers are also what a reader screenshots and what a
 * challenger checks first.
 */
export function proseGroundedInDocument(prose: string, document: string): VerifyResult {
  const docNumbers = new Set(
    (normalise(document).match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]+$/, '').replace(/,/g, '')),
  );

  const stray = (normalise(prose).match(/\d[\d,.]*/g) ?? [])
    .map((n) => n.replace(/[,.]+$/, ''))
    .filter((n) => {
      const bare = n.replace(/,/g, '');
      if (docNumbers.has(bare)) return false;
      // Ordinals and small counts are usually the model doing arithmetic
      // the reader can follow ("the 23rd child" implies 22 before it),
      // not a claim of its own.
      return Number(bare) > 100;
    });

  if (stray.length === 0) return { ok: true, reasons: [], offset: -1 };

  return {
    ok: false,
    reasons: [
      `Deep dive states ${stray.map((n) => `'${n}'`).join(', ')}, which appears nowhere in the source document.`,
    ],
    offset: -1,
  };
}

/** Both checks, for one candidate. */
export function verify(fact: string, passage: string, document: string): VerifyResult {
  const inDoc = passageInDocument(passage, document);
  const grounded = factGroundedInPassage(fact, passage);
  return {
    ok: inDoc.ok && grounded.ok,
    reasons: [...inDoc.reasons, ...grounded.reasons],
    offset: inDoc.offset,
  };
}
