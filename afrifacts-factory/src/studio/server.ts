/**
 * The review dashboard's server. `npm run studio`.
 *
 * Local only, on purpose: it binds to 127.0.0.1, has no auth, and reads
 * the corpus straight off disk. It is a tool for one reviewer at one desk,
 * not a deployment. `afrifacts-admin/` is the hosted version, later.
 *
 * Node's own http module, no framework — the whole surface is four routes,
 * and a dependency here would be a dependency in the project that holds
 * the LLM keys.
 */

import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { corpus } from '../corpus';
import { CANDIDATES_PATH, REJECTS_PATH } from '../pipeline/extract';
import { KEEPS_PATH } from '../pipeline/enrich';
import { EXEMPLARS } from '../calibration/exemplars';
import { validate, type Problem } from '../validate';
import { effectiveReview, loadReviews, saveReview, REVIEWS_PATH } from './reviews';
import {
  creditFor,
  findCandidate,
  loadImages,
  loadPool,
  saveImageDecision,
  IMAGES_PATH,
  type ImageStatus,
} from './images';
import type { Review, ReviewStatus, SourcedFact } from '../types/provenance';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = 4321;

/** What the dashboard renders for one fact. */
interface FactView {
  id: string;
  category: string;
  country: string;
  fact: string;
  factNumber: number;
  status: ReviewStatus;
  reviewer: string;
  reviewedAt: string;
  notes: string;
  /** Blocking problems and soft ones, separated so the UI can rank them. */
  errors: Problem[];
  warnings: Problem[];
  /** True when nothing blocks it, so approving is a real option. */
  clean: boolean;
  surprise: { priorProbability: number; specificity: number; explicability: number };
  decay: { kind: string; reviewBy?: string };
  sources: {
    shortName: string;
    citation: string;
    tier: string;
    passage: string;
    /** A passage that is missing or still a placeholder, flagged for the UI. */
    passageMissing: boolean;
    locator: Record<string, string>;
    note?: string;
  }[];
  deepDive: { body: string[]; whyItMatters: string; readTime: number };
}

const PLACEHOLDER = /^\s*(todo|tbd|fixme|xxx|placeholder|\.\.\.|-)\b/i;

function isFilledIn(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER.test(trimmed);
}

function toView(entry: SourcedFact, review: Review): FactView {
  const problems = validate(entry);
  const errors = problems.filter((p) => p.level === 'error');

  return {
    id: entry.fact.id,
    category: entry.fact.category,
    country: entry.fact.country,
    fact: entry.fact.fact,
    factNumber: entry.fact.factNumber,
    status: review.status,
    reviewer: review.reviewer,
    reviewedAt: review.reviewedAt,
    notes: review.notes ?? '',
    errors,
    warnings: problems.filter((p) => p.level === 'warning'),
    clean: errors.length === 0,
    surprise: entry.provenance.surprise,
    decay: entry.provenance.decay,
    sources: entry.provenance.sources.map((source) => ({
      shortName: source.shortName,
      citation: source.citation,
      tier: source.tier,
      passage: source.passage,
      passageMissing: !isFilledIn(source.passage),
      locator: Object.fromEntries(
        Object.entries(source.locator).filter(([, v]) => typeof v === 'string' && v.length > 0),
      ) as Record<string, string>,
      ...(source.note ? { note: source.note } : {}),
    })),
    deepDive: {
      body: entry.fact.deepDive.body,
      whyItMatters: entry.fact.deepDive.whyItMatters,
      readTime: entry.fact.deepDive.readTime,
    },
  };
}

async function buildPayload(): Promise<{ facts: FactView[]; reviewsPath: string }> {
  const store = await loadReviews();
  return {
    facts: corpus.map((entry) =>
      toView(entry, effectiveReview(entry.fact.id, entry.provenance.review, store)),
    ),
    reviewsPath: REVIEWS_PATH,
  };
}

/**
 * The image queue.
 *
 * One row per fact that has a decision or a pool to choose from. The
 * article is carried through so the page can offer the rest of that
 * article's images as alternatives — the reviewer's real question is
 * usually "not that one, but what about this one", and a queue that only
 * says yes or no cannot answer it.
 */
