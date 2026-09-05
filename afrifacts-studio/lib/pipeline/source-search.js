/**
 * Finding source documents from a description instead of a link.
 *
 * The seed list took a URL or an exact article title, which meant adding
 * a source required already knowing which page you wanted. That is fine
 * for the twenty monographs someone has in mind and useless for "what is
 * there about Nigerian railways" — a question with an answer, that the
 * studio could not be asked.
 *
 * WHAT THIS SEARCHES FOR, AND WHAT IT DOES NOT.
 *
 * It finds **documents**, never facts. That distinction is the whole of
 * CLAUDE.md §7: a fact is extracted from a source and keeps the passage
 * it came from, quoted verbatim, and the verifier string-matches that
 * passage against the exact bytes in `_cache/`. A model asked "tell me
 * about Fela Kuti" answers from its own memory, which produces text with
 * no passage behind it and nothing that can check it. So the search
 * returns articles for you to choose from, and every fact that follows
 * still comes out of the extractor with a quote and a revision id.
 *
 * That also keeps §7's other rule intact. "Never automate the choosing"
 * is about judgement, not typing: which twenty pages are worth mining is
 * the leverage, and it stays yours. What is automated here is the
 * finding, which was only ever a trip to a browser tab.
 *
 * WIKIPEDIA, AND THEN EVERYWHERE ELSE.
 *
 * This searched English Wikipedia and nothing else for most of its life,
 * for a good reason: the pipeline can only verify what it can re-read.
 * `fetch` pulled plain text keyed by a revision id, the verifier compared
 * against those exact bytes, and the locator on every source was that
 * revision. No other site offers a revision id.
 *
 * The cost of that was one number: every fact in the corpus was tier
 * `reference`, and `validate()` warns on any fact resting on `reference`
 * alone. 150 warnings is not a safety net, it is wallpaper. A corpus that
 * can reach a journal or a statistics bureau can actually clear that bar
 * rather than permanently failing it.
 *
 * So the search now runs two engines and merges them:
 *
 *   1. Wikipedia's own search. Free, unmetered, always run, always
 *      ranked first — not because it is the strongest evidence but
 *      because it is the only source re-readable at a fixed revision.
 *   2. Google, through SerpApi, which costs one search from a plan of
 *      250 a month and is therefore cached in `data/` forever.
 *
 * And the model does the two jobs it is good at, both cheap: turning a
 * description into queries a search engine can use, and reading titles
 * and snippets to say which results are documents worth mining. It does
 * NOT decide what is trustworthy — `source-trust.js` does that from the
 * hostname, in code, for the same reason there is no model in the
 * verifier.
 *
 * What has not changed is the rule underneath all of it. This finds
 * DOCUMENTS, never facts. A model asked "tell me about Fela Kuti"
 * answers from memory, which produces text with no passage behind it and
 * nothing that can check it. Every fact still comes out of the extractor
 * with a verbatim quote, string-matched against a document on disk.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { MODELS, completeJson, envValue, loadPrompt } from '../llm/index.js';
import { SOURCE_SEARCH_CACHE_PATH } from '../paths.js';
import { UA } from './harvest-images.js';
import { byTrust, hostOf, trustOf } from './source-trust.js';

/** A page that is a list of other pages is not a source. */
const NOT_AN_ARTICLE = /^(list of|index of|outline of|timeline of|glossary of)\b/i;

/**
 * @typedef {object} FoundArticle
 * @property {string} title Exact article title — what `addSource` takes.
 * @property {string} summary First couple of sentences, plain text.
 * @property {number} words Article length. A stub has little to extract.
 * @property {boolean} disambiguation A menu of articles, not an article.
 * @property {string} url The article, for a look before you commit.
 * @property {import('./sources.js').SourceKind} kind Which fetcher reads it.
 * @property {string} host
 * @property {import('./source-trust.js').TrustVerdict} trust
 * @property {string} [why] The model's one clause on what the document is.
 */

