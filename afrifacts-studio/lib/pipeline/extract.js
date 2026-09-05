/**
 * Stage 2 and 3 together: ask the model, then check its answer.
 *
 * Nothing here trusts the model. Every candidate it returns is put
 * through verify.js, which uses no model, and through the surprise
 * threshold the corpus is already held to. What survives is written to
 * `_generated/candidates.json` for the enrich stage; what does not is
 * written to `_generated/rejects.json` with the reason.
 *
 * Rejects are kept on purpose. The bar is not calibrated yet, and a
 * filter that is silently too harsh looks identical to Nigeria being
 * short of surprising facts. The only way to tell those apart is to read
 * what was thrown away.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';

import { exemplarsForPrompt } from '../calibration/exemplars.js';
import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { CACHE_DIR, CANDIDATES_PATH, CULLED_PATH, REJECTS_PATH, ensureDirs } from '../paths.js';
import { CATEGORIES } from '../types/fact.js';
import { SURPRISE_AXES, SURPRISE_THRESHOLD } from '../types/provenance.js';
import { extractDone, loadLedger, recordExtract } from '../studio/ledger.js';
import { storedFacts } from '../studio/facts.js';
import { dedupe, dedupeAgainstCorpus } from './dedupe.js';
import { loadCached } from './fetch.js';
import { loadSources } from './sources.js';
import { verify } from './verify.js';

/**
 * A candidate that survived every check.
 *
 * @typedef {object} Candidate
 * @property {string} slug
 * @property {string} fact
 * @property {string} passage
 * @property {import('../types/fact.js').Category} category
 * @property {{ priorProbability: number, specificity: number, explicability: number }} surprise
 * @property {string} reasoning
 * @property {boolean} volatile
 * @property {{ title: string, url: string, revisionId: string, contentHash: string, kind: string, tier: string, fetchedAt: string, siteName?: string, doi?: string, publishedAt?: string, wayback?: string }} source
 *   Copied from the cache so the enrich stage needs no second fetch. It
 *   carries the whole locator, not just the URL: enrich builds the
 *   citation from this and never reopens the cached document to do it.
 * @property {string} country
 */

/**
 * @typedef {object} Reject
 * @property {string} slug
 * @property {string} fact
 * @property {string} passage
 * @property {string[]} reasons
 */

