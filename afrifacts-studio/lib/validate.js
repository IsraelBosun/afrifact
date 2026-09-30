/**
 * The standard, enforced.
 *
 * This file carries more weight here than it did in the TypeScript
 * version. There, the compiler stopped a field from being the wrong shape
 * and this file only had to catch what a type cannot express: an empty
 * passage, a URL as the only locator, a surprise score below the bar. In
 * JavaScript nothing stops the shape errors, so the shape checks moved in
 * here too — see `checkShape`. Together they make the rules in CLAUDE.md
 * §10 checkable rather than aspirational.
 *
 * Manually written facts and pipeline facts run through the same
 * function. Same standard, different door.
 */

import { CATEGORIES } from './types/fact.js';
import {
  REVIEW_STATUSES,
  SOURCE_TIERS,
  SURPRISE_AXES,
  SURPRISE_THRESHOLD,
  TIERS_NEEDING_CORROBORATION,
} from './types/provenance.js';

/**
 * @typedef {object} Problem
 * @property {string} factId
 * @property {'error' | 'warning'} level 'error' blocks publication.
 *   'warning' wants a human to look.
 * @property {string} field
 * @property {string} message
 */

/**
 * Placeholder text is not a value.
 *
 * A half-written entry is more dangerous than an empty one: it looks
 * complete, so it passes a glance. Checking only for empty strings let a
 * fact whose passage read 'TODO: quote the source' through with no
 * errors, which is exactly the failure this whole file exists to stop.
 */
const PLACEHOLDER = /^\s*(todo|tbd|fixme|xxx|placeholder|\.\.\.|-)\b/i;

/**
 * The longest fact a card can hold.
 *
 * The photo card grows its text panel to fit and shrinks the photo to
 * make room; past this there is no room left and the buttons are pushed
 * off the card (seen on a 350-character fact). An error, not a warning,
 * so it blocks publishing: a card with no buttons is a broken card.
 */
export const MAX_FACT_CHARS = 200;

/** @param {unknown} value */
function isFilledIn(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER.test(trimmed);
}

/** A locator is stable if it survives a website redesign. */
function hasStableLocator(locator) {
  return Boolean(
    isFilledIn(locator?.doi) || isFilledIn(locator?.isbn) || isFilledIn(locator?.archiveRef),
  );
}

/** @returns {Problem} */
function problem(factId, level, field, message) {
  return { factId, level, field, message };
}

/**
 * The checks TypeScript used to make.
 *
 * Every one of these was a compile error before the move to JavaScript.
 * They are not defensive paranoia: enriched facts are written by a model
 * and read back from disk as JSON, so a missing field or a category the
 * model invented arrives as data, not as a syntax error anyone notices.
 *
 * Structural failures return false, because a fact with no `deepDive`
 * object would otherwise throw rather than report.
 *
 * @param {any} fact
 * @param {Problem[]} problems
 * @returns {boolean} false if the fact is too malformed to check further.
 */
function checkShape(fact, problems) {
  const id = typeof fact?.id === 'string' && fact.id.length > 0 ? fact.id : '(no id)';

  if (!fact || typeof fact !== 'object') {
    problems.push(problem(id, 'error', 'fact', 'Fact is not an object.'));
    return false;
  }

  if (!isFilledIn(fact.id)) {
    problems.push(problem(id, 'error', 'id', 'Fact has no id.'));
  }

  if (typeof fact.fact === 'string' && fact.fact.length > MAX_FACT_CHARS) {
    problems.push(
      problem(
        id,
        'error',
        'fact',
        `Fact is ${fact.fact.length} characters; the card holds ${MAX_FACT_CHARS}. Shorten it (npm run shorten).`,
      ),
    );
  }

  if (!CATEGORIES.includes(fact.category)) {
    problems.push(
      problem(
        id,
        'error',
        'category',
        `Category '${fact.category}' is not one of ${CATEGORIES.join(', ')}.`,
      ),
    );
  }

  if (!Number.isInteger(fact.factNumber) || fact.factNumber < 1) {
    problems.push(
      problem(
        id,
        'error',
        'factNumber',
        `Fact number '${fact.factNumber}' is not a positive integer.`,
      ),
    );
  }

  if (!Array.isArray(fact.relatedIds)) {
    problems.push(problem(id, 'error', 'relatedIds', 'relatedIds is not an array.'));
  }

  if (!fact.source || typeof fact.source !== 'object') {
    problems.push(problem(id, 'error', 'source', 'Fact has no source object. No source, no ship.'));
    return false;
  }

  if (!fact.deepDive || typeof fact.deepDive !== 'object') {
    problems.push(problem(id, 'error', 'deepDive', 'Fact has no deep dive.'));
    return false;
  }

  if (!Array.isArray(fact.deepDive.body)) {
    problems.push(
      problem(id, 'error', 'deepDive.body', 'Deep dive body is not an array of paragraphs.'),
    );
    return false;
  }

  if (!Number.isFinite(fact.deepDive.readTime) || fact.deepDive.readTime <= 0) {
    problems.push(
      problem(
        id,
        'error',
        'deepDive.readTime',
        `Read time '${fact.deepDive.readTime}' is not a positive number.`,
      ),
    );
  }

  // `image` is nullable rather than optional on purpose, so every card
  // component has to decide which variant it renders. `undefined` means
  // somebody forgot the field rather than decided there was no photo.
  if (fact.image === undefined) {
    problems.push(
      problem(id, 'error', 'image', 'Image is undefined. Use null to say the fact has no photograph.'),
    );
  }

  return true;
}