async function buildImagePayload(): Promise<unknown> {
  const [images, pool] = await Promise.all([loadImages(), loadPool()]);

  const rows = corpus
    .map((entry) => {
      const source = entry.provenance.sources[0];
      const article = source?.shortName ?? '';
      const candidates = pool[article] ?? [];
      const decision = images[entry.fact.id];

      // Nothing to show and nothing to choose from.
      if (!decision && candidates.length === 0) return null;

      const chosen = decision ? findCandidate(pool, decision.file) : null;

      return {
        factId: entry.fact.id,
        fact: entry.fact.fact,
        category: entry.fact.category,
        article,
        status: decision?.status ?? 'none',
        reasoning: decision?.reasoning ?? '',
        decidedBy: decision?.decidedBy ?? '',
        decidedAt: decision?.decidedAt ?? '',
        chosen: chosen ? { ...chosen, credit: creditFor(chosen) } : null,
        // The pool for this fact's article, so a swap needs no second call.
        pool: candidates.map((c) => ({ ...c, credit: creditFor(c) })),
      };
    })
    .filter((row) => row !== null);

  /** Which images are already spoken for, so the page can grey them out. */
  const taken: Record<string, string> = {};
  for (const [factId, decision] of Object.entries(images)) {
    if (decision.status === 'rejected' || decision.file.length === 0) continue;
    taken[decision.file] = factId;
  }

  return { rows, taken, imagesPath: IMAGES_PATH };
}

