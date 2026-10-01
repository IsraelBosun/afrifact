/**
 * Looking for an image beyond the article a fact came from.
 *
 * Stage 6 harvests: it reads the images already on the page the fact was
 * extracted from, on the premise that human editors put them there. That
 * premise holds for a fact ABOUT the subject of the article and breaks
 * for a fact about a moment inside it — the article on a footballer has a
 * squad photo, not the night his brother died — which is why so many
 * proposals felt unrelated. This is the other half: ask the open web what
 * it has, instead of only what one page happened to carry.
 *
 * WHAT THIS SEARCHES, AND WHAT THAT COSTS.
 *
 * Google image search, through whichever of three providers has a key in
 * `.env`. It returns the pictures people actually mean when they say
 * "search the web", which the licence-bound sources did not: an
 * open-licence index has no photograph of most single moments in Nigerian
 * history, so it returned a map for a fact about territory and a squad
 * photo for a fact about a funeral.
 *
 * The trade is explicit and it is a decision of the project's owner, not
 * an oversight of this file. A Google result carries no licence. Nothing
 * here can tell you whether a picture may be published, so nothing here
 * pretends to: every candidate is marked `Not verified — found by web
 * search`, and that string travels into `data/images.json` and into the
 * app's `FactImage.license` where an audit can find it. Clearing rights
 * for a chosen image is a human step this code does not perform.
 *
 * Bing is not a rejected option, it is a gone one: Microsoft retired
 * every Bing Search API on 11 August 2025 and decommissioned the
 * instances, image search included.
 *
 * SerpApi is the only provider. There were three, written on the theory
 * that free tiers move and services get retired — which this project has
 * watched happen twice. But two of them were code nobody ran, and a
 * second provider is an afternoon to add back against the certainty of
 * reading past it every time. `searchOnce` is the only function that
 * knows the API, so that afternoon stays cheap.
 *
 * The filters that remain are about fitness, not permission — extension
 * and size, because the share card is 1080 wide and a 400px JPEG or an
 * SVG cannot fill it.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { envValue } from '../llm/index.js';
import { SEARCH_CACHE_PATH } from '../paths.js';
import { BAD_EXTENSION, MIN_SOURCE_WIDTH, UA } from './harvest-images.js';

/**
 * What a searched image says about its own licence: nothing.
 *
 * Non-empty on purpose. `export-to-app` drops any candidate with an empty
 * `license`, which would make a web image fail to reach the app silently
 * — the worst of both worlds, an unlicensed picture accepted in the
 * studio and invisibly missing in the product. Saying so in words keeps
 * the record honest and the pipeline working.
 */
export const UNVERIFIED_LICENCE = 'Not verified — found by web search';

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {string | URL} url
 * @param {RequestInit} init
 * @param {string} who
 * @param {number} tries
 */
async function getJson(url, init, who, tries = 3) {
  const options = { ...init, headers: { 'User-Agent': UA, Accept: 'application/json', ...init?.headers } };
  let res = await fetch(url, options);
  for (let attempt = 1; (res.status === 429 || res.status >= 500) && attempt <= tries; attempt += 1) {
    await sleep(1500 * attempt);
    res = await fetch(url, options);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let detail = '';
    try {
      const parsed = JSON.parse(body);
      detail = parsed?.error?.message ?? parsed?.error ?? parsed?.message ?? '';
    } catch {
      /* the body was not JSON; the status is enough */
    }
    throw new Error(`${who} returned ${res.status}${detail ? `: ${detail}` : ''}.`);
  }
  return res.json();
}

/**
 * A stable id for a picture that has no file name.
 *
 * Commons files are identified by their title. A web image has only its
 * URL, and that URL can be five hundred characters of CDN parameters, so
 * it is hashed. Prefixed so its origin stays legible in
 * `data/images.json` years from now, and so it can never be mistaken for
 * a Commons title.
 *
 * @param {string} link
 */
function idFor(link) {
  return `web:${createHash('sha1').update(link).digest('hex').slice(0, 12)}`;
}

/**
 * Hosts whose image links are not images to anyone but their own crawler.
 *
 * Google Images lists Facebook and Instagram pictures by their
 * `lookaside` address, which serves the picture to Meta's link-preview
 * crawler and a login page to everyone else, phones included. Fourteen
 * facts went live with one, and each showed as a photo card with an empty
 * photo: the request succeeds, so nothing ever says it failed. Their
 * `fbcdn` and `cdninstagram` addresses are no better, being signed URLs
 * that expire within days.
 */