/** @param {string} html */
function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search English Wikipedia for articles matching a description.
 *
 * One request. `generator=search` runs the search and then reports
 * properties of the results, so the intro text and the disambiguation
 * flag arrive with the hit rather than needing a call each.
 *
 * @param {string} text
 * @param {number} limit
 * @returns {Promise<FoundArticle[]>}
 */
export async function searchArticles(text, limit = 15) {
  const term = String(text ?? '').trim();
  if (term.length < 3) return [];

  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', term);
  url.searchParams.set('gsrnamespace', '0');
  url.searchParams.set('gsrlimit', String(limit));
  url.searchParams.set('prop', 'extracts|pageprops|info');
  url.searchParams.set('exintro', '1');
  url.searchParams.set('explaintext', '1');
  url.searchParams.set('exsentences', '2');
  url.searchParams.set('ppprop', 'disambiguation');
  url.searchParams.set('inprop', 'url');

  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Wikipedia search returned ${res.status}.`);
  const body = await res.json();

  const pages = Object.values(body?.query?.pages ?? {});

  /*
    Search rank, not page id.

    `query.pages` is keyed by page id, so Object.values comes back in an
    order that has nothing to do with relevance. The API puts the rank in
    `index`, and without honouring it the best match arrives fourth for
    no visible reason.
  */
  pages.sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));

  /** @type {FoundArticle[]} */
  const out = [];
  for (const page of pages) {
    const title = String(page?.title ?? '');
    if (title.length === 0) continue;
    if (NOT_AN_ARTICLE.test(title)) continue;

    const url = String(
      page?.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    );
    out.push({
      title,
      summary: stripHtml(page?.extract ?? '').slice(0, 300),
      words: Number(page?.length) > 0 ? Math.round(Number(page.length) / 6) : 0,
      disambiguation: page?.pageprops?.disambiguation !== undefined,
      url,
      kind: 'wikipedia',
      host: 'en.wikipedia.org',
      trust: trustOf(url),
    });
  }
  return out;
}

/* ---- the open web ---------------------------------------------------- */

/**
 * Cache every paid query, forever.
 *
 * Same argument as the image search cache and the ledger: 250 searches a
 * month means a repeated query is not a small inefficiency, it is a
 * percent of the month spent to receive an answer already on disk.
 * Retyping a description, reloading the page, or coming back to the same
 * subject tomorrow would each have cost one.
 *
 * @typedef {{ at: string, queries: string[], results: FoundArticle[] }} CachedSourceSearch
 */

/** @param {string} query */
function cacheKey(query) {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** @returns {Promise<Record<string, CachedSourceSearch>>} */
async function loadCache() {
  try {
    const parsed = JSON.parse(await readFile(SOURCE_SEARCH_CACHE_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** @param {string} query @param {CachedSourceSearch} entry */
async function remember(query, entry) {
  const cache = await loadCache();
  cache[cacheKey(query)] = entry;
  await mkdir(dirname(SOURCE_SEARCH_CACHE_PATH), { recursive: true });
  await writeFile(SOURCE_SEARCH_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One Google web search through SerpApi.
 *
 * `engine=google` rather than `google_images` — a different engine on the
 * same key and the same quota. Everything usable is kept rather than the
 * first ten, for the reason the image search keeps everything: there is
 * no cheap second look at a query, so the first look takes all of it.
 *
 * @param {string} query
 * @returns {Promise<FoundArticle[]>}
 */
async function googleOnce(query) {
  const key = await envValue('SERPAPI_KEY');
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', key);
  url.searchParams.set('num', '20');
  url.searchParams.set('hl', 'en');

  let res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  for (let attempt = 1; (res.status === 429 || res.status >= 500) && attempt <= 2; attempt += 1) {
    await sleep(1500 * attempt);
    res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  }
  if (!res.ok) throw new Error(`SerpApi returned ${res.status}.`);

  const body = await res.json();
  const rows = Array.isArray(body?.organic_results) ? body.organic_results : [];

  /** @type {FoundArticle[]} */
  const out = [];
  for (const hit of rows) {
    const link = String(hit?.link ?? '');
    if (link.length === 0) continue;

    const trust = trustOf(link);
    // Unusable is unusable: a Pinterest board cannot become a source by
    // being relevant, so it never reaches the model or the page. This is
    // the one filter that runs before everything, because it is the one
    // that is certain.
    if (!trust.usable) continue;

    // Wikipedia results from Google are dropped, not merged: the same
    // articles arrive free and better-described from the Wikipedia
    // search that runs alongside this, with a length and a
    // disambiguation flag Google does not give.
    if (hostOf(link).endsWith('wikipedia.org')) continue;

    out.push({
      title: stripHtml(hit?.title ?? '') || link,
      summary: stripHtml(hit?.snippet ?? '').slice(0, 300),
      words: 0,
      disambiguation: false,
      url: link,
      kind: 'web',
      host: hostOf(link),
      trust,
    });
  }
  return out;
}

/* ---- the model's two jobs -------------------------------------------- */

/**
 * A description, turned into queries a search engine can use.
 *
 * Wikipedia's own search handles a sentence reasonably because it matches
 * against article text. Google does not: "the man who scammed a Brazilian
 * bank" returns discussion of the phrasing, not the documents. Falls back
 * to the raw description if the model fails, because one mediocre query
 * beats no search at all.
 *
 * @param {string} description
 * @param {string} country
 * @returns {Promise<string[]>}
 */
async function queriesFor(description, country) {
  try {
    const prompt = await loadPrompt('source-queries', { description, country });
    const raw = await completeJson({ model: MODELS.findSources, prompt, temperature: 0.4 });
    const queries = (Array.isArray(raw?.queries) ? raw.queries : [])
      .filter((q) => typeof q === 'string' && q.trim().length > 2)
      .map((q) => q.trim())
      .slice(0, 4);
    return queries.length > 0 ? queries : [description];
  } catch {
    return [description];
  }
}

/**
 * Which of these results are documents worth reading?
 *
 * Relevance and substance only. The prompt says so and this function
 * enforces it structurally: the model returns ids to keep, and the trust
 * verdict it never sees is what orders them afterwards. It cannot promote
 * a blog above a journal however much it likes the blog.
 *
 * A failure here drops through to keeping everything. The search has
 * already been paid for, and handing back an unfiltered ranked list is
 * worse than filtering but far better than an error.
 *
 * @param {FoundArticle[]} rows
 * @param {string} description
 * @param {string} country
 * @returns {Promise<FoundArticle[]>}
 */
async function pickUsable(rows, description, country) {
  if (rows.length === 0) return rows;

  try {
    const listed = rows
      .map((row, id) => `${id}. [${row.host}] ${row.title}\n   ${row.summary || '(no snippet)'}`)
      .join('\n');
    const prompt = await loadPrompt('source-pick', {
      description,
      country,
      results: listed,
    });
    const raw = await completeJson({ model: MODELS.findSources, prompt, temperature: 0 });
    const keep = Array.isArray(raw?.keep) ? raw.keep : [];
    if (keep.length === 0) return [];

    /** @type {FoundArticle[]} */
    const kept = [];
    const seen = new Set();
    for (const entry of keep) {
      const id = Number(entry?.id);
      if (!Number.isInteger(id) || id < 0 || id >= rows.length || seen.has(id)) continue;
      seen.add(id);
      kept.push({
        ...rows[id],
        why: typeof entry?.why === 'string' ? entry.why.trim().slice(0, 160) : '',
      });
    }
    return kept;
  } catch {
    return rows;
  }
}

/* ---- the whole search ------------------------------------------------ */

/**
 * @typedef {object} SourceSearchResult
 * @property {FoundArticle[]} results Wikipedia first, then by trust.
 * @property {string[]} queries What was actually searched for.
 * @property {boolean} cached True when the web half cost nothing.
 * @property {number} spent Web searches this call paid for.
 * @property {string} [warning] Why the web half is missing, when it is.
 */

/**
 * Find source documents from a description, everywhere.
 *
 * Wikipedia always runs: it is free, so there is no version of this where
 * skipping it saves anything. The web half needs a key and spends quota,
 * so it degrades to a warning rather than an error — a studio with no
 * SerpApi key still searches Wikipedia exactly as it always did.
 *
 * The two run in parallel with the query-writing call, which is what
 * makes this feel like one search rather than three round trips.
 *
 * @param {string} description
 * @param {{ country?: string, web?: boolean, force?: boolean }} [options]
 * @returns {Promise<SourceSearchResult>}
 */
export async function searchSources(description, options = {}) {
  const term = String(description ?? '').trim();
  if (term.length < 3) return { results: [], queries: [], cached: false, spent: 0 };

  const { country = 'Nigeria', web = true, force = false } = options;

  const hit = force ? null : (await loadCache())[cacheKey(term)];
  if (hit) {
    return {
      results: Array.isArray(hit.results) ? hit.results : [],
      queries: Array.isArray(hit.queries) ? hit.queries : [],
      cached: true,
      spent: 0,
    };
  }

  const hasKey = (await envValue('SERPAPI_KEY')).length > 0;
  const wantWeb = web && hasKey;

  const [wikipedia, queries] = await Promise.all([
    searchArticles(term).catch(() => []),
    wantWeb ? queriesFor(term, country) : Promise.resolve([]),
  ]);

  if (!wantWeb) {
    return {
      results: wikipedia,
      queries: [term],
      cached: false,
      spent: 0,
      // Only when the web half was WANTED and could not run. Choosing the
      // free search deliberately is not a problem to be warned about, and
      // a warning on every free search is a warning nobody reads.
      warning: web
        ? 'No SERPAPI_KEY in afrifacts-studio/.env, so only Wikipedia was searched. ' +
          'Get one from https://serpapi.com/manage-api-key (250 free searches a month).'
        : undefined,
    };
  }

  /** @type {FoundArticle[]} */
  /*
    All four queries at once.

    They were sequential and the search took 23 seconds, of which 8 was
    four round trips to SerpApi waiting on each other for no reason —
    they share nothing and one failing does not change the others. This
    is the single biggest thing between typing a description and reading
    results; the two model calls that bracket it cannot be parallelised
    because the second one needs what the search returned.

    `allSettled`, so one query failing costs its own results and not the
    whole search. `spent` counts what came back: a call that failed after
    its retries generally did not reach the meter, and guessing upward
    would make the quota display lie in the direction that stops you
    searching.
  */
  const settled = await Promise.allSettled(queries.map((query) => googleOnce(query)));
  const webHits = [];
  let spent = 0;
  let failure = '';
  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      webHits.push(...outcome.value);
      spent += 1;
    } else {
      failure = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
    }
  }

  // One URL can come back from three of the four queries. First sighting
  // wins, which keeps Google's own ranking as the tie-break.
  const seen = new Set();
  /** @type {FoundArticle[]} */
  const unique = [];
  for (const row of webHits) {
    const key = row.url.replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }

  const chosen = await pickUsable(unique, term, country);

  /*
    Wikipedia is not put through the model.

    Its own search already matched on article text rather than a snippet,
    the disambiguation flag catches the failure mode the model would be
    looking for, and it is ranked first regardless — so a filtering call
    could only remove articles, never reorder them.

    What it does get is a shorter block. Fifteen unfiltered Wikipedia rows
    is right when Wikipedia is the whole search and wrong when it is the
    first quarter of one: measured on 'Nigerian railways history', rows
    9 through 15 were Nigeria Police Force, Football in Nigeria and the
    Nigeria Federation Cup, all sitting above four genuine academic
    papers. Wikipedia keeps the top of the list; it does not keep the
    page.
  */
  const results = [...wikipedia.slice(0, chosen.length > 0 ? 8 : 15), ...byTrust(chosen)];

  const at = new Date().toISOString();
  // Written even when the web half found nothing, and even when it
  // failed after spending a search. Both are answers, and both already
  // cost what they cost.
  if (spent > 0) await remember(term, { at, queries, results });

  return {
    results,
    queries,
    cached: false,
    spent,
    warning: failure ? `The web search stopped early: ${failure}` : undefined,
  };
}
