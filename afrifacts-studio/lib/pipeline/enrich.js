/**
 * Stage 4: turn a kept candidate into a real, reviewable fact.
 *
 * A candidate is one sentence and a passage. The app needs a deep dive,
 * a why-it-matters, a suggested question and three quiz questions, and
 * the review pages need a full provenance record. This writes all of it
 * and produces a SourcedFact — the same shape a hand-authored fact has,
 * so it goes through the same validator and the same review gate. Same
 * standard, different door.
 *
 * What this stage does NOT do:
 *
 *   - It does not decide anything. It only enriches candidates a human
 *     kept in triage. The keep list comes in as a file.
 *   - It does not write into `corpus/*.js`. Those are hand-authored files
 *     with reasoning in the comments, and a script must not rewrite them.
 *     Output goes to `_generated/enriched.json`.
 *   - It does not approve. Everything it writes is `draft`, and every
 *     record still has to clear `validate()` and a named reviewer.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import {
  CANDIDATES_PATH,
  ENRICHED_PATH,
  ENRICHED_QUIZ_PATH,
  ensureDirs,
} from '../paths.js';
import { SOURCE_TIERS } from '../types/provenance.js';
import { loadFactStore, nextFactNumber, promote, promotedKeys } from '../studio/facts.js';
import { promoteQuiz } from '../studio/quiz.js';
import { keyOf } from './candidate-key.js';
import { loadCached } from './fetch.js';

/**
 * Pipeline ids live in their own range.
 *
 * The first run numbered from 1 and collided with the hand-authored
 * `nf_0087`: the corpus then held 132 entries under 131 ids, and a bulk
 * approval marked the blocked hand-written fact approved because the
 * pipeline fact sharing its id was clean. Numbering pipeline facts from
 * 1000 keeps the two doors from ever addressing the same row.
 */
const PIPELINE_ID_BASE = 1000;

/**
 * @typedef {object} Enriched
 * @property {import('../types/provenance.js').SourcedFact} entry
 * @property {import('../types/fact.js').QuizQuestion[]} quiz
 */

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check the enrichment before building a record out of it.
 *
 * A model returning valid JSON of the wrong shape is the normal failure,
 * so every field is checked rather than trusted. A quiz question with
 * three options or a correctIndex of 7 would otherwise reach the app as
 * a crash — and with no compiler in this project any more, this check is
 * the only thing standing between the model and that crash.
 *
 * @param {unknown} raw
 * @param {string} factId
 * @returns {import('../types/fact.js').QuizQuestion[]}
 */
export function parseQuiz(raw, factId) {
  if (!Array.isArray(raw)) return [];
  /** @type {import('../types/fact.js').QuizQuestion[]} */
  const out = [];

  raw.forEach((item, i) => {
    const q = item ?? {};
    const options = q.options;
    const correct = q.correctIndex;

    if (!isNonEmptyString(q.question)) return;
    if (!Array.isArray(options) || options.length !== 4) return;
    if (!options.every(isNonEmptyString)) return;
    if (typeof correct !== 'number' || ![0, 1, 2, 3].includes(correct)) return;
    if (!isNonEmptyString(q.explanation)) return;

    out.push({
      id: `q_${factId}_${i + 1}`,
      factId,
      question: q.question.trim(),
      options: options.map((o) => o.trim()),
      correctIndex: correct,
      explanation: q.explanation.trim(),
    });
  });

  return out;
}

/**
 * A citation somebody could actually follow.
 *
 * Wikipedia's stable locator is the revision id: a page changes, a
 * revision never does, so that is what lets someone find the same words
 * next year. A newspaper or a journal offers no such thing, so the
 * citation says what it does have — the publication, the date it
 * published, the date it was read, and a DOI when the page declared one.
 *
 * @param {import('./extract.js').Candidate} candidate
 */
function citationFor(candidate) {
  const { title, url, revisionId, fetchedAt, kind, siteName, doi, publishedAt } = candidate.source;

  if (kind !== 'web') {
    return `"${title}", Wikipedia, revision ${revisionId} (retrieved ${fetchedAt}). ${url}`;
  }

  const where = siteName || new URL(url).hostname.replace(/^www\./, '');
  const when = publishedAt ? `, ${publishedAt}` : '';
  const identifier = doi ? ` doi:${doi}.` : '';
  return `"${title}", ${where}${when} (retrieved ${fetchedAt}).${identifier} ${url}`;
}

