/**
 * The corpus, into Supabase.
 *
 * This is what `export-to-app.js` was scaffolding for. Both stages read
 * the same corpus through the same two functions — `toAppFact` and
 * `imageFor` are imported rather than reimplemented — so a fact in the
 * database and the same fact in `dummyFacts.ts` cannot disagree about
 * its shape or its picture. When the app starts querying, the generated
 * file is deleted and this stage is all that remains.
 *
 * WHAT CROSSES, AND WHAT STAYS BEHIND THE SERVICE KEY
 *
 * `facts` and `quiz_questions` are the app's tables and carry nothing
 * the app does not render. Passages, surprise scores, reviewer names,
 * source tiers, the ledger and the image pool go into tables the anon
 * role has no grant on at all — not a policy it might fail, no grant.
 * The app renders facts; it does not audit them.
 *
 * The push is an upsert keyed on primary keys, so running it twice is
 * the same as running it once. That matters more than it sounds: a stage
 * you can only run against an empty database is a stage nobody dares
 * run.
 *
 * Order is not cosmetic. `facts` goes first because five other tables
 * carry a foreign key to it, and a child row for a fact that is not
 * there yet is rejected by the database rather than silently dropped.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { loadReviewedCorpus } from '../check.js';
import { PUSHED_PATH } from '../paths.js';
import { isPublishable, validateQuizQuestion } from '../validate.js';
import { loadImages, loadPool, findCandidate } from '../studio/images.js';
import { allQuizQuestions } from '../studio/quiz.js';
import { loadLedger } from '../studio/ledger.js';
import { loadSources } from './sources.js';
import { count, keys, remove, supabaseConfig, upsert } from '../studio/supabase.js';
import { imageFor, toAppFact } from './app-shape.js';

/** Empty string to null, so the database holds absence as absence. */
const orNull = (value) => {
  const s = typeof value === 'string' ? value.trim() : value;
  return s === '' || s === undefined ? null : s;
};

/**
 * A date the database will accept.
 *
 * The corpus carries '2026-09-05', '' and full ISO timestamps in the
 * same fields depending on which stage wrote them. Postgres rejects the
 * empty string for a date column with an error that names the type
 * rather than the row.
 */
const orDate = (value) => {
  const s = typeof value === 'string' ? value.trim() : '';
  return s.length === 0 ? null : s;
};

/**
 * @typedef {object} PushSummary
 * @property {Record<string, number>} sent Rows sent, per table.
 * @property {Record<string, number>} deleted Rows removed as no longer
 *   in the corpus, per table.
 * @property {Record<string, number>} live Rows the database holds after.
 * @property {number} facts
 * @property {boolean} stopped
 */

/**
 * @param {{ signal?: AbortSignal }} [options]
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<PushSummary>}
 */
