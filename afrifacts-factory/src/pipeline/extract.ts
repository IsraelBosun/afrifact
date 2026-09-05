/**
 * Stage 2 and 3 together: ask the model, then check its answer.
 *
 * `npm run extract` runs every cached document.
 * `npm run extract -- nok` runs one.
 *
 * Nothing here trusts the model. Every candidate it returns is put
 * through verify.ts, which uses no model, and through the surprise
 * threshold the corpus is already held to. What survives is written to
 * _candidates.json for the enrich stage; what does not is written to
 * _rejects.json with the reason.
 *
 * Rejects are kept on purpose. The bar is not calibrated yet, and a
 * filter that is silently too harsh looks identical to Nigeria being
 * short of surprising facts. The only way to tell those apart is to read
 * what was thrown away.
 */

import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, sep } from 'node:path';
import { completeJson, loadPrompt, MODELS } from '../llm';
import { CACHE_DIR, loadCached, type CachedDoc } from './fetch';
import { verify } from './verify';
import { dedupe } from './dedupe';
import { exemplarsForPrompt } from '../calibration/exemplars';
import { SURPRISE_THRESHOLD } from '../types/provenance';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
export const CANDIDATES_PATH = join(ROOT, '_candidates.json');
export const REJECTS_PATH = join(ROOT, '_rejects.json');
export const CULLED_PATH = join(ROOT, '_culled.json');

const CATEGORIES = ['History', 'Business', 'Culture', 'Food', 'Sports'] as const;
type Category = (typeof CATEGORIES)[number];

/** What the model is asked to return, before anything is believed. */
interface RawCandidate {
  fact?: unknown;
  passage?: unknown;
  category?: unknown;
  surprise?: { priorProbability?: unknown; specificity?: unknown; explicability?: unknown };
  reasoning?: unknown;
  volatile?: unknown;
}

/** A candidate that survived every check. */
export interface Candidate {
  slug: string;
  fact: string;
  passage: string;
  category: Category;
  surprise: { priorProbability: number; specificity: number; explicability: number };
  reasoning: string;
  volatile: boolean;
  /** Copied from the cache so the enrich stage needs no second fetch. */
  source: { title: string; url: string; revisionId: string; tier: string; fetchedAt: string };
  country: string;
}

export interface Reject {
  slug: string;
  fact: string;
  passage: string;
  reasons: string[];
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

type ParsedCandidate = Omit<Candidate, 'slug' | 'source' | 'country'>;

/**
 * Shape-check before verifying.
 *
 * A model returning valid JSON of the wrong shape is the normal failure,
 * not the rare one, so this runs before anything reads the fields.
 */
function parseCandidate(
  raw: RawCandidate,
): { ok: true; value: ParsedCandidate } | { ok: false; reason: string } {
  const { fact, passage, category, surprise, reasoning, volatile } = raw;

  if (typeof fact !== 'string' || fact.trim().length === 0) {
    return { ok: false, reason: 'No fact text.' };
  }
  if (typeof passage !== 'string' || passage.trim().length === 0) {
    return { ok: false, reason: 'No passage.' };
  }
  if (typeof category !== 'string' || !CATEGORIES.includes(category as Category)) {
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
      category: category as Category,
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

/** Which axes fall below the bar the corpus is already held to. */
function belowBar(surprise: Candidate['surprise']): string[] {
  const axes: [string, number][] = [
    ['priorProbability', surprise.priorProbability],
    ['specificity', surprise.specificity],
    ['explicability', surprise.explicability],
  ];
  return axes
    .filter(([, score]) => score < SURPRISE_THRESHOLD)
    .map(([axis, score]) => `Scores ${score} on ${axis}, below the bar of ${SURPRISE_THRESHOLD}.`);
}

async function extractFrom(doc: CachedDoc): Promise<{ kept: Candidate[]; rejected: Reject[] }> {
  const prompt = await loadPrompt('extract', {
    title: doc.title,
    source: `Wikipedia, revision ${doc.revisionId}, fetched ${doc.fetchedAt}`,
    document: doc.text,
    exemplars: exemplarsForPrompt(),
  });

  const response = await completeJson<{ facts?: RawCandidate[] }>({
    model: MODELS.extract,
    prompt,
    temperature: 0,
  });

  const kept: Candidate[] = [];
  const rejected: Reject[] = [];
  const raws = Array.isArray(response.facts) ? response.facts : [];

  for (const raw of raws) {
    const parsed = parseCandidate(raw);
    if (!parsed.ok) {
      rejected.push({
        slug: doc.slug,
        fact: typeof raw.fact === 'string' ? raw.fact : '(unparseable)',
        passage: typeof raw.passage === 'string' ? raw.passage : '',
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
        revisionId: doc.revisionId,
        tier: doc.tier,
        fetchedAt: doc.fetchedAt,
      },
    });
  }

  return { kept, rejected };
}

async function cachedSlugs(): Promise<string[]> {
  const files = await readdir(CACHE_DIR);
  return files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
}

async function main(): Promise<void> {
  const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const slugs = asked.length > 0 ? asked : await cachedSlugs();

  const kept: Candidate[] = [];
  const rejected: Reject[] = [];

  const plural = slugs.length === 1 ? '' : 's';
  console.log(`\n  Extracting from ${slugs.length} document${plural} with ${MODELS.extract}\n`);

  for (const slug of slugs) {
    const doc = await loadCached(slug);
    if (!doc) {
      console.error(`  x ${slug.padEnd(16)} not cached - run npm run fetch`);
      continue;
    }
    try {
      const result = await extractFrom(doc);
      kept.push(...result.kept);
      rejected.push(...result.rejected);
      const k = String(result.kept.length).padStart(2);
      const r = String(result.rejected.length).padStart(2);
      console.log(`  + ${slug.padEnd(16)} ${k} kept, ${r} rejected`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  x ${slug.padEnd(16)} ${message}`);
    }
  }

  // A run where every document failed - an expired quota, a dead network -
  // must not overwrite good candidates with an empty list. Triage work is
  // the expensive thing here, and it is keyed to what is in this file.
  if (kept.length === 0 && rejected.length === 0) {
    console.error(`
  Every document failed. Leaving existing candidates alone.
`);
    process.exitCode = 1;
    return;
  }

  // Cull before writing. 320 candidates is not ten times more knowledge
  // than 32, it is the same findings restated, and nobody can triage it.
  const { kept: survivors, culled } = dedupe(kept);

  await writeFile(CANDIDATES_PATH, JSON.stringify(survivors, null, 2), 'utf8');
  await writeFile(REJECTS_PATH, JSON.stringify(rejected, null, 2), 'utf8');
  await writeFile(CULLED_PATH, JSON.stringify(culled, null, 2), 'utf8');

  console.log(`
  ${kept.length} passed the verifier`);
  console.log(`  ${culled.length} culled as duplicate, capped or inert -> _culled.json`);
  console.log(`  ${survivors.length} candidates -> _candidates.json`);
  console.log(`  ${rejected.length} failed the verifier -> _rejects.json
`);
}

if (process.argv[1]?.split(sep).at(-1) === 'extract.ts') {
  void main();
}
