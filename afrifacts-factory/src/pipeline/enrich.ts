/**
 * Stage 4: turn a kept candidate into a real, reviewable fact.
 *
 * `npm run enrich`
 *
 * A candidate is one sentence and a passage. The app needs a deep dive,
 * a why-it-matters, a suggested question and three quiz questions, and
 * the review studio needs a full provenance record. This writes all of
 * it and produces a `SourcedFact` — the same shape a hand-authored fact
 * has, so it goes through the same validator and the same review gate.
 * Same standard, different door.
 *
 * What this stage does NOT do:
 *
 *   - It does not decide anything. It only enriches candidates a human
 *     kept in triage. The keep list comes in as a file.
 *   - It does not write into `src/corpus/*.ts`. Those are hand-authored
 *     files with reasoning in the comments, and a script must not
 *     rewrite them. Output goes to `_enriched.ts`, which the corpus
 *     index imports.
 *   - It does not approve. Everything it writes is `draft`, and every
 *     record still has to clear `validate()` and a named reviewer.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, sep } from 'node:path';
import { completeJson, loadPrompt, MODELS } from '../llm';
import { loadCached } from './fetch';
import { CANDIDATES_PATH, type Candidate } from './extract';
import type { Category, Fact } from '../types/fact';
import type { SourcedFact, SurpriseScore } from '../types/provenance';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
export const KEEPS_PATH = join(ROOT, '_keeps.json');
export const ENRICHED_PATH = join(ROOT, '_enriched.ts');

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

/** What the model is asked for. Nothing here is believed until checked. */
interface RawEnrichment {
  body?: unknown;
  whyItMatters?: unknown;
  suggestedQuestion?: unknown;
  readTime?: unknown;
  quiz?: unknown;
}

