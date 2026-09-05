/**
 * Stage 1: get the document, keep it.
 *
 * The cache is not an optimisation, it is what makes verification
 * possible. The verifier string-matches every quoted passage against the
 * exact bytes the model was shown, so those bytes have to still exist
 * afterwards. It also means the extraction prompt can be rewritten and
 * re-run twenty times without refetching anything.
 *
 * `npm run fetch`
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, sep } from 'node:path';
import { SOURCES, type SourceDoc } from './sources';

const here = dirname(fileURLToPath(import.meta.url));
export const CACHE_DIR = join(here, '..', '..', '_cache');

/** Wikipedia asks for a real User-Agent that identifies the caller. */
const UA = 'AfriFacts-Factory/0.1 (content pipeline; contact via repo)';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export interface CachedDoc {
  slug: string;
  title: string;
  country: string;
  tier: string;
  /** Canonical page URL, kept for the citation. */
  url: string;
  /**
   * Revision id. This is the stable locator Wikipedia offers: a page
   * changes, but a revision never does, so this is what lets someone
   * find the same words next year.
   */
  revisionId: string;
  fetchedAt: string;
  text: string;
}

export function cachePath(slug: string): string {
  return join(CACHE_DIR, `${slug}.json`);
}

export async function loadCached(slug: string): Promise<CachedDoc | null> {
  try {
    return JSON.parse(await readFile(cachePath(slug), 'utf8')) as CachedDoc;
  } catch {
    return null;
  }
}

/**
 * Drop the reference apparatus.
 *
 * The plain-text extract carries References, Bibliography and External
 * links, which are dense with numbers and proper nouns and read to a
 * model exactly like body prose. A "fact" quoted out of a bibliography
 * line is a citation, not a claim. Cheaper to cut here than to filter
 * downstream, and it shrinks every prompt.
 */
const BACK_MATTER = /^==+ *(References|Bibliography|Further reading|External links|See also|Notes|Sources|Citations) *=+/im;

function stripBackMatter(text: string): string {
  const cut = text.search(BACK_MATTER);
  return cut === -1 ? text : text.slice(0, cut).trimEnd();
}

interface ExtractQuery {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        extract?: string;
        lastrevid?: number;
        fullurl?: string;
        missing?: string;
      }
    >;
  };
}

/**
 * Plain text of the whole article, not the lead summary.
 *
 * `explaintext` with no `exintro` is the point: the lead is the part
 * everybody has already read. The surprising sentences are buried in the
 * body, which is exactly what the user observed about Wikipedia.
 */
async function fetchArticle(doc: SourceDoc): Promise<CachedDoc> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('prop', 'extracts|info');
  url.searchParams.set('inprop', 'url');
  url.searchParams.set('explaintext', '1');
  url.searchParams.set('redirects', '1');
  url.searchParams.set('titles', doc.title);

  // Wikipedia rate-limits a burst of requests with 429. A short wait and
  // a retry is what it is asking for, and 36 articles is a small ask made
  // impolitely rather than a large one.
  let res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  for (let attempt = 1; res.status === 429 && attempt <= 3; attempt += 1) {
    await sleep(2000 * attempt);
    res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  }
  if (!res.ok) throw new Error(`Wikipedia returned ${res.status} for '${doc.title}'.`);

  const body = (await res.json()) as ExtractQuery;
  const pages = body.query?.pages ?? {};
  const page = Object.values(pages)[0];

  if (!page || page.missing !== undefined) {
    throw new Error(`No such Wikipedia article: '${doc.title}'.`);
  }
  const text = stripBackMatter(page.extract ?? '');
  if (text.trim().length < 500) {
    throw new Error(`'${doc.title}' came back with almost no text (${text.length} chars).`);
  }

  return {
    slug: doc.slug,
    title: page.title ?? doc.title,
    country: doc.country,
    tier: doc.tier,
    url: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(doc.title)}`,
    revisionId: String(page.lastrevid ?? ''),
    fetchedAt: new Date().toISOString().slice(0, 10),
    text,
  };
}

async function main(): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  const refetch = process.argv.includes('--force');

  console.log(`\n  Fetching ${SOURCES.length} sources into _cache/\n`);
  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of SOURCES) {
    if (!refetch) {
      const existing = await loadCached(doc.slug);
      if (existing) {
        console.log(`  · ${doc.slug.padEnd(16)} cached, ${existing.text.length} chars`);
        skipped += 1;
        continue;
      }
    }
    try {
      const cached = await fetchArticle(doc);
      await sleep(400);
      await writeFile(cachePath(doc.slug), JSON.stringify(cached, null, 2), 'utf8');
      console.log(`  ✓ ${doc.slug.padEnd(16)} ${cached.text.length} chars, rev ${cached.revisionId}`);
      fetched += 1;
    } catch (error) {
      console.error(`  ✗ ${doc.slug.padEnd(16)} ${String(error instanceof Error ? error.message : error)}`);
      failed += 1;
    }
  }

  console.log(`\n  ${fetched} fetched, ${skipped} already cached, ${failed} failed`);
  console.log(`  --force to refetch everything\n`);
  if (failed > 0) process.exitCode = 1;
}

// Only run when invoked directly; other stages import loadCached from here.
if (process.argv[1]?.split(sep).at(-1) === 'fetch.ts') {
  void main();
}