const NOT_AN_IMAGE_HOST =
  /(^|\.)(lookaside\.fbsbx\.com|lookaside\.instagram\.com|fbcdn\.net|cdninstagram\.com)$/i;

/**
 * Will this URL hand a phone a picture?
 *
 * @param {string} url
 */
export function servesAnImage(url) {
  try {
    return !NOT_AN_IMAGE_HOST.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * One provider's row, in the shape the rest of the studio speaks.
 *
 * @param {{ url: string, page?: string, width: number, height: number, title?: string, site?: string, thumb?: string }} raw
 * @returns {import('../studio/images.js').ImageCandidate | null}
 */
function toCandidate(raw) {
  const url = String(raw.url ?? '');
  if (url.length === 0) return null;

  // Fitness, not permission. The share card is 1080 wide, so a small
  // picture and a vector are both unusable whoever owns them.
  const bare = (url.split('?')[0] ?? url).toLowerCase();
  if (BAD_EXTENSION.test(bare)) return null;
  if ((raw.width ?? 0) < MIN_SOURCE_WIDTH) return null;
  if (!servesAnImage(url)) return null;

  let site = String(raw.site ?? '').trim();
  if (site.length === 0 && raw.page) {
    try {
      site = new URL(raw.page).hostname.replace(/^www\./, '');
    } catch {
      /* an unparseable page url just leaves the site blank */
    }
  }

  return {
    file: idFor(url),
    url,
    // The page the picture sits on. With no licence to record, this is
    // the whole of the trail back to wherever it came from, so it
    // matters more here than it did for Commons, not less.
    descriptionUrl: String(raw.page ?? ''),
    width: raw.width ?? 0,
    height: raw.height ?? 0,
    license: UNVERIFIED_LICENCE,
    licenseId: '',
    // No author metadata exists in these results. The site is the
    // nearest true thing, and it is recorded as the site rather than
    // dressed up as a photographer.
    artist: site,
    description: String(raw.title ?? '').slice(0, 400),
    via: site || 'Google',
    thumbnail: String(raw.thumb ?? ''),
  };
}

/* ---- the provider ---------------------------------------------------- */

/**
 * One SerpApi call for Google Images.
 *
 * Every usable row is kept, not the first twenty. A search comes back
 * with around a hundred rows, the size filter culls most of them, and
 * the survivors cost exactly the same whether they are shown or thrown
 * away. There is no cheap second look at a query, so the first look
 * takes everything.
 *
 * @param {string} query
 * @param {number} want
 * @returns {Promise<import('../studio/images.js').ImageCandidate[]>}
 */
async function searchOnce(query, want) {
  const key = await envValue('SERPAPI_KEY');
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_images');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', key);
  url.searchParams.set('safe', 'active');

  const body = await getJson(url, {}, 'SerpApi');
  const rows = Array.isArray(body?.images_results) ? body.images_results : [];

  const kept = [];
  for (const hit of rows) {
    const candidate = toCandidate({
      url: hit?.original,
      page: hit?.link,
      width: Number(hit?.original_width) || 0,
      height: Number(hit?.original_height) || 0,
      title: hit?.title,
      site: hit?.source,
      thumb: hit?.thumbnail,
    });
    if (candidate) kept.push(candidate);
    if (kept.length >= want) break;
  }
  return kept;
}


/* ---- the cache ------------------------------------------------------- */

/**
 * Every query that has been paid for.
 *
 * The free tier is 250 searches a month, so a repeated query is not a
 * minor inefficiency — it is a percent of the month spent to receive an
 * answer already on disk. Retyping the same article title for a second
 * fact, reopening the panel, or a page reload would each have cost one.
 *
 * Keyed on the query alone, lowercased and space-collapsed, because the
 * provider is asked the same question either way and the answer does not
 * belong to the fact that prompted it. Two facts from one article search
 * the same term and the second is free.
 *
 * @typedef {{ at: string, provider: string, candidates: import('../studio/images.js').ImageCandidate[] }} CachedSearch
 */

/** @param {string} query */
function cacheKey(query) {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** @returns {Promise<Record<string, CachedSearch>>} */
async function loadCache() {
  try {
    const parsed = JSON.parse(await readFile(SEARCH_CACHE_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * @param {string} query
 * @param {CachedSearch} entry
 */
async function remember(query, entry) {
  const cache = await loadCache();
  cache[cacheKey(query)] = entry;
  await mkdir(dirname(SEARCH_CACHE_PATH), { recursive: true });
  await writeFile(SEARCH_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

/**
 * What is already answered, so the page can say so before you press it.
 *
 * @returns {Promise<string[]>} the cached queries, newest first
 */
export async function cachedQueries() {
  const cache = await loadCache();
  return Object.entries(cache)
    .sort((a, b) => String(b[1]?.at ?? '').localeCompare(String(a[1]?.at ?? '')))
    .map(([query]) => query);
}

/* ---- what is left of the month --------------------------------------- */

/**
 * How many searches the plan has left.
 *
 * SerpApi's account endpoint does not consume a search, so asking is
 * free and the page can show the number without the display costing
 * what it is displaying. null means "unknown", never "none".
 *
 * @returns {Promise<{ left: number, used: number } | null>}
 */
export async function searchQuota() {
  if (!(await hasSearchKey())) return null;

  try {
    const key = await envValue('SERPAPI_KEY');
    const url = new URL('https://serpapi.com/account');
    url.searchParams.set('api_key', key);
    const body = await getJson(url, {}, 'SerpApi');
    const left = Number(body?.total_searches_left);
    const used = Number(body?.this_month_usage);
    if (!Number.isFinite(left)) return null;
    return { left, used: Number.isFinite(used) ? used : 0 };
  } catch {
    // A quota display that throws would block a search that would have
    // worked. Not knowing is survivable; not searching is not.
    return null;
  }
}

/* ---- the key --------------------------------------------------------- */

/**
 * Is a key configured?
 *
 * Asked before the button is offered, so a missing key is a sentence on
 * the page rather than a failed request.
 *
 * @returns {Promise<boolean>}
 */
export async function hasSearchKey() {
  return (await envValue('SERPAPI_KEY')).length > 0;
}

/** What to tell someone who has configured nothing. */
export const NO_PROVIDER =
  'No SERPAPI_KEY in afrifacts-studio/.env — never in afrifacts/. ' +
  'Get one from https://serpapi.com/manage-api-key (250 free searches a month).';

/**
 * The search behind the button.
 *
 * Two things this does with the quota in mind.
 *
 * It answers from `data/search-cache.json` when the query has been asked
 * before, and `force` is the only way past that — so reopening the
 * panel, reloading the page, or searching the same article title for a
 * second fact are all free. On 250 searches a month that is the
 * difference between the feature being usable for a corpus and being
 * usable for a morning.
 *
 * And it keeps every usable picture a paid call returns rather than the
 * first twenty. One SerpApi search comes back with around a hundred
 * rows; the size filter culls most of them, and the survivors cost
 * exactly the same whether they are shown or thrown away. There is no
 * such thing as a cheap second look at the same query, so the first look
 * takes everything.
 *
 * @param {string} query
 * @param {{ force?: boolean, want?: number }} options
 * @returns {Promise<{ candidates: import('../studio/images.js').ImageCandidate[], warnings: string[], provider: string, cached: boolean, searchedAt: string }>}
 */
export async function searchImages(query, options = {}) {
  const { force = false, want = 100 } = options;
  const term = String(query ?? '').trim();
  if (term.length < 3) {
    return {
      candidates: [],
      warnings: ['Type at least three characters to search.'],
      provider: '',
      cached: false,
      searchedAt: '',
    };
  }

  const notice =
    'These carry no licence. Clear the rights yourself before accepting one — nothing in the studio has checked them.';

  if (!force) {
    const hit = (await loadCache())[cacheKey(term)];
    if (hit) {
      return {
        // Filtered on the way out too: searches cached before the host
        // filter existed still hold Facebook and Instagram rows.
        candidates: (hit.candidates ?? []).filter((c) => servesAnImage(c.url)),
        warnings: [notice],
        provider: hit.provider ?? 'SerpApi',
        cached: true,
        searchedAt: hit.at ?? '',
      };
    }
  }

  if (!(await hasSearchKey())) throw new Error(NO_PROVIDER);

  const found = await searchOnce(term, want);

  const seen = new Set();
  /** @type {import('../studio/images.js').ImageCandidate[]} */
  const candidates = [];
  for (const candidate of found) {
    if (!candidate) continue;
    const key = (candidate.url.split('?')[0] ?? candidate.url).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(candidate);
  }

  const at = new Date().toISOString();
  // Written even when empty. A query that found nothing is a real answer
  // and asking it again would cost the same as asking it the first time.
  await remember(term, { at, provider: 'SerpApi', candidates });

  return {
    candidates,
    warnings: candidates.length > 0 ? [notice] : [],
    provider: 'SerpApi',
    cached: false,
    searchedAt: at,
  };
}