/** A pipeline file that does not exist yet is an empty list, not an error. */
async function readJsonArray(path: string): Promise<unknown[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function json(res: import('node:http').ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readBody(req: import('node:http').IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    // A review note is a paragraph, not a payload. Cap it rather than
    // buffering whatever arrives.
    if (size > 64_000) throw new Error('Request body too large.');
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer((req, res) => {
  void (async () => {
    try {
      const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        const html = await readFile(join(here, 'index.html'), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(html);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/triage') {
        const html = await readFile(join(here, 'triage.html'), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(html);
        return;
      }

      /**
       * Candidates are pipeline output, not corpus. They are served from
       * the JSON the extract stage wrote, read fresh on every request so a
       * re-run shows up on refresh. Nothing here can write to them: a
       * triage note is not a review decision.
       */
      if (req.method === 'GET' && url.pathname === '/api/candidates') {
        /**
         * The founder's own 22 facts ride alongside the extracted ones.
         * They are the template the pipeline aims at, and they are also
         * candidates in their own right - but every one still needs a
         * source and a passage before it can ship, so they are marked
         * rather than mixed in silently.
         */
        const exemplarsAsCandidates = EXEMPLARS.map((e) => ({
          slug: 'founder',
          fact: e.text,
          passage: '',
          category: e.category,
          surprise: { priorProbability: 5, specificity: 4, explicability: 4 },
          reasoning: e.works,
          volatile: e.sourcing === 'volatile',
          country: 'NG',
          needsSourcing: e.sourcing,
          source: {
            title: 'Written by the founder',
            url: '',
            revisionId: String(e.n),
            tier: 'unsourced',
            fetchedAt: '',
          },
        }));

        json(res, 200, {
          candidates: [
            ...exemplarsAsCandidates,
            ...(await readJsonArray(CANDIDATES_PATH)),
          ],
          rejectedCount: (await readJsonArray(REJECTS_PATH)).length,
          candidatesPath: CANDIDATES_PATH,
        });
        return;
      }

      /**
       * Triage verdicts live in the browser, which is right for a note
       * that is not a review decision. But `npm run enrich` needs them on
       * disk, so the page posts its keep list here rather than making the
       * reviewer copy anything by hand.
       */
      if (req.method === 'POST' && url.pathname === '/api/keeps') {
        const body = await readBody(req);
        const keys = (body as { keys?: unknown })?.keys;
        if (!Array.isArray(keys) || !keys.every((k) => typeof k === 'string')) {
          json(res, 400, { error: 'Expected { keys: string[] }.' });
          return;
        }
        await writeFile(KEEPS_PATH, JSON.stringify(keys, null, 2), 'utf8');
        json(res, 200, { saved: keys.length, path: KEEPS_PATH });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/images') {
        const html = await readFile(join(here, 'images.html'), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(html);
        return;
      }

      /**
       * The image queue: every fact the harvest stage proposed a picture
       * for, plus the rest of its article's pool so the reviewer can swap
       * the pick rather than only accept or refuse it.
       */
      if (req.method === 'GET' && url.pathname === '/api/images') {
        json(res, 200, await buildImagePayload());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/image') {
        const body = await readBody(req);
        const { factId, status, file, decidedBy } = (body ?? {}) as Record<string, unknown>;

        if (typeof factId !== 'string' || !corpus.some((e) => e.fact.id === factId)) {
          json(res, 400, { error: 'Unknown fact id.' });
          return;
        }
        if (status !== 'proposed' && status !== 'accepted' && status !== 'rejected') {
          json(res, 400, { error: 'Unknown status.' });
          return;
        }

        const who = typeof decidedBy === 'string' ? decidedBy.trim() : '';
        // Same rule as a fact approval: a decision that ships something is
        // attributable, or it is not a decision.
        if (status === 'accepted' && who.length === 0) {
          json(res, 400, { error: 'Accepting an image needs a reviewer name.' });
          return;
        }

        const chosen = typeof file === 'string' ? file : '';
        if (status === 'accepted') {
          const pool = await loadPool();
          // An accepted image must exist in the pool, because that is the
          // only place a licence-checked record for it lives.
          if (findCandidate(pool, chosen) === null) {
            json(res, 400, { error: 'That file is not in the licence-checked pool.' });
            return;
          }
        }

        await saveImageDecision(factId, {
          status: status as ImageStatus,
          file: chosen,
          reasoning:
            typeof (body as Record<string, unknown>).reasoning === 'string'
              ? String((body as Record<string, unknown>).reasoning)
              : '',
          decidedBy: who,
          decidedAt: new Date().toISOString().slice(0, 10),
        });

        json(res, 200, await buildImagePayload());
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/facts') {
        json(res, 200, await buildPayload());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/review') {
        const body = await readBody(req);
        const { factId, status, reviewer, notes } = (body ?? {}) as Record<string, unknown>;

        if (typeof factId !== 'string' || !corpus.some((e) => e.fact.id === factId)) {
          json(res, 400, { error: 'Unknown fact id.' });
          return;
        }
        if (
          status !== 'draft' &&
          status !== 'approved' &&
          status !== 'rejected' &&
          status !== 'needs-work'
        ) {
          json(res, 400, { error: 'Unknown status.' });
          return;
        }

        // An approval is attributable or it is not an approval. The
        // validator says the same thing; saying it here too means the
        // dashboard cannot write a record that `check` then rejects.
        const who = typeof reviewer === 'string' ? reviewer.trim() : '';
        if (status === 'approved' && who.length === 0) {
          json(res, 400, { error: 'An approval needs a reviewer name.' });
          return;
        }

        const review: Review = {
          status,
          reviewer: who,
          reviewedAt: new Date().toISOString().slice(0, 10),
          ...(typeof notes === 'string' && notes.trim().length > 0
            ? { notes: notes.trim() }
            : {}),
        };

        await saveReview(factId, review);
        json(res, 200, await buildPayload());
        return;
      }

      json(res, 404, { error: 'Not found.' });
    } catch (error) {
      json(res, 500, { error: String(error) });
    }
  })();
});

/**
 * A port clash is the expected failure here — a studio left open in
 * another terminal — so it gets an answer rather than a stack trace.
 */
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.`);
    console.error(`  A studio is probably already running — try http://localhost:${PORT} first.`);
    console.error(`  If not, close it with:  npx kill-port ${PORT}\n`);
    process.exit(1);
  }
  throw error;
});

// Ctrl-C should release the port, not leave it held by a stray child.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  AfriFacts review studio`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  ${corpus.length} fact${corpus.length === 1 ? '' : 's'} in the corpus`);
  console.log(`  decisions saved to reviews.json`);
  console.log(`  ctrl-c to stop\n`);
});