/**
 * The pointer precise enough that someone else can find the same words.
 *
 * CLAUDE.md §7 is explicit that a URL alone is not enough. Wikipedia
 * gets its revision. A web page gets whatever of three better things it
 * turned out to have, strongest first: a DOI, which survives site
 * redesigns entirely; an Internet Archive snapshot, which survives the
 * site being taken down; and always the content hash, which cannot help
 * anyone FIND the page but settles whether the quote was really on it.
 *
 * The hash is the honest floor. It is weaker than a DOI and it is said
 * to be weaker — `validate()` still sees `press` or `reference` and
 * still asks for a second source.
 *
 * @param {import('./extract.js').Candidate} candidate
 * @returns {import('../types/provenance.js').Locator}
 */
function locatorFor(candidate) {
  const { url, revisionId, contentHash, kind, doi, publishedAt, wayback } = candidate.source;

  if (kind !== 'web') {
    return { url, archiveRef: `enwiki-revision-${revisionId}` };
  }

  return {
    url,
    ...(doi ? { doi } : {}),
    ...(publishedAt ? { publishedAt } : {}),
    archiveRef: wayback || `sha256-${contentHash}`,
  };
}

/** @param {number} value */
function clampScore(value) {
  return Math.min(5, Math.max(1, Math.round(value)));
}

/**
 * @param {import('./extract.js').Candidate} candidate
 * @param {number} factNumber Assigned by the caller from the store's
 *   high-water mark. Immutable once written: it is printed on share cards.
 * @param {(line: string) => void} [onProgress]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Enriched | null>}
 */
export async function enrichOne(candidate, factNumber, onProgress, signal) {
  const doc = await loadCached(candidate.slug);
  if (!doc) throw new Error(`'${candidate.slug}' is not cached — run fetch first`);

  const prompt = await loadPrompt('enrich', {
    fact: candidate.fact,
    passage: candidate.passage,
    title: candidate.source.title,
    document: doc.text,
  });

  const raw = await completeJson(
    { model: MODELS.enrich, prompt, temperature: 0.3, signal },
    onProgress,
  );

  const body = Array.isArray(raw?.body) ? raw.body.filter(isNonEmptyString) : [];
  if (body.length === 0) return null;
  if (!isNonEmptyString(raw?.whyItMatters)) return null;

  // The number comes from the store's high-water mark, passed in by the
  // caller. It used to be `PIPELINE_ID_BASE + index`, which renumbered
  // every fact whenever the keep list changed — and a factNumber is
  // printed on share cards that are already out in the world.
  const id = `nf_${String(factNumber).padStart(4, '0')}`;
  const quiz = parseQuiz(raw.quiz, id);

  /** @type {import('../types/fact.js').Fact} */
  const fact = {
    id,
    country: candidate.country,
    category: candidate.category,
    fact: candidate.fact,
    deepDive: {
      body: body.map((p) => p.trim()),
      whyItMatters: raw.whyItMatters.trim(),
      readTime: typeof raw.readTime === 'number' && raw.readTime > 0 ? Math.round(raw.readTime) : 1,
      suggestedQuestion: isNonEmptyString(raw.suggestedQuestion)
        ? raw.suggestedQuestion.trim()
        : 'What else is known about this?',
    },
    source: {
      // What the card says under the fact. On Wikipedia the article title
      // IS the subject and reads correctly there; a newspaper headline
      // does not — "Nigeria's forgotten railway" is not a source name, and
      // the publication is what a reader is being asked to trust.
      name: candidate.source.siteName || candidate.source.title,
      url: candidate.source.url,
      // The passage was string-matched against the cached document by
      // verify.js. That is what this flag means here — checked, not
      // asserted.
      verified: true,
    },
    // The image stage runs separately and writes its decisions to
    // data/images.json. Null is a real value in this schema, not a gap:
    // the typographic card is a designed variant, not a fallback.
    image: null,
    factNumber,
    relatedIds: [],
  };

  /** @type {import('../types/provenance.js').SourcedFact} */
  const entry = {
    fact,
    provenance: {
      factId: id,
      origin: 'pipeline',
      sources: [
        {
          citation: citationFor(candidate),
          // The publication, not the headline. On Wikipedia those are the
          // same string; on a newspaper the headline is not a source name
          // and would read wrongly on the card.
          shortName: candidate.source.siteName || candidate.source.title,
          /*
            The tier came from `source-trust.js` when the source was added,
            travelled through the cache and the candidate, and lands here.

            It used to be the literal 'reference' on every fact, which was
            true while everything was Wikipedia and became a lie the
            moment it was not. It is load-bearing: `validate()` warns on
            anything resting only on `press` or `reference`, so writing
            'peer-reviewed' where it is not earned would silence the one
            check that notices a thin corpus.
          */
          tier: SOURCE_TIERS.includes(candidate.source.tier) ? candidate.source.tier : 'reference',
          locator: locatorFor(candidate),
          passage: candidate.passage,
        },
      ],
      surprise: {
        priorProbability: clampScore(candidate.surprise.priorProbability),
        specificity: clampScore(candidate.surprise.specificity),
        explicability: clampScore(candidate.surprise.explicability),
      },
      review: {
        status: 'draft',
        reviewer: '',
        reviewedAt: new Date().toISOString().slice(0, 10),
        notes: 'Enriched by the pipeline. Not yet read by a human.',
      },
      decay: candidate.volatile
        ? {
            kind: 'volatile',
            // A year out. Volatile facts rest on figures that move.
            reviewBy: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10),
          }
        : { kind: 'permanent' },
      createdAt: new Date().toISOString().slice(0, 10),
    },
  };

  return { entry, quiz };
}