/** @param {unknown} value */
function isScore(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Shape-check before verifying.
 *
 * A model returning valid JSON of the wrong shape is the normal failure,
 * not the rare one, so this runs before anything reads the fields.
 *
 * @param {any} raw
 * @returns {{ ok: true, value: object } | { ok: false, reason: string }}
 */
function parseCandidate(raw) {
  const { fact, passage, category, surprise, reasoning, volatile } = raw ?? {};

  if (typeof fact !== 'string' || fact.trim().length === 0) {
    return { ok: false, reason: 'No fact text.' };
  }
  if (typeof passage !== 'string' || passage.trim().length === 0) {
    return { ok: false, reason: 'No passage.' };
  }
  if (typeof category !== 'string' || !CATEGORIES.includes(category)) {
    return { ok: false, reason: `Category '${String(category)}' is not one of the five.` };
  }

  const s = surprise ?? {};
  if (!isScore(s.priorProbability) || !isScore(s.specificity) || !isScore(s.explicability)) {
    return { ok: false, reason: 'Surprise scores missing or not 1-5 integers.' };
  }

  return {
    ok: true,
    value: {
      fact: fact.trim(),
      passage: passage.trim(),
      category,
      surprise: {
        priorProbability: s.priorProbability,
        specificity: s.specificity,
        explicability: s.explicability,
      },
      reasoning: typeof reasoning === 'string' ? reasoning.trim() : '',
      volatile: volatile === true,
    },
  };
}

/**
 * Which axes fall below the bar the corpus is already held to.
 *
 * @param {Candidate['surprise']} surprise
 * @returns {string[]}
 */
function belowBar(surprise) {
  return SURPRISE_AXES.filter((axis) => surprise[axis] < SURPRISE_THRESHOLD).map(
    (axis) => `Scores ${surprise[axis]} on ${axis}, below the bar of ${SURPRISE_THRESHOLD}.`,
  );
}

/**
 * What the person was looking for when they chose this document.
 *
 * A whole section of the prompt, or nothing at all. The description used
 * to steer the search and then be discarded, so a document added while
 * hunting one specific thing was mined as though it had turned up at
 * random — you searched for whether the Osinbajos are cousins and got
 * back a fact about Segun Awolowo's father, from the article you had
 * chosen precisely because it was about the first thing.
 *
 * The wording below is doing one delicate job: aim the model without
 * turning it into a confirmation machine. A description is what somebody
 * half-remembers, and half-remembered claims are frequently wrong — this
 * one was: the article says Dolapo and Segun Awolowo are cousins, not
 * Dolapo and her husband. So the instruction is to LOOK for it and to
 * return nothing on it when the document does not support it. The
 * verifier would catch a fabricated passage regardless, but a prompt that
 * invites the model to try is a prompt that spends money producing
 * rejects.
 *
 * @param {string} wanted
 */
function wantedSection(wanted) {
  const asked = String(wanted ?? '').trim();
  if (asked.length === 0) return '';

  return `## What this document was added for

Someone went looking for something specific and picked this document out
of the search results. What they typed was:

    "${asked.replace(/"/g, "'")}"

Look for that FIRST. It is the reason this document is here.

- If the document supports it, return it as your first fact.
- If the document does NOT say it, return nothing on it. Do not write it
  anyway and do not stretch a nearby passage to look like it. What was
  typed is what somebody half-remembered; the document is the evidence.
  A description that turns out to be wrong is normal and finding that out
  is useful — an invented fact is neither.
- If the document says something CLOSE but different — a different
  relationship, a different person, a different year — return the version
  the document actually supports and let the difference stand. That
  correction is often more surprising than the thing that was asked for.
- Then carry on and return the other facts this document offers, judged
  by exactly the same bar as always. A document worth reading almost
  always contains more than the one thing that led you to it.

`;
}

/**
 * @param {import('./fetch.js').CachedDoc} doc
 * @param {(line: string) => void} [onProgress]
 * @param {AbortSignal} [signal]
 * @param {string} [wanted] What was searched for when this document was chosen.
 * @returns {Promise<{ kept: Candidate[], rejected: Reject[] }>}
 */
export async function extractFrom(doc, onProgress, signal, wanted = '') {
  const kind = doc.kind ?? 'wikipedia';
  const prompt = await loadPrompt('extract', {
    title: doc.title,
    // Said accurately rather than always "Wikipedia". The model is told
    // what it is reading, and a newspaper is not an encyclopedia — it
    // reports what was claimed as much as what happened, and knowing
    // which it is holding changes how it should read a sentence.
    source:
      kind === 'web'
        ? `${doc.siteName || new URL(doc.url).hostname}, ${doc.tier}${
            doc.publishedAt ? `, published ${doc.publishedAt}` : ''
          }, fetched ${doc.fetchedAt}`
        : `Wikipedia, revision ${doc.revisionId}, fetched ${doc.fetchedAt}`,
    document: doc.text,
    exemplars: exemplarsForPrompt(),
    wanted: wantedSection(wanted),
  });

  const response = await completeJson(
    { model: MODELS.extract, prompt, temperature: 0, signal },
    onProgress,
  );

  /** @type {Candidate[]} */
  const kept = [];
  /** @type {Reject[]} */
  const rejected = [];
  const raws = Array.isArray(response?.facts) ? response.facts : [];

  for (const raw of raws) {
    const parsed = parseCandidate(raw);
    if (!parsed.ok) {
      rejected.push({
        slug: doc.slug,
        fact: typeof raw?.fact === 'string' ? raw.fact : '(unparseable)',
        passage: typeof raw?.passage === 'string' ? raw.passage : '',
        reasons: [parsed.reason],
      });
      continue;
    }

    const c = parsed.value;
    const reasons = [...verify(c.fact, c.passage, doc.text).reasons, ...belowBar(c.surprise)];

    if (reasons.length > 0) {
      rejected.push({ slug: doc.slug, fact: c.fact, passage: c.passage, reasons });
      continue;
    }

    kept.push({
      ...c,
      slug: doc.slug,
      country: doc.country,
      source: {
        title: doc.title,
        url: doc.url,
        revisionId: doc.revisionId ?? '',
        // Documents cached before web sources existed have no hash and no
        // kind. They are all Wikipedia, so the fallbacks are what they
        // are rather than a guess — and reading them must not require
        // refetching 38 articles.
        contentHash: doc.contentHash ?? '',
        kind: doc.kind ?? 'wikipedia',
        tier: doc.tier,
        fetchedAt: doc.fetchedAt,
        siteName: doc.siteName ?? '',
        doi: doc.doi ?? '',
        publishedAt: doc.publishedAt ?? '',
        wayback: doc.wayback ?? '',
      },
    });
  }

  return { kept, rejected };
}

/** @returns {Promise<string[]>} */
export async function cachedSlugs() {
  try {
    const files = await readdir(CACHE_DIR);
    return files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
  } catch {
    return [];
  }
}


/**
 * What a Run would actually do, without doing it.
 *
 * The Run button used to be a leap of faith: it took every cached
 * document, whether or not it had already been through the model, and the
 * only way to learn that was the bill. This answers the question the
 * button should have been answering all along — how many documents are
 * new, and why each of the others is being skipped.
 *
 * @param {{ slugs?: string[], force?: boolean }} [options]
 * @returns {Promise<{ pending: { slug: string, why: string }[], done: { slug: string, why: string }[] }>}
 */
export async function planExtract(options = {}) {
  const [ledger, all] = await Promise.all([loadLedger(), cachedSlugs()]);
  const slugs = options.slugs?.length ? options.slugs.filter((s) => all.includes(s)) : all;

  /** @type {{ slug: string, why: string }[]} */
  const pending = [];
  /** @type {{ slug: string, why: string }[]} */
  const done = [];

  for (const slug of slugs) {
    const doc = await loadCached(slug);
    if (!doc) {
      pending.push({ slug, why: 'not cached — run fetch first' });
      continue;
    }
    if (options.force) {
      pending.push({ slug, why: 'forced' });
      continue;
    }
    const state = extractDone(ledger, slug, doc.revisionId, MODELS.extract);
    (state.done ? done : pending).push({ slug, why: state.why });
  }

  return { pending, done };
}

/**
 * @typedef {object} ExtractSummary
 * @property {number} passed How many cleared the verifier, before dedupe.
 * @property {number} skipped Documents the ledger says were already done.
 * @property {number} culled
 * @property {number} candidates Total in candidates.json after the merge.
 * @property {number} fresh How many of those are new this run.
 * @property {number} rejected
 * @property {boolean} wrote False when nothing finished.
 * @property {boolean} stopped True when a cancel ended the run early.
 * @property {{ slug: string, kept: number, rejected: number, error?: string }[]} rows
 */

/**
 * The rows to keep from a previous run.
 *
 * The old extract replaced candidates.json outright, so extracting one new
 * document discarded every candidate from every earlier run — and with
 * them the correspondence to the triage verdicts keyed to their text. This
 * is the rule that replaces that: a document this run processed has its
 * rows rewritten, and every other document's rows are carried through
 * untouched.
 *
 * A row whose slug cannot be read is KEPT. It came from somewhere and this
 * run did not produce it, so dropping it would be discarding data on the
 * strength of not understanding it.
 *
 * @template T
 * @param {T[]} rows
 * @param {Set<string>} touched Slugs this run rewrote.
 * @param {(row: T) => string | undefined} slugOf
 * @returns {T[]}
 */
export function mergeBySlug(rows, touched, slugOf) {
  return rows.filter((row) => {
    const slug = slugOf(row);
    return typeof slug !== 'string' || !touched.has(slug);
  });
}

/** @param {string} path */
async function readArray(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Run extraction over cached documents that have not been extracted yet.
 *
 * Two properties this has that the previous version did not, both of which
 * cost real money to be without:
 *
 *   1. It skips documents the ledger has already paid for at the same
 *      revision. `force` clears that, and is a separate deliberate act.
 *   2. It MERGES into candidates.json rather than overwriting it. The old
 *      version replaced the file wholesale, so extracting one new document
 *      silently discarded every candidate from every previous run — along
 *      with the correspondence between that file and the triage verdicts
 *      keyed to it.
 *
 * Both write paths are per-slug: a document that was re-run replaces its
 * own rows, and every other document's rows are left exactly as they were.
 *
 * @param {{ slugs?: string[], force?: boolean, signal?: AbortSignal }} [options]
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<ExtractSummary>}
 */
export async function runExtract(options = {}, onProgress) {
  await ensureDirs();
  const say = onProgress ?? (() => {});
  const { signal } = options;

  const plan = await planExtract(options);
  const slugs = plan.pending.map((p) => p.slug);

  if (plan.done.length > 0) {
    const s = plan.done.length === 1 ? '' : 's';
    say(`Skipping ${plan.done.length} document${s} already extracted. Re-run redoes them.`);
  }

  if (slugs.length === 0) {
    say('Nothing new to extract. Every cached document has been through the model.');
    return {
      passed: 0,
      skipped: plan.done.length,
      culled: 0,
      candidates: (await readArray(CANDIDATES_PATH)).length,
      fresh: 0,
      rejected: 0,
      wrote: false,
      stopped: false,
      rows: [],
    };
  }

  /** @type {Candidate[]} */
  const kept = [];
  /** @type {Reject[]} */
  const rejected = [];
  /** @type {ExtractSummary['rows']} */
  const rows = [];
  /** @type {{ slug: string, revisionId: string, candidates: number, rejected: number }[]} */
  const completed = [];
  let stopped = false;

  const plural = slugs.length === 1 ? '' : 's';
  say(`Extracting from ${slugs.length} new document${plural} with ${MODELS.extract}`);

  /*
    What each document was added while looking for.

    Read from the seed list rather than from the cache, because it is a
    decision and decisions live in `data/`. It also means editing what you
    were looking for takes effect on the next extract without refetching
    the document. An orphaned cache file — fetched under an older seed
    list — simply has no entry and extracts unguided, which is correct.
  */
  const wantedBySlug = new Map(
    (await loadSources()).filter((s) => s.wanted).map((s) => [s.slug, s.wanted]),
  );

  for (const slug of slugs) {
    // Checked between documents rather than mid-call, so a stop never
    // abandons a document halfway and leaves the ledger unsure whether it
    // was paid for.
    if (signal?.aborted) {
      stopped = true;
      const s = completed.length === 1 ? '' : 's';
      say(`Stopped. ${completed.length} document${s} finished, and they are kept.`);
      break;
    }

    const doc = await loadCached(slug);
    if (!doc) {
      rows.push({ slug, kept: 0, rejected: 0, error: 'not cached — run fetch first' });
      say(`x ${slug.padEnd(16)} not cached — run fetch first`);
      continue;
    }
    try {
      const wanted = wantedBySlug.get(slug) ?? '';
      if (wanted) say(`  looking for: ${wanted}`);
      const result = await extractFrom(doc, say, signal, wanted);
      kept.push(...result.kept);
      rejected.push(...result.rejected);
      rows.push({ slug, kept: result.kept.length, rejected: result.rejected.length });
      completed.push({
        slug,
        revisionId: doc.revisionId,
        candidates: result.kept.length,
        rejected: result.rejected.length,
      });
      const k = String(result.kept.length).padStart(2);
      const r = String(result.rejected.length).padStart(2);
      say(`+ ${slug.padEnd(16)} ${k} kept, ${r} rejected`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (signal?.aborted) {
        stopped = true;
        say(`Stopped during ${slug}. Not charged to the ledger, so it will run again.`);
        break;
      }
      rows.push({ slug, kept: 0, rejected: 0, error: message });
      say(`x ${slug.padEnd(16)} ${message}`);
    }
  }

  // A run where every document failed — an expired quota, a dead network —
  // must not overwrite good candidates with an empty list. Triage work is
  // the expensive thing here, and it is keyed to what is in this file.
  if (completed.length === 0) {
    say(stopped ? 'Nothing finished before the stop.' : 'Every document failed. Nothing written.');
    return {
      passed: 0,
      skipped: plan.done.length,
      culled: 0,
      candidates: (await readArray(CANDIDATES_PATH)).length,
      fresh: 0,
      rejected: 0,
      wrote: false,
      stopped,
      rows,
    };
  }

  // Cull within the run. 320 candidates is not ten times more knowledge
  // than 32, it is the same findings restated, and nobody can triage it.
  const withinRun = dedupe(kept);

  // Then cull against everything already in the corpus. Without this a
  // re-extract hands back facts that are already in the app, and anything
  // kept from them becomes a second fact with a different id.
  const corpus = await storedFacts();
  const againstCorpus = dedupeAgainstCorpus(withinRun.kept, corpus);
  const culled = [...withinRun.culled, ...againstCorpus.culled];
  const survivors = againstCorpus.kept;

  // Merge, never replace. Only the slugs this run touched are rewritten.
  const touched = new Set(completed.map((c) => c.slug));
  const bySlug = (row) => row?.slug;
  const byCandidateSlug = (row) => row?.candidate?.slug;

  const priorCandidates = mergeBySlug(await readArray(CANDIDATES_PATH), touched, bySlug);
  const priorRejects = mergeBySlug(await readArray(REJECTS_PATH), touched, bySlug);
  const priorCulled = mergeBySlug(await readArray(CULLED_PATH), touched, byCandidateSlug);

  await writeFile(
    CANDIDATES_PATH,
    JSON.stringify([...priorCandidates, ...survivors], null, 2),
    'utf8',
  );
  await writeFile(REJECTS_PATH, JSON.stringify([...priorRejects, ...rejected], null, 2), 'utf8');
  await writeFile(CULLED_PATH, JSON.stringify([...priorCulled, ...culled], null, 2), 'utf8');

  // The ledger is written last, and only for documents that finished. A
  // crash before this line costs a re-run; a ledger written before the
  // candidates would cost the findings with nothing to show they are gone.
  for (const entry of completed) {
    await recordExtract(entry.slug, {
      revisionId: entry.revisionId,
      model: MODELS.extract,
      candidates: entry.candidates,
      rejected: entry.rejected,
    });
  }

  say(`${kept.length} passed the verifier`);
  say(`${withinRun.culled.length} culled within this run`);
  say(`${againstCorpus.culled.length} culled as already in the corpus`);
  say(`${survivors.length} new, ${priorCandidates.length} carried over -> candidates.json`);
  say(`${rejected.length} failed the verifier -> rejects.json`);

  return {
    passed: kept.length,
    skipped: plan.done.length,
    culled: culled.length,
    candidates: priorCandidates.length + survivors.length,
    fresh: survivors.length,
    rejected: rejected.length,
    wrote: true,
    stopped,
    rows,
  };
}