interface QuizQuestion {
  id: string;
  factId: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Enriched {
  entry: SourcedFact;
  quiz: QuizQuestion[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check the enrichment before building a record out of it.
 *
 * A model returning valid JSON of the wrong shape is the normal failure,
 * so every field is checked rather than trusted. A quiz question with
 * three options or a correctIndex of 7 would otherwise reach the app as
 * a crash.
 */
function parseQuiz(raw: unknown, factId: string): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: QuizQuestion[] = [];

  raw.forEach((item, i) => {
    const q = item as Record<string, unknown>;
    const options = q['options'];
    const correct = q['correctIndex'];

    if (!isNonEmptyString(q['question'])) return;
    if (!Array.isArray(options) || options.length !== 4) return;
    if (!options.every(isNonEmptyString)) return;
    if (typeof correct !== 'number' || ![0, 1, 2, 3].includes(correct)) return;
    if (!isNonEmptyString(q['explanation'])) return;

    const [a, b, c, d] = options as [string, string, string, string];

    out.push({
      id: `q_${factId}_${i + 1}`,
      factId,
      question: q['question'].trim(),
      options: [a.trim(), b.trim(), c.trim(), d.trim()],
      correctIndex: correct as 0 | 1 | 2 | 3,
      explanation: q['explanation'].trim(),
    });
  });

  return out;
}

/**
 * Wikipedia's stable locator is the revision id.
 *
 * A page changes; a revision never does. This is what lets someone find
 * the same words next year, and it is why the fetcher stores it.
 */
function citationFor(candidate: Candidate): string {
  const { title, url, revisionId, fetchedAt } = candidate.source;
  return `"${title}", Wikipedia, revision ${revisionId} (retrieved ${fetchedAt}). ${url}`;
}

function clampScore(value: number): SurpriseScore['priorProbability'] {
  const n = Math.min(5, Math.max(1, Math.round(value)));
  return n as SurpriseScore['priorProbability'];
}

async function enrichOne(candidate: Candidate, index: number): Promise<Enriched | null> {
  const doc = await loadCached(candidate.slug);
  if (!doc) throw new Error(`'${candidate.slug}' is not cached — run npm run fetch`);

  const prompt = await loadPrompt('enrich', {
    fact: candidate.fact,
    passage: candidate.passage,
    title: candidate.source.title,
    document: doc.text,
  });

  const raw = await completeJson<RawEnrichment>({
    model: MODELS.enrich,
    prompt,
    temperature: 0.3,
  });

  const body = Array.isArray(raw.body) ? raw.body.filter(isNonEmptyString) : [];
  if (body.length === 0) return null;
  if (!isNonEmptyString(raw.whyItMatters)) return null;

  const factNumber = PIPELINE_ID_BASE + index;
  const id = `nf_${String(factNumber).padStart(4, '0')}`;
  const quiz = parseQuiz(raw.quiz, id);

  const fact: Fact = {
    id,
    country: candidate.country,
    category: candidate.category as Category,
    fact: candidate.fact,
    deepDive: {
      body: body.map((p) => p.trim()),
      whyItMatters: raw.whyItMatters.trim(),
      readTime:
        typeof raw.readTime === 'number' && raw.readTime > 0 ? Math.round(raw.readTime) : 1,
      suggestedQuestion: isNonEmptyString(raw.suggestedQuestion)
        ? raw.suggestedQuestion.trim()
        : 'What else is known about this?',
    },
    source: {
      name: candidate.source.title,
      url: candidate.source.url,
      // The passage was string-matched against the cached document by
      // verify.ts. That is what this flag means here — checked, not
      // asserted.
      verified: true,
    },
    // No image stage yet. Null is a real value in this schema, not a gap:
    // the typographic card is a designed variant, not a fallback.
    image: null,
    factNumber,
    relatedIds: [],
  };

  const entry: SourcedFact = {
    fact,
    provenance: {
      factId: id,
      origin: 'pipeline',
      sources: [
        {
          citation: citationFor(candidate),
          shortName: candidate.source.title,
          // Wikipedia is aggregation. The validator warns when a fact
          // rests on this alone, which is correct and stays visible.
          tier: 'reference',
          locator: {
            url: candidate.source.url,
            // Wikipedia has no DOI or ISBN. The revision id is the
            // stable identifier it does offer.
            archiveRef: `enwiki-revision-${candidate.source.revisionId}`,
          },
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
 * Render the enriched facts as a TypeScript file.
 *
 * Generated, and imported by `src/corpus/index.ts` so a hundred records
 * do not have to be moved across by hand. Never hand-edit it: the next
 * run overwrites the whole file. Review decisions are safe because they
 * live in `reviews.json`, keyed by fact id, not in here.
 */
function renderFile(results: Enriched[]): string {
  return `/**
 * Pipeline output, awaiting review.
 *
 * Generated by \`npm run enrich\` on ${new Date().toISOString().slice(0, 10)}.
 * Every entry is 'draft' until a reviewer says otherwise in the studio.
 *
 * This file is generated. Never edit it directly and never hand-author a
 * fact in here — the next \`npm run enrich\` overwrites the whole thing.
 * Review decisions are safe: they live in \`reviews.json\`, keyed by fact
 * id, so approving something here does not write back into this file.
 */

import type { SourcedFact } from './src/types/provenance';

export const enrichedFacts: SourcedFact[] = ${JSON.stringify(
    results.map((r) => r.entry),
    null,
    2,
  )};

export const enrichedQuiz = ${JSON.stringify(
    results.flatMap((r) => r.quiz),
    null,
    2,
  )};
`;
}

/**
 * The keep list.
 *
 * Triage verdicts live in the browser, so they are exported to
 * `_keeps.json` for this stage to read. With no such file, every
 * candidate is enriched — useful for a first run, wasteful afterwards.
 */
async function loadKeeps(): Promise<Set<string> | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(KEEPS_PATH, 'utf8'));
    if (!Array.isArray(parsed)) return null;
    const keys = parsed.filter((k): k is string => typeof k === 'string');
    return keys.length > 0 ? new Set(keys) : null;
  } catch {
    return null;
  }
}

/** Matches the key the triage page builds, so the two agree. */
function keyOf(candidate: Candidate): string {
  return `${candidate.slug}::${candidate.fact.slice(0, 60)}`;
}

async function main(): Promise<void> {
  const candidates = JSON.parse(await readFile(CANDIDATES_PATH, 'utf8')) as Candidate[];
  const keeps = await loadKeeps();

  const chosen = keeps ? candidates.filter((c) => keeps.has(keyOf(c))) : candidates;

  if (chosen.length === 0) {
    console.error(`\n  Nothing to enrich.`);
    console.error(`  Export your keeps from the triage page, or run extract first.\n`);
    process.exitCode = 1;
    return;
  }

  const plural = chosen.length === 1 ? '' : 's';
  console.log(`\n  Enriching ${chosen.length} fact${plural} with ${MODELS.enrich}`);
  console.log(`  ${keeps ? 'From your triage keeps.' : 'No keep list found — enriching everything.'}\n`);

  const results: Enriched[] = [];
  let n = 1;

  for (const candidate of chosen) {
    try {
      const enriched = await enrichOne(candidate, n);
      if (!enriched) {
        console.error(`  x ${candidate.fact.slice(0, 60)} — unusable enrichment`);
        continue;
      }
      results.push(enriched);
      console.log(
        `  + ${enriched.entry.fact.id}  ${enriched.quiz.length} quiz  ${candidate.fact.slice(0, 52)}`,
      );
      n += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  x ${candidate.fact.slice(0, 46)} — ${message}`);
    }
  }

  if (results.length === 0) {
    console.error(`\n  Nothing enriched. Leaving _enriched.ts alone.\n`);
    process.exitCode = 1;
    return;
  }

  await writeFile(ENRICHED_PATH, renderFile(results), 'utf8');

  console.log(`\n  ${results.length} enriched -> _enriched.ts`);
  console.log(`  ${results.reduce((sum, r) => sum + r.quiz.length, 0)} quiz questions`);
  console.log(`  All 'draft'. Review them at http://localhost:4321\n`);
}

if (process.argv[1]?.split(sep).at(-1) === 'enrich.ts') {
  void main();
}