/**
 * There is no keep list any more.
 *
 * Triage is gone: every verified candidate is enriched. What stops this
 * stage redoing work is lineage, not a hand-picked list — `promotedKeys`
 * already knows which candidates became facts, and the survivors are
 * exactly the ones nothing has been spent on yet.
 *
 * The filtering triage did has not disappeared, it moved downstream. A
 * fact you do not want is queued on the review page, where you are
 * judging the finished article rather than a one-line candidate.
 *
 * @returns {Promise<null>}
 */
export async function loadKeeps() {
  return null;
}

// Re-exported so existing callers keep working. The definition moved to
// candidate-key.js, which imports nothing, so the triage client component
// can share it instead of keeping a third hand-written copy.
export { keyOf };

/**
 * @typedef {object} EnrichSummary
 * @property {number} enriched
 * @property {number} quiz
 * @property {number} failed
 * @property {number} skipped Kept candidates that are already facts.
 * @property {boolean} wrote
 * @property {boolean} stopped True when a cancel ended the run early.
 * @property {boolean} usedKeeps
 */

/**
 * Enrich the candidates triage kept, minus the ones already enriched.
 *
 * That second half is not an optimisation. Enrichment assigns a NEW id
 * from the store's high-water mark, so re-enriching a candidate that has
 * already been promoted does not update the existing fact — it creates a
 * second fact, with a second id and a second factNumber, saying exactly
 * the same thing. The keep list is durable and the candidates file is now
 * merged rather than replaced, so that collision is the normal case on a
 * second run, not an edge one.
 *
 * The lineage recorded at promotion is what makes it detectable: a stored
 * fact knows which candidate it came from.
 *
 * @param {{ all?: boolean, force?: boolean, signal?: AbortSignal }} [options]
 *   `all` ignores the keep list; `force` re-enriches even what is already
 *   promoted, which is how a deliberate regeneration is asked for.
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<EnrichSummary>}
 */
