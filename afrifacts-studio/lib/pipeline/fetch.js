/**
 * Stage 1: get the document, keep it.
 *
 * The cache is not an optimisation, it is what makes verification
 * possible. The verifier string-matches every quoted passage against the
 * exact bytes the model was shown, so those bytes have to still exist
 * afterwards. It also means the extraction prompt can be rewritten and
 * re-run twenty times without refetching anything.
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { CACHE_DIR, ensureDirs } from '../paths.js';
import { readable } from './readable.js';
import { loadSources } from './sources.js';

/** Wikipedia asks for a real User-Agent that identifies the caller. */
const UA = 'AfriFacts-Studio/0.1 (content pipeline; contact via repo)';

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @typedef {object} CachedDoc
 * @property {string} slug
 * @property {string} title
 * @property {string} country
 * @property {string} tier
 * @property {import('./sources.js').SourceKind} kind
 * @property {string} url Canonical page URL, kept for the citation.
 * @property {string} revisionId Revision id. This is the stable locator
 *   Wikipedia offers: a page changes, but a revision never does, so this
 *   is what lets someone find the same words next year. Empty for a web
 *   page, which has no such thing — see `contentHash`.
 * @property {string} contentHash SHA-256 of the extracted text, first 16
 *   hex characters. What a revision id is for Wikipedia, computed rather
 *   than issued: it identifies the exact words the model was shown, so a
 *   challenge years later can be answered with "this is what the page
 *   said, and here is the proof it has not been edited since".
 * @property {string} [siteName] Publication name, for the citation.
 * @property {string} [doi] Declared by the page, when it declares one.
 * @property {string} [publishedAt] Declared by the page. ISO date.
 * @property {string} [wayback] An existing Internet Archive snapshot, if
 *   one exists. The locator that outlives the site.
 * @property {string} fetchedAt
 * @property {string} text
 */

/**
 * A fingerprint of the exact text, so a web page has a stable locator.
 *
 * CLAUDE.md §7: a URL alone is not enough, because URLs rot and a dead
 * link is indistinguishable from no source. Wikipedia answers that with
 * a revision id. A newspaper does not, so the pipeline computes the
 * nearest true equivalent: the words themselves, hashed. It cannot help
 * a reader find the page again — `wayback` is for that — but it settles
 * the question the passage actually raises, which is whether the quote
 * was really there.
 *
 * @param {string} text
 */
