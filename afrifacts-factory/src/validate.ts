/**
 * The standard, enforced.
 *
 * Types stop a field from being the wrong shape. They cannot stop a fact
 * from shipping with an empty passage, a URL as its only locator, or a
 * surprise score below the bar. This file does that, so the rules in
 * CLAUDE.md §10 are checkable rather than aspirational.
 *
 * Manually written facts and pipeline facts run through the same
 * function. Same standard, different door.
 */

import type { Fact } from './types/fact';
import {
  SURPRISE_THRESHOLD,
  TIERS_NEEDING_CORROBORATION,
  type Locator,
  type Provenance,
  type SourcedFact,
} from './types/provenance';

export interface Problem {
  factId: string;
  /** 'error' blocks publication. 'warning' wants a human to look. */
  level: 'error' | 'warning';
  field: string;
  message: string;
}

/** A locator is stable if it survives a website redesign. */
function hasStableLocator(locator: Locator): boolean {
  return Boolean(
    isFilledIn(locator.doi) || isFilledIn(locator.isbn) || isFilledIn(locator.archiveRef),
  );
}

/**
 * Placeholder text is not a value.
 *
 * A half-written entry is more dangerous than an empty one: it looks
 * complete, so it passes a glance. Checking only for empty strings let a
 * fact whose passage read 'TODO: quote the source' through with no
 * errors, which is exactly the failure this whole file exists to stop.
 */
const PLACEHOLDER = /^\s*(todo|tbd|fixme|xxx|placeholder|\.\.\.|-)\b/i;

function isFilledIn(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER.test(trimmed);
}

function checkFact(fact: Fact, problems: Problem[]): void {
  const id = fact.id;

  if (!isFilledIn(fact.fact)) {
    problems.push({ factId: id, level: 'error', field: 'fact', message: 'Fact text is empty or still a placeholder.' });
  }

  // Never hardcode Nigeria: country is a data value, so it just has to be
  // present and plausible, not equal to anything in particular.
  if (!/^[A-Z]{2,3}$/.test(fact.country)) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'country',
      message: `Country '${fact.country}' is not an ISO alpha-2 code or 'AFR'.`,
    });
  }

  if (!isFilledIn(fact.source.name) || !isFilledIn(fact.source.url)) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'source',
      message: 'Every fact must carry a source name and URL. No source, no ship.',
    });
  }

  // A photo credit is a licence requirement, not a nicety.
  if (fact.image) {
    if (!isFilledIn(fact.image.credit)) {
      problems.push({
        factId: id,
        level: 'error',
        field: 'image.credit',
        message: 'Image has no credit. Dropping a credit breaks the licence.',
      });
    }
    if (!isFilledIn(fact.image.license)) {
      problems.push({
        factId: id,
        level: 'error',
        field: 'image.license',
        message: 'Image has no licence recorded.',
      });
    }
  }

  if (!isFilledIn(fact.deepDive.whyItMatters)) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'deepDive.whyItMatters',
      message: 'Why it matters is the signature block of every deep dive.',
    });
  }

  if (fact.deepDive.body.length === 0) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'deepDive.body',
      message: 'Deep dive has no body paragraphs.',
    });
  }
}