export async function runPush(options = {}, onProgress) {
  const say = onProgress ?? (() => {});
  const { signal } = options;

  const config = await supabaseConfig();
  say(`${config.url} · schema ${config.schema}`);

  const [corpus, images, pool, quiz, ledger, sources] = await Promise.all([
    loadReviewedCorpus(),
    loadImages(),
    loadPool(),
    allQuizQuestions(),
    loadLedger(),
    loadSources(),
  ]);

  const publishable = corpus.filter(isPublishable);
  if (publishable.length === 0) {
    say('Nothing publishable. Approve some facts first.');
    return { sent: {}, deleted: {}, live: {}, facts: 0, stopped: false };
  }

  /*
    Every fact in the corpus reaches the database, including the ones
    that are blocked or held back — but only publishable ones are
    `published`. The app filters on that column, so a fact can be pulled
    from the feed later without deleting its passages and its review
    history along with it.
  */
  const publishableIds = new Set(publishable.map((e) => e.fact.id));
  const factRows = corpus.map((entry) => {
    const fact = toAppFact(entry, imageFor(entry, images, pool));
    return {
      id: fact.id,
      country: fact.country,
      category: fact.category,
      fact: fact.fact,
      deep_dive: fact.deepDive,
      source: fact.source,
      image: fact.image,
      fact_number: fact.factNumber,
      related_ids: fact.relatedIds ?? [],
      published: publishableIds.has(fact.id),
      updated_at: new Date().toISOString(),
    };
  });

  const factIds = new Set(factRows.map((r) => r.id));

  // Only well-formed questions, and only for facts that are actually
  // going up. The same two filters export applies — a question with
  // three options crashes the quiz screen, and one pointing at a missing
  // fact is rejected by the foreign key.
  const quizRows = quiz
    .filter((q) => factIds.has(q.factId) && validateQuizQuestion(q).length === 0)
    .map((q) => ({
      id: q.id,
      fact_id: q.factId,
      question: q.question,
      options: q.options,
      correct_index: q.correctIndex,
      explanation: q.explanation,
    }));

  const sourceRows = corpus.flatMap((entry) =>
    (entry.provenance.sources ?? []).map((source, i) => ({
      fact_id: entry.fact.id,
      ordinal: i,
      citation: source.citation ?? '',
      short_name: orNull(source.shortName),
      tier: source.tier ?? 'reference',
      locator: source.locator ?? null,
      passage: source.passage ?? '',
    })),
  );

  const provenanceRows = corpus.map((entry) => ({
    fact_id: entry.fact.id,
    origin: entry.provenance.origin ?? 'pipeline',
    surprise: entry.provenance.surprise ?? null,
    decay: entry.provenance.decay ?? null,
    candidate_key: orNull(entry.record?.candidateKey),
    created_at: orDate(entry.provenance.createdAt),
  }));

  const reviewRows = corpus
    .filter((entry) => entry.provenance.review?.status)
    .map((entry) => ({
      fact_id: entry.fact.id,
      status: entry.provenance.review.status,
      reviewer: orNull(entry.provenance.review.reviewer),
      reviewed_at: orDate(entry.provenance.review.reviewedAt),
    }));

  const imageRows = Object.entries(images)
    .filter(([factId]) => factIds.has(factId))
    .map(([factId, decision]) => ({
      fact_id: factId,
      file: decision.file ?? '',
      status: decision.status,
      reasoning: orNull(decision.reasoning),
      decided_by: orNull(decision.decidedBy),
      decided_at: orDate(decision.decidedAt),
      refused: decision.refused ?? [],
    }));

  /*
    Every image any decision points at, plus the whole searched pool.

    Not just the accepted ones: this table is the only record of who owns
    a picture and under what terms, and a rejected candidate today is the
    swap-in tomorrow. Deduplicated by file, because the harvested pool
    and the search results overlap.
  */
  const candidates = new Map();
  for (const rows of Object.values(pool)) {
    for (const candidate of rows) {
      if (!candidate?.file || candidates.has(candidate.file)) continue;
      candidates.set(candidate.file, {
        file: candidate.file,
        url: candidate.url ?? '',
        description_url: orNull(candidate.descriptionUrl),
        width: candidate.width ?? null,
        height: candidate.height ?? null,
        license: orNull(candidate.license),
        license_id: orNull(candidate.licenseId),
        artist: orNull(candidate.artist),
        description: orNull(candidate.description),
        via: orNull(candidate.via),
        thumbnail: orNull(candidate.thumbnail),
      });
    }
  }

  const seedRows = sources.map((entry) => ({
    slug: entry.slug,
    kind: entry.kind ?? 'wikipedia',
    title: orNull(entry.title),
    url: orNull(entry.url),
    tier: orNull(entry.tier),
    wanted: orNull(entry.wanted),
  }));

  const ledgerRows = Object.entries(ledger).flatMap(([stage, bySlug]) =>
    Object.entries(bySlug ?? {}).map(([slug, row]) => ({
      slug,
      stage,
      revision_id: orNull(String(row.revisionId ?? '')),
      model: orNull(row.model),
      candidates: row.candidates ?? null,
      rejected: row.rejected ?? null,
      at: orDate(row.at),
    })),
  );

  // facts first: five tables below point at it.
  const plan = [
    ['facts', factRows],
    ['image_candidates', [...candidates.values()]],
    ['quiz_questions', quizRows],
    ['fact_sources', sourceRows],
    ['provenance', provenanceRows],
    ['reviews', reviewRows],
    ['images', imageRows],
    ['sources', seedRows],
    ['ledger', ledgerRows],
  ];

  /** @type {Record<string, number>} */
  const sent = {};
  let stopped = false;

  for (const [table, rows] of plan) {
    if (signal?.aborted) {
      stopped = true;
      say(`— stopped before ${table}. What went up is already there.`);
      break;
    }
    sent[table] = await upsert(config, table, rows, say, signal);
  }

  /*
    Anything up there that is not down here any more.

    Without this the push is append-only: a fact deleted from the corpus
    keeps serving to the app forever, which makes "delete" a word that
    does not mean what it says. Reconciling turns the database into a
    mirror of the corpus rather than a log of everything it has ever
    held.

    Only these four are reconciled. `provenance`, `fact_sources`,
    `images` and `reviews` carry `on delete cascade` from `facts`, so a
    removed fact takes its passages and decisions with it — deleting
    them separately would be doing the database's work and getting the
    order wrong.
  */
  const wanted = {
    facts: factIds,
    quiz_questions: new Set(quizRows.map((r) => r.id)),
    sources: new Set(seedRows.map((r) => r.slug)),
    image_candidates: new Set(candidates.keys()),
  };
  const keyColumn = { facts: 'id', quiz_questions: 'id', sources: 'slug', image_candidates: 'file' };

  /** @type {Record<string, number>} */
  const deleted = {};

  for (const [table, ids] of Object.entries(wanted)) {
    if (signal?.aborted || sent[table] === undefined) continue;

    const column = keyColumn[table];
    const live = await keys(config, table, column);
    const extra = live.filter((id) => !ids.has(id));
    if (extra.length === 0) continue;

    /*
      A brake, not a policy.

      The corpus is loaded from disk at the top of this function. If that
      load half-fails — a truncated file, a stage mid-write — this loop
      is what turns a local accident into a wiped database. Deleting a
      few rows is routine; deleting most of a table means the thing this
      is comparing against is probably wrong, and stopping is cheaper
      than restoring.
    */
    if (extra.length > live.length / 5 && extra.length > 10) {
      throw new Error(
        `Refusing to delete ${extra.length} of ${live.length} rows from ${table}. ` +
          'That is most of the table, which usually means the corpus failed to load rather ' +
          'than that you deleted that much. Check `npm run check`, then delete them in the ' +
          'SQL editor if it really is intended.',
      );
    }

    deleted[table] = await remove(config, table, column, extra, signal);
    say(`${deleted[table]} removed from ${table}`);
  }

  /** @type {Record<string, number>} */
  const live = {};
  for (const [table] of plan) {
    if (sent[table] === undefined) continue;
    live[table] = await count(config, table);
  }

  const published = factRows.filter((r) => r.published).length;
  say(
    `${published} of ${factRows.length} facts published, ${factRows.length - published} held`,
  );

  /*
    The receipt.

    Not for this function — for the board, which asks whether the
    database is behind the decisions on disk. That used to be answered by
    comparing the generated app file's mtime against the review files',
    and there is no app file any more. Written last, so a push that fails
    part way through does not claim to have finished.
  */
  if (!stopped) {
    await mkdir(dirname(PUSHED_PATH), { recursive: true });
    await writeFile(
      PUSHED_PATH,
      `${JSON.stringify({ at: new Date().toISOString(), url: config.url, schema: config.schema, facts: factRows.length, published, sent, deleted, live }, null, 2)}\n`,
      'utf8',
    );
  }

  return { sent, live, deleted, facts: factRows.length, published, stopped };
}