export async function runEnrich(options = {}, onProgress) {
  await ensureDirs();
  const say = onProgress ?? (() => {});
  const { signal } = options;

  const candidates = JSON.parse(await readFile(CANDIDATES_PATH, 'utf8'));
  const keeps = options.all ? null : await loadKeeps();

  const wanted = keeps ? candidates.filter((c) => keeps.has(keyOf(c))) : candidates;

  const alreadyDone = options.force ? new Set() : await promotedKeys();
  const chosen = wanted.filter((c) => !alreadyDone.has(keyOf(c)));
  const skipped = wanted.length - chosen.length;

  if (skipped > 0) {
    const s = skipped === 1 ? '' : 's';
    say(`Skipping ${skipped} candidate${s} already enriched into the store.`);
  }

  if (chosen.length === 0) {
    say(
      wanted.length > 0
        ? 'Everything you kept is already a fact in the store. Nothing to do.'
        : 'Nothing to enrich. Keep some candidates on the triage page, or run extract first.',
    );
    return {
      enriched: 0,
      quiz: 0,
      failed: 0,
      skipped,
      wrote: false,
      stopped: false,
      usedKeeps: Boolean(keeps),
    };
  }

  const plural = chosen.length === 1 ? '' : 's';
  say(`Enriching ${chosen.length} fact${plural} with ${MODELS.enrich}`);
  say('Enriching every candidate not already promoted.');

  // Numbers continue from whatever the store already holds, so a second
  // run never reuses an id a share card has been printed with.
  const store = await loadFactStore();
  let n = nextFactNumber(store, PIPELINE_ID_BASE);

  /** @type {Enriched[]} */
  const results = [];
  const keys = new Map();
  let failed = 0;

  let stopped = false;

  for (const candidate of chosen) {
    if (signal?.aborted) {
      stopped = true;
      const s = results.length === 1 ? '' : 's';
      say(`Stopped. ${results.length} fact${s} finished, and they are promoted below.`);
      break;
    }
    try {
      const enriched = await enrichOne(candidate, n, say, signal);
      if (!enriched) {
        failed += 1;
        say(`x ${candidate.fact.slice(0, 60)} — unusable enrichment`);
        continue;
      }
      results.push(enriched);
      // Lineage, so cross-corpus dedupe can tell a fact from the candidate
      // it was made from rather than culling the whole run as duplicates.
      keys.set(enriched.entry.fact.id, keyOf(candidate));
      say(
        `+ ${enriched.entry.fact.id}  ${enriched.quiz.length} quiz  ${candidate.fact.slice(0, 52)}`,
      );
      n += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (signal?.aborted) {
        stopped = true;
        say('Stopped mid-fact. That one was not promoted, so it will run again.');
        break;
      }
      failed += 1;
      say(`x ${candidate.fact.slice(0, 46)} — ${message}`);
    }
  }

  if (results.length === 0) {
    say('Nothing enriched. Leaving the existing enriched facts alone.');
    return {
      enriched: 0,
      quiz: 0,
      failed,
      skipped,
      wrote: false,
      stopped,
      usedKeeps: Boolean(keeps),
    };
  }

  const quiz = results.flatMap((r) => r.quiz);

  await writeFile(
    ENRICHED_PATH,
    `${JSON.stringify(results.map((r) => r.entry), null, 2)}\n`,
    'utf8',
  );
  await writeFile(ENRICHED_QUIZ_PATH, `${JSON.stringify(quiz, null, 2)}\n`, 'utf8');

  say(`${results.length} enriched -> enriched.json`);
  say(`${quiz.length} quiz questions -> enriched-quiz.json`);

  /*
    And the same again, durably.

    enriched-quiz.json above is a record of THIS run and the next run
    overwrites it. Export used to read it, which meant the app shipped
    one run's questions and every earlier run's were gone — 146 facts'
    worth, paid for and deleted, before this line existed. Promotion is
    to the quiz what `promote()` below is to the facts.
  */
  const quizPromotion = await promoteQuiz(quiz);
  say(
    `${quizPromotion.questions} quiz questions promoted for ${quizPromotion.added.length} fact${quizPromotion.added.length === 1 ? '' : 's'}`,
  );
  if (quizPromotion.kept.length > 0) {
    say(
      `${quizPromotion.kept.length} fact${quizPromotion.kept.length === 1 ? '' : 's'} already had questions, left untouched`,
    );
  }

  // Promotion is what makes the run durable. enriched.json is overwritten
  // wholesale by the next run; the store is not, and it never overwrites a
  // record that is already in it, so an edited fact survives a rerun.
  const promotion = await promote(
    results.map((r) => r.entry),
    { keyOf: (entry) => keys.get(entry.fact.id) },
  );
  say(`${promotion.added.length} promoted into the fact store`);
  if (promotion.skipped.length > 0) {
    say(`${promotion.skipped.length} id${promotion.skipped.length === 1 ? '' : 's'} already in the store, left untouched`);
  }

  say("All 'draft'. Review them in the studio.");

  return {
    enriched: results.length,
    quiz: quiz.length,
    failed,
    skipped,
    wrote: true,
    stopped,
    usedKeeps: Boolean(keeps),
  };
}