/**
 * @param {import('./types/fact.js').Fact} fact
 * @param {Problem[]} problems
 */
function checkFact(fact, problems) {
  const id = fact.id;

  if (!isFilledIn(fact.fact)) {
    problems.push(problem(id, 'error', 'fact', 'Fact text is empty or still a placeholder.'));
  }

  // Never hardcode Nigeria: country is a data value, so it just has to be
  // present and plausible, not equal to anything in particular.
  if (typeof fact.country !== 'string' || !/^[A-Z]{2,3}$/.test(fact.country)) {
    problems.push(
      problem(
        id,
        'error',
        'country',
        `Country '${fact.country}' is not an ISO alpha-2 code or 'AFR'.`,
      ),
    );
  }

  if (!isFilledIn(fact.source.name) || !isFilledIn(fact.source.url)) {
    problems.push(
      problem(
        id,
        'error',
        'source',
        'Every fact must carry a source name and URL. No source, no ship.',
      ),
    );
  }

  // A photo credit is a licence requirement, not a nicety.
  if (fact.image) {
    if (!isFilledIn(fact.image.url)) {
      problems.push(problem(id, 'error', 'image.url', 'Image has no URL.'));
    }
    if (!isFilledIn(fact.image.credit)) {
      problems.push(
        problem(
          id,
          'error',
          'image.credit',
          'Image has no credit. Dropping a credit breaks the licence.',
        ),
      );
    }
    if (!isFilledIn(fact.image.license)) {
      problems.push(problem(id, 'error', 'image.license', 'Image has no licence recorded.'));
    }
    if (!isFilledIn(fact.image.panelColor)) {
      problems.push(
        problem(id, 'error', 'image.panelColor', 'Image has no panel colour for the photo card.'),
      );
    }
  }

  if (!isFilledIn(fact.deepDive.whyItMatters)) {
    problems.push(
      problem(
        id,
        'error',
        'deepDive.whyItMatters',
        'Why it matters is the signature block of every deep dive.',
      ),
    );
  }

  if (fact.deepDive.body.length === 0) {
    problems.push(problem(id, 'error', 'deepDive.body', 'Deep dive has no body paragraphs.'));
  }
}

/**
 * @param {any} prov
 * @param {Problem[]} problems
 * @param {string} factId Used when the provenance itself is malformed.
 */