function checkProvenance(prov: Provenance, problems: Problem[]): void {
  const id = prov.factId;

  if (prov.sources.length === 0) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'sources',
      message: 'No source recorded. A fact without a source does not ship.',
    });
  }

  prov.sources.forEach((source, i) => {
    const at = `sources[${i}]`;

    // The rule the whole pipeline rests on: extracted, never remembered.
    if (!isFilledIn(source.passage)) {
      problems.push({
        factId: id,
        level: 'error',
        field: `${at}.passage`,
        message:
          'No usable passage. The fact must be extracted from source text, quoted verbatim — a placeholder does not count.',
      });
    }

    if (!hasStableLocator(source.locator)) {
      problems.push({
        factId: id,
        level: isFilledIn(source.locator.url) ? 'warning' : 'error',
        field: `${at}.locator`,
        message: isFilledIn(source.locator.url)
          ? 'Only a URL to go on. URLs rot — add a DOI, ISBN or archive reference.'
          : 'No locator at all. Nobody else can find this passage.',
      });
    }

    if (!isFilledIn(source.citation)) {
      problems.push({
        factId: id,
        level: 'error',
        field: `${at}.citation`,
        message: 'No citation.',
      });
    }
  });

  // Press reports what was claimed as much as what happened; reference
  // works are aggregation. Neither carries a fact alone.
  const weak = prov.sources.filter((s) => TIERS_NEEDING_CORROBORATION.includes(s.tier));
  if (prov.sources.length > 0 && weak.length === prov.sources.length) {
    problems.push({
      factId: id,
      level: 'warning',
      field: 'sources',
      message: `Rests only on ${weak.map((s) => s.tier).join(', ')}. Wants a second, independent source.`,
    });
  }

  const { priorProbability, specificity, explicability } = prov.surprise;
  const axes: [string, number][] = [
    ['priorProbability', priorProbability],
    ['specificity', specificity],
    ['explicability', explicability],
  ];
  for (const [axis, score] of axes) {
    if (score < SURPRISE_THRESHOLD) {
      problems.push({
        factId: id,
        level: 'error',
        field: `surprise.${axis}`,
        message: `Scores ${score} on ${axis}, below the bar of ${SURPRISE_THRESHOLD}.`,
      });
    }
  }

  // Nothing goes live unreviewed.
  if (prov.review.status === 'approved' && !isFilledIn(prov.review.reviewer)) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'review.reviewer',
      message: 'Approved but no reviewer named. An approval must be attributable.',
    });
  }

  if (prov.review.status !== 'approved' && !isFilledIn(prov.review.notes)) {
    problems.push({
      factId: id,
      level: 'warning',
      field: 'review.notes',
      message: `Status is '${prov.review.status}' with no note saying why.`,
    });
  }

  if (prov.decay.kind === 'volatile' && !prov.decay.reviewBy) {
    problems.push({
      factId: id,
      level: 'error',
      field: 'decay.reviewBy',
      message: 'Volatile facts need a date to be checked again.',
    });
  }
}

/** Check one fact and its evidence. */
export function validate(entry: SourcedFact): Problem[] {
  const problems: Problem[] = [];

  if (entry.fact.id !== entry.provenance.factId) {
    problems.push({
      factId: entry.fact.id,
      level: 'error',
      field: 'provenance.factId',
      message: `Provenance points at '${entry.provenance.factId}' but the fact is '${entry.fact.id}'.`,
    });
  }

  checkFact(entry.fact, problems);
  checkProvenance(entry.provenance, problems);
  return problems;
}

/** Check a corpus, including cross-fact rules. */
export function validateCorpus(entries: SourcedFact[]): Problem[] {
  const problems = entries.flatMap(validate);

  const seenIds = new Set<string>();
  const seenNumbers = new Map<number, string>();

  for (const { fact } of entries) {
    if (seenIds.has(fact.id)) {
      problems.push({
        factId: fact.id,
        level: 'error',
        field: 'id',
        message: `Duplicate id '${fact.id}'.`,
      });
    }
    seenIds.add(fact.id);

    const heldBy = seenNumbers.get(fact.factNumber);
    if (heldBy) {
      problems.push({
        factId: fact.id,
        level: 'error',
        field: 'factNumber',
        message: `Fact number ${fact.factNumber} already used by '${heldBy}'.`,
      });
    } else {
      seenNumbers.set(fact.factNumber, fact.id);
    }
  }

  // relatedIds must point at facts that exist, or the deep dive dead-ends.
  for (const { fact } of entries) {
    for (const related of fact.relatedIds) {
      if (!seenIds.has(related)) {
        problems.push({
          factId: fact.id,
          level: 'warning',
          field: 'relatedIds',
          message: `Points at '${related}', which is not in the corpus.`,
        });
      }
    }
  }

  return problems;
}

/** Only approved, error-free facts are publishable. */
export function isPublishable(entry: SourcedFact): boolean {
  if (entry.provenance.review.status !== 'approved') return false;
  return validate(entry).every((p) => p.level !== 'error');
}