function hashOf(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

/** @param {string} slug */
export function cachePath(slug) {
  return join(CACHE_DIR, `${slug}.json`);
}

/**
 * @param {string} slug
 * @returns {Promise<CachedDoc | null>}
 */
export async function loadCached(slug) {
  try {
    return JSON.parse(await readFile(cachePath(slug), 'utf8'));
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
const BACK_MATTER =
  /^==+ *(References|Bibliography|Further reading|External links|See also|Notes|Sources|Citations) *=+/im;

/** @param {string} text */
function stripBackMatter(text) {
  const cut = text.search(BACK_MATTER);
  return cut === -1 ? text : text.slice(0, cut).trimEnd();
}

/**
 * Plain text of the whole article, not the lead summary.
 *
 * `explaintext` with no `exintro` is the point: the lead is the part
 * everybody has already read. The surprising sentences are buried in the
 * body.
 *
 * @param {import('./sources.js').SourceDoc} doc
 * @returns {Promise<CachedDoc>}
 */
export async function fetchArticle(doc) {
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

  const body = await res.json();
  const pages = body?.query?.pages ?? {};
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
    kind: 'wikipedia',
    url: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(doc.title)}`,
    revisionId: String(page.lastrevid ?? ''),
    contentHash: hashOf(text),
    fetchedAt: new Date().toISOString().slice(0, 10),
    text,
  };
}

/**
 * Is there an archived copy of this page, and where?
 *
 * Read-only and free: the availability API answers what the archive
 * already holds. Nothing here asks the archive to take a new snapshot —
 * that would be publishing the URL to a third party as a side effect of
 * adding a source, which is not what a fetch was asked to do.
 *
 * A failure is silence, not an error. An archived copy is a better
 * locator than a bare URL and its absence must not cost the fetch.
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
async function waybackFor(url) {
  try {
    const api = new URL('https://archive.org/wayback/available');
    api.searchParams.set('url', url);
    const res = await fetch(api, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return '';
    const body = await res.json();
    const snapshot = body?.archived_snapshots?.closest;
    return snapshot?.available ? String(snapshot.url ?? '') : '';
  } catch {
    return '';
  }
}

/**
 * Any other page on the web, reduced to the prose inside it.
 *
 * This is the half of "search the whole web" that is actual work. The
 * search only has to find a link; the pipeline has to be able to VERIFY
 * what it says, and verification means the exact text must still exist
 * afterwards and be string-matchable. So a web source is fetched once,
 * reduced to text by `readable.js`, and that text is what everything
 * downstream sees — the model, the verifier, the enricher.
 *
 * Three ways this refuses, all of them deliberate:
 *
 *   - Not HTML. A PDF is the commonest case and it is a real loss, since
 *     that is where the journal articles are. Extracting PDF text needs a
 *     dependency in the project that holds the LLM keys, so it is a
 *     decision to take on its own rather than smuggle in here.
 *   - Under 600 characters of prose. Almost always a page that renders
 *     its body in JavaScript, or a paywall. Better rejected loudly than
 *     extracted from a loading spinner.
 *   - A redirect that landed somewhere else entirely. Recorded rather
 *     than refused, the same way `landedOn` reports a Wikipedia redirect.
 *
 * @param {import('./sources.js').SourceDoc} doc
 * @returns {Promise<CachedDoc>}
 */
export async function fetchWebPage(doc) {
  if (!doc.url) throw new Error(`'${doc.title}' has no URL to fetch.`);

  let res = await fetch(doc.url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
  });
  for (let attempt = 1; (res.status === 429 || res.status >= 500) && attempt <= 2; attempt += 1) {
    await sleep(2000 * attempt);
    res = await fetch(doc.url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
  }
  if (!res.ok) throw new Error(`${new URL(doc.url).hostname} returned ${res.status}.`);

  const type = res.headers.get('content-type') ?? '';
  if (!/text\/html|application\/xhtml|text\/plain/i.test(type)) {
    throw new Error(
      `Not a readable page — it is ${type.split(';')[0] || 'an unknown type'}. ` +
        'The fetcher reads HTML only; a PDF needs a text layer the studio cannot extract yet.',
    );
  }

  const landed = res.url || doc.url;
  const page = readable(await res.text(), landed);

  if (page.text.length < 600) {
    throw new Error(
      `Only ${page.text.length} characters of prose came back. ` +
        'The page probably renders its body in JavaScript, or is behind a paywall.',
    );
  }

  /*
    Length alone is not enough, measured.

    A homepage of headlines cleared 600 characters comfortably: cbn.gov.ng
    returned 663 characters of link text and would have been accepted as a
    document. Nothing downstream could then tell that it was a menu — the
    model would be shown a list of press-release titles and the verifier
    would confirm every one of them is really in the document, because it
    is.

    Sentences are what separates the two. Three lines of eighty characters
    ending in a full stop is a low bar for any article and one a link list
    almost never clears.
  */
  const sentences = page.text
    .split('\n')
    .filter((line) => line.length >= 80 && /[.!?]["')\]]?$/.test(line)).length;
  if (sentences < 3) {
    throw new Error(
      `${page.text.length} characters came back but only ${sentences} of them form sentences. ` +
        'This looks like a homepage or a link list, not an article.',
    );
  }

  const wayback = await waybackFor(landed);

  return {
    slug: doc.slug,
    // The page's own title, not the one guessed from the URL slug. This
    // is what goes on the citation and on the fact card.
    title: page.title || doc.title,
    country: doc.country,
    tier: doc.tier,
    kind: 'web',
    url: landed,
    revisionId: '',
    contentHash: hashOf(page.text),
    siteName: page.siteName,
    doi: page.doi,
    publishedAt: page.publishedAt,
    wayback,
    fetchedAt: new Date().toISOString().slice(0, 10),
    text: page.text,
  };
}

/**
 * Whichever fetcher this source needs.
 *
 * @param {import('./sources.js').SourceDoc} doc
 * @returns {Promise<CachedDoc>}
 */
export function fetchDoc(doc) {
  return doc.kind === 'web' ? fetchWebPage(doc) : fetchArticle(doc);
}

/**
 * @typedef {object} FetchSummary
 * @property {number} fetched
 * @property {number} skipped
 * @property {number} failed
 * @property {{ slug: string, status: 'fetched' | 'cached' | 'failed', detail: string }[]} rows
 */

/**
 * Fetch every seed article that is not already cached.
 *
 * @param {{ force?: boolean }} [options]
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<FetchSummary>}
 */
export async function runFetch(options = {}, onProgress) {
  const { force = false } = options;
  await ensureDirs();

  const sources = await loadSources();
  const say = onProgress ?? (() => {});

  /** @type {FetchSummary} */
  const summary = { fetched: 0, skipped: 0, failed: 0, rows: [] };

  say(`Fetching ${sources.length} sources into _cache/`);

  for (const doc of sources) {
    if (!force) {
      const existing = await loadCached(doc.slug);
      if (existing) {
        summary.skipped += 1;
        summary.rows.push({
          slug: doc.slug,
          status: 'cached',
          detail: `${existing.text.length} chars`,
        });
        say(`· ${doc.slug.padEnd(16)} cached, ${existing.text.length} chars`);
        continue;
      }
    }
    try {
      const cached = await fetchDoc(doc);
      await sleep(400);
      await writeFile(cachePath(doc.slug), JSON.stringify(cached, null, 2), 'utf8');
      summary.fetched += 1;
      // The locator is what makes the fetch worth anything, so it is what
      // the line reports: a revision for Wikipedia, the content hash for
      // everything else.
      const locator =
        cached.kind === 'web' ? `${cached.tier}, #${cached.contentHash}` : `rev ${cached.revisionId}`;
      summary.rows.push({
        slug: doc.slug,
        status: 'fetched',
        detail: `${cached.text.length} chars, ${locator}`,
      });
      say(`✓ ${doc.slug.padEnd(16)} ${cached.text.length} chars, ${locator}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.failed += 1;
      summary.rows.push({ slug: doc.slug, status: 'failed', detail: message });
      say(`✗ ${doc.slug.padEnd(16)} ${message}`);
    }
  }

  say(`${summary.fetched} fetched, ${summary.skipped} already cached, ${summary.failed} failed`);
  return summary;
}