function checkProvenance(prov, problems, factId) {
  if (!prov || typeof prov !== 'object') {
    problems.push(problem(factId, 'error', 'provenance', 'No provenance record.'));
    return;
  }

  const id = isFilledIn(prov.factId) ? prov.factId : factId;

  if (!Array.isArray(prov.sources)) {
    problems.push(problem(id, 'error', 'sources', 'Sources is not an array.'));
    return;
  }

  if (prov.sources.length === 0) {
    problems.push(
      problem(id, 'error', 'sources', 'No source recorded. A fact without a source does not ship.'),
    );
  }

  prov.sources.forEach((source, i) => {
    const at = `sources[${i}]`;

    // The rule the whole pipeline rests on: extracted, never remembered.
    if (!isFilledIn(source?.passage)) {
      problems.push(
        problem(
          id,
          'error',
          `${at}.passage`,
          'No usable passage. The fact must be extracted from source text, quoted verbatim — a placeholder does not count.',
        ),
      );
    }

    if (!SOURCE_TIERS.includes(source?.tier)) {
      problems.push(
        problem(
          id,
          'error',
          `${at}.tier`,
          `Tier '${source?.tier}' is not one of ${SOURCE_TIERS.join(', ')}.`,
        ),
      );
    }

    if (!hasStableLocator(source?.locator)) {
      const hasUrl = isFilledIn(source?.locator?.url);
      problems.push(
        problem(
          id,
          hasUrl ? 'warning' : 'error',
          `${at}.locator`,
          hasUrl
            ? 'Only a URL to go on. URLs rot — add a DOI, ISBN or archive reference.'
            : 'No locator at all. Nobody else can find this passage.',
        ),
      );
    }

    if (!isFilledIn(source?.citation)) {
      problems.push(problem(id, 'error', `${at}.citation`, 'No citation.'));
    }
  });

  // Press reports what was claimed as much as what happened; reference
  // works are aggregation. Neither carries a fact alone.
  const weak = prov.sources.filter((s) => TIERS_NEEDING_CORROBORATION.includes(s?.tier));
  if (prov.sources.length > 0 && weak.length === prov.sources.length) {
    problems.push(
      problem(
        id,
        'warning',
        'sources',
        `Rests only on ${weak.map((s) => s.tier).join(', ')}. Wants a second, independent source.`,
      ),
    );
  }

  if (!prov.surprise || typeof prov.surprise !== 'object') {
    problems.push(problem(id, 'error', 'surprise', 'No surprise score.'));
  } else {
    for (const axis of SURPRISE_AXES) {
      const score = prov.surprise[axis];
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        problems.push(
          problem(id, 'error', `surprise.${axis}`, `Score '${score}' on ${axis} is not 1-5.`),
        );
      } else if (score < SURPRISE_THRESHOLD) {
        problems.push(
          problem(
            id,
            'error',
            `surprise.${axis}`,
            `Scores ${score} on ${axis}, below the bar of ${SURPRISE_THRESHOLD}.`,
          ),
        );
      }
    }
  }

  if (!prov.review || typeof prov.review !== 'object') {
    problems.push(problem(id, 'error', 'review', 'No review record. Nothing goes live unreviewed.'));
  } else {
    if (!REVIEW_STATUSES.includes(prov.review.status)) {
      problems.push(
        problem(
          id,
          'error',
          'review.status',
          `Status '${prov.review.status}' is not one of ${REVIEW_STATUSES.join(', ')}.`,
        ),
      );
    }

    // Nothing goes live unreviewed.
    if (prov.review.status === 'approved' && !isFilledIn(prov.review.reviewer)) {
      problems.push(
        problem(
          id,
          'error',
          'review.reviewer',
          'Approved but no reviewer named. An approval must be attributable.',
        ),
      );
    }

    if (prov.review.status !== 'approved' && !isFilledIn(prov.review.notes)) {
      problems.push(
        problem(
          id,
          'warning',
          'review.notes',
          `Status is '${prov.review.status}' with no note saying why.`,
        ),
      );
    }
  }

  if (!prov.decay || typeof prov.decay !== 'object') {
    problems.push(
      problem(id, 'error', 'decay', 'No decay record. Say whether the fact is permanent or volatile.'),
    );
  } else {
    if (prov.decay.kind !== 'permanent' && prov.decay.kind !== 'volatile') {
      problems.push(
        problem(
          id,
          'error',
          'decay.kind',
          `Decay kind '${prov.decay.kind}' is not permanent or volatile.`,
        ),
      );
    }
    if (prov.decay.kind === 'volatile' && !isFilledIn(prov.decay.reviewBy)) {
      problems.push(
        problem(id, 'error', 'decay.reviewBy', 'Volatile facts need a date to be checked again.'),
      );
    }
  }
}

/**
 * Check one fact and its evidence.
 *
 * @param {import('./types/provenance.js').SourcedFact} entry
 * @returns {Problem[]}
 */
