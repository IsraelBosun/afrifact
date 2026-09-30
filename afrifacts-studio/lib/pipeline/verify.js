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

/**
 * @typedef {object} VerifyResult
 * @property {boolean} ok
 * @property {string[]} reasons Why it failed, in the words a reviewer
 *   would want to read.
 * @property {number} offset Where the passage sits in the document, when
 *   it was found.
 */

/**
 * Normalise only what a copy-paste can legitimately change.
 *
 * Whitespace runs, curly quotes, and dash variants differ between what a
 * model emits and what is on the page without any claim being altered.
 * Letters, digits and word order are left exactly alone — normalising
 * those would be normalising away the thing we are checking.
 *
 * @param {string} text
 */
function normalise(text) {
  return text
    .replace(/[‘’ʼ′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check 1: is the passage actually in the document?
 *
 * @param {string} passage
 * @param {string} document
 * @returns {VerifyResult}
 */
export function passageInDocument(passage, document) {
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

/** @param {string} text */
function contentWords(text) {
  return normalise(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s.,-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.,-]+|[.,-]+$/g, ''))
    .filter((w) => w.length > 0 && !STOP.has(w));
}

/**
 * Anything a reader would check: a year, a figure, a measurement.
 * @param {string} text
 */
function numbers(text) {
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
 *
 * @param {string} fact
 * @param {string} passage
 * @returns {VerifyResult}
 */
export function factGroundedInPassage(fact, passage) {
  /** @type {string[]} */
  const reasons = [];
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
    /*
      Loose on purpose, and this threshold has been measured.

      At a third, this check was the largest single cause of rejection —
      38 of 67 rejects on the real corpus — and the facts it was killing
      were the best ones in the pile:

        "The Oba of Benin was considered divine, and it was punishable by
         death to say that he ate, slept, or washed."

        "The Chevrolet Volt, General Motors' first mass-market electric
         car, was designed by Jelani Aliyu, a Nigerian from Sokoto."

      Both are grounded. Both fail a word count, because a sentence
      compressed out of three sentences of source shares few of their
      words, and a good rewrite shares fewer than a bad one. The check
      was selecting against the thing the app is for: a sentence somebody
      wants to send to a friend.

      What actually protects credibility is the other two checks, and
      they stay exactly as strict. The passage must really be in the
      document, so a quote cannot be invented. Every number in the fact
      must be in the passage, so nothing checkable can be supplied from
      the model's memory — and a number is what a reader screenshots and
      what a challenger checks first.

      So this stays only as a backstop against a fact that has wandered
      off its passage entirely, which is what two thirds catches. It is
      no longer trying to make the sentence hug the source's wording.
    */
    if (ratio > 0.66) {
      reasons.push(
        `${stray.length} of ${factWords.length} significant words are not in the passage ` +
          `(${stray.slice(0, 8).join(', ')}). The fact has drifted off the quote entirely.`,
      );
    }
  }

  return { ok: reasons.length === 0, reasons, offset: -1 };
}

/**
 * Both checks, for one candidate.
 *
 * @param {string} fact
 * @param {string} passage
 * @param {string} document
 * @returns {VerifyResult}
 */
/**
 * The document's opening, as the one extra passage a fact may lean on.
 *
 * Agreed with the owner as a deliberate, narrow change to the rule that
 * a fact comes from one passage. The reason is introductions: a fact
 * about someone who is not a household name has to say who they are, and
 * that sentence is almost always the article's first ("Michael Ibru was
 * a Nigerian industrialist who founded the Ibru Organisation..."), far
 * from the passage with the surprising detail. Without it the fact either
 * assumes the reader knows the person or cannot be written honestly.
 *
 * It is only ever the OPENING of the SAME document, verbatim, and it is
 * stored as a second passage in the fact's provenance, so a reviewer
 * sees exactly what the claim leans on.
 *
 * @param {string} document
 */
export function leadOf(document) {
  const para = String(document ?? '').split(/\n+/).find((p) => p.trim().length > 0) ?? '';
  // Two sentences, split at a full stop that is not an abbreviation like
  // "c." or "St." ("born Aina or Ina; c. 1843" must not end a sentence).
  const ends = [];
  const re = /[.!?](?=\s+[A-Z(]|$)/g;
  let m;
  while ((m = re.exec(para)) !== null && ends.length < 2) {
    if (!/\b(c|ca|b|d|st|dr|mr|mrs|jr|sr|no|gen|col|capt|lt)$/i.test(para.slice(0, m.index))) {
      ends.push(m.index + 1);
    }
  }
  return (ends.length > 0 ? para.slice(0, ends[ends.length - 1]) : para).trim();
}

/**
 * Is the fact grounded in its passage, or in its passage plus the lead?
 *
 * The passage alone is tried first, so a fact that needs no introduction
 * is held to exactly the old standard. Only a fact that fails alone is
 * checked against the two together, and the numbers rule is unchanged:
 * every figure must appear verbatim in one of them.
 *
 * @param {string} fact
 * @param {string} passage
 * @param {string} [lead]
 */
export function groundedWithLead(fact, passage, lead) {
  const alone = factGroundedInPassage(fact, passage);
  if (alone.ok || !lead) return { ...alone, usedLead: false };
  const both = factGroundedInPassage(fact, `${passage} ${lead}`);
  return both.ok ? { ...both, usedLead: true } : { ...alone, usedLead: false };
}

export function verify(fact, passage, document) {
  const inDoc = passageInDocument(passage, document);
  const grounded = factGroundedInPassage(fact, passage);
  return {
    ok: inDoc.ok && grounded.ok,
    reasons: [...inDoc.reasons, ...grounded.reasons],
    offset: inDoc.offset,
  };
}