export function validate(entry) {
  /** @type {Problem[]} */
  const problems = [];

  if (!entry || typeof entry !== 'object' || !entry.fact) {
    problems.push(problem('(unknown)', 'error', 'entry', 'Entry has no fact.'));
    return problems;
  }

  const factId = typeof entry.fact.id === 'string' ? entry.fact.id : '(no id)';

  if (entry.fact.id !== entry.provenance?.factId) {
    problems.push(
      problem(
        factId,
        'error',
        'provenance.factId',
        `Provenance points at '${entry.provenance?.factId}' but the fact is '${entry.fact.id}'.`,
      ),
    );
  }

  if (checkShape(entry.fact, problems)) {
    checkFact(entry.fact, problems);
  }
  checkProvenance(entry.provenance, problems, factId);
  return problems;
}

/**
 * Check a corpus, including cross-fact rules.
 *
 * @param {import('./types/provenance.js').SourcedFact[]} entries
 * @returns {Problem[]}
 */
export function validateCorpus(entries) {
  const problems = entries.flatMap(validate);

  const seenIds = new Set();
  const seenNumbers = new Map();

  for (const { fact } of entries) {
    if (seenIds.has(fact.id)) {
      problems.push(problem(fact.id, 'error', 'id', `Duplicate id '${fact.id}'.`));
    }
    seenIds.add(fact.id);

    const heldBy = seenNumbers.get(fact.factNumber);
    if (heldBy) {
      problems.push(
        problem(
          fact.id,
          'error',
          'factNumber',
          `Fact number ${fact.factNumber} already used by '${heldBy}'.`,
        ),
      );
    } else {
      seenNumbers.set(fact.factNumber, fact.id);
    }
  }

  // relatedIds must point at facts that exist, or the deep dive dead-ends.
  for (const { fact } of entries) {
    if (!Array.isArray(fact.relatedIds)) continue;
    for (const related of fact.relatedIds) {
      if (!seenIds.has(related)) {
        problems.push(
          problem(
            fact.id,
            'warning',
            'relatedIds',
            `Points at '${related}', which is not in the corpus.`,
          ),
        );
      }
    }
  }

  return problems;
}

/**
 * Only approved, error-free facts that are not held back are publishable.
 *
 * Holding back is checked here rather than at each call site because every
 * publish path already funnels through this one function — check, export,
 * and anything added later. A held fact that slipped past one of them
 * would reappear in the app after being pulled.
 *
 * @param {import('./types/provenance.js').SourcedFact} entry
 * @returns {boolean}
 */
export function isPublishable(entry) {
  // Held back. Whether because the fact is wrong or merely early is a
  // question for its history; either way it is not in front of readers.
  if (entry?.record?.queued === true) return false;
  if (entry?.provenance?.review?.status !== 'approved') return false;
  return validate(entry).every((p) => p.level !== 'error');
}

/**
 * Check the quiz questions a fact carries.
 *
 * Separate from `validate` because quiz questions live alongside the
 * corpus rather than inside a SourcedFact. The four-option rule used to
 * be a tuple type; it is a runtime check now.
 *
 * @param {import('./types/fact.js').QuizQuestion} question
 * @returns {Problem[]}
 */
export function validateQuizQuestion(question) {
  /** @type {Problem[]} */
  const problems = [];
  const id = isFilledIn(question?.id) ? question.id : '(no id)';

  if (!isFilledIn(question?.factId)) {
    problems.push(problem(id, 'error', 'factId', 'Quiz question is not attached to a fact.'));
  }

  if (!isFilledIn(question?.question)) {
    problems.push(problem(id, 'error', 'question', 'Question text is empty.'));
  }

  if (!Array.isArray(question?.options) || question.options.length !== 4) {
    problems.push(
      problem(
        id,
        'error',
        'options',
        `Needs exactly four options, has ${question?.options?.length ?? 0}.`,
      ),
    );
  } else if (question.options.some((o) => !isFilledIn(o))) {
    problems.push(problem(id, 'error', 'options', 'An option is empty.'));
  }

  if (![0, 1, 2, 3].includes(question?.correctIndex)) {
    problems.push(
      problem(id, 'error', 'correctIndex', `correctIndex '${question?.correctIndex}' is not 0-3.`),
    );
  }

  // Right or wrong, the user learns something (CLAUDE.md §4.3), so the
  // explanation is not optional.
  if (!isFilledIn(question?.explanation)) {
    problems.push(
      problem(id, 'error', 'explanation', 'No explanation. Every answer has to teach something.'),
    );
  }

  return problems;
}
