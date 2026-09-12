/**
 * The seed list: which documents the pipeline reads.
 *
 * Still a hand-picked list, now stored as data rather than code.
 * CLAUDE.md §7: choosing which sources to mine is judgment work with
 * enormous leverage, and it is where a person who knows the material
 * beats any crawler. Automate the extraction; never automate the
 * choosing. A text box you type your own choices into is not automating
 * the choosing — it is the same judgment, entered somewhere a button can
 * reach.
 *
 * It moved out of `sources.ts` because a clicked button must not rewrite
 * hand-authored source code. That is the same rule that keeps review
 * decisions in `data/reviews.json` instead of the corpus files.
 *
 * These pages were picked on one criterion: subjects whose NAME is widely
 * known but whose DETAIL is not. That gap is where facts an educated
 * Nigerian does not already know actually live. The `group` on each entry
 * is the note explaining why that block was chosen.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { SOURCES_PATH, ensureDirs } from '../paths.js';
import { SOURCE_TIERS } from '../types/provenance.js';

/**
 * @typedef {'wikipedia' | 'web'} SourceKind
 *   Which fetcher can read it. `wikipedia` goes through the API and comes
 *   back as clean prose at a fixed revision id; `web` is fetched as HTML
 *   and reduced to text by `readable.js`, and its locator is a content
 *   hash rather than a revision. The kind is stored rather than sniffed
 *   from the URL at fetch time, so a source cannot silently change how it
 *   will be read and cited after it has been added.
 */

/**
 * @typedef {object} SourceDoc
 * @property {string} slug Stable slug used for the cache filename and the
 *   fact id prefix.
 * @property {string} title Article title. For `wikipedia`, exactly as it
 *   appears in the URL — the API is asked for it by name.
 * @property {string} country
 * @property {SourceKind} kind
 * @property {string} url The page. Required for `web`, where there is no
 *   title lookup to fall back on; derived for `wikipedia`.
 * @property {import('../types/provenance.js').SourceTier} tier What kind
 *   of evidence this is, from `source-trust.js`. Wikipedia is
 *   'reference' — aggregation, weakest on its own, and the validator
 *   warns on any fact resting only on it. A journal or a statistics
 *   bureau clears that warning honestly, which is the point of letting
 *   the search off Wikipedia at all.
 * @property {'article' | 'record'} [profile] How the fetched page should be
 *   cleaned and gated. `article` is the default and is what every source
 *   before this one was: prose long enough that a length and sentence
 *   count can tell an article from a navigation menu. `record` is for a
 *   page that states one adjudicated record and nothing else, such as a
 *   Guinness World Records entry. Those are short by nature: the real
 *   claim is two sentences and the rest is a registered-office footer, so
 *   the article gates reject them outright (measured: 647 characters, 2
 *   sentences). It is a property of the page's shape, not of how the
 *   source is cited, so it lives beside `kind` rather than inside it.
 *   Stored rather than sniffed from the hostname, for the same reason
 *   `kind` is: a source must not silently change how it will be read
 *   after it has been added.
 * @property {string} [group] Why this block of pages was picked.
 * @property {string} [wanted] What was typed into the search box when this
 *   document was chosen from the results. Carried all the way to the
 *   extraction prompt: the description used to steer the search and then
 *   be thrown away, so a document added while looking for one specific
 *   thing was mined as though it had turned up at random. Empty when the
 *   source was pasted as a bare link, and the extractor then works
 *   unguided exactly as it always did.
 */

/**
 * A slug has to be safe as a filename, because it is one.
 *
 * `cachePath()` does `join(CACHE_DIR, `${slug}.json`)`, and the slug is
 * also the prefix on every fact id the document produces. When the list
 * was hand-edited code, a bad slug was caught by whoever typed it. A text
 * box in a browser has no such reviewer, so the shape is checked here:
 * lowercase, digits, single hyphens, nothing that can climb out of the
 * cache directory or collide on a case-insensitive filesystem.
 */
export const SLUG_SHAPE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** @param {any} entry */
function isUsable(entry) {
  return (
    entry &&
    typeof entry.slug === 'string' &&
    entry.slug.trim().length > 0 &&
    typeof entry.title === 'string' &&
    entry.title.trim().length > 0
  );
}

/**
 * @returns {Promise<SourceDoc[]>}
 */
export async function loadSources() {
  let raw;
  try {
    raw = await readFile(SOURCES_PATH, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isUsable).map(normalise);
}

/**
 * One entry, with the fields that did not exist when it was written.
 *
 * Every one of the 38 entries on the list predates `kind`, `url` and a
 * real `tier`, and they were all Wikipedia. Defaulting to that is not a
 * guess — it is what those rows are — and it means opening the seed list
 * after this change does not require a migration script that rewrites
 * `data/`, which is the directory no stage is allowed to overwrite.
 *
 * @param {any} entry
 * @returns {SourceDoc}
 */
function normalise(entry) {
  const title = entry.title.trim();
  const kind = entry.kind === 'web' ? 'web' : 'wikipedia';
  const url =
    typeof entry.url === 'string' && entry.url.length > 0
      ? entry.url
      : kind === 'wikipedia'
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
        : '';

  return {
    slug: entry.slug.trim(),
    title,
    country: typeof entry.country === 'string' && entry.country.length > 0 ? entry.country : 'NG',
    kind,
    url,
    tier: SOURCE_TIERS.includes(entry.tier) ? entry.tier : 'reference',
    // Absent means 'article', which is what all 38 pre-existing rows are.
    profile: entry.profile === 'record' ? 'record' : 'article',
    group: typeof entry.group === 'string' ? entry.group : '',
    wanted: typeof entry.wanted === 'string' ? entry.wanted.slice(0, 400) : '',
  };
}

/**
 * Replace the seed list.
 *
 * Rejects duplicate slugs rather than guessing which entry was meant —
 * the slug is the cache filename and the fact id prefix, so two articles
 * sharing one would overwrite each other's cached text. The same class of
 * bug as the id collision that once let a bulk approval mark a blocked
 * fact approved.
 *
 * @param {SourceDoc[]} sources
 */
export async function saveSources(sources) {
  const seen = new Set();
  for (const entry of sources) {
    if (!isUsable(entry)) throw new Error('Every source needs a slug and a title.');
    const slug = entry.slug.trim();
    if (!SLUG_SHAPE.test(slug)) {
      throw new Error(`'${slug}' is not a usable slug. Lowercase letters, digits and single hyphens only.`);
    }
    if (seen.has(slug)) throw new Error(`Duplicate slug '${slug}'. Slugs key the cache, so they must be unique.`);
    seen.add(slug);
  }

  await ensureDirs();
  const clean = sources.map(normalise);
  await writeFile(SOURCES_PATH, `${JSON.stringify(clean, null, 2)}\n`, 'utf8');
  return clean;
}

/**
 * Derive a slug from an article title.
 *
 * Deliberately short — the slug prefixes fact ids and shows up in the
 * triage filter, so `first-nigerian-republic` is worse than `first-
 * republic`. Trimmed to four words, which is where the hand-picked list
 * already sits.
 *
 * @param {string} title
 */
export function slugFrom(title) {
  return String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-');
}

/**
 * Accept what a person actually has to hand.
 *
 * Nobody reads an article and then retypes its title: they copy the URL.
 * Both are accepted, and a Wikipedia URL is turned into the title the API
 * wants — underscores back to spaces, percent-escapes decoded.
 *
 * For any other site this is a provisional title only. It reads the last
 * path segment, which gives 'jelani aliyu chevrolet volt' from a slug and
 * nothing at all from `/2019/03/14/`. The real title is whatever the page
 * declares in its own `<title>` or `og:title`, and `fetchWebPage` replaces
 * this with that. Guessing here is for the row in the list before the
 * fetch has run, not for the citation.
 *
 * @param {string} input
 * @returns {string}
 */
export function titleFrom(input) {
  const raw = String(input ?? '').trim();
  if (!/^https?:\/\//i.test(raw)) return raw;

  let url;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  const wiki = /(^|\.)wikipedia\.org$/i.test(url.hostname);
  const path = wiki
    ? url.pathname.replace(/^\/wiki\//, '')
    : (url.pathname.split('/').filter(Boolean).pop() ?? url.hostname);

  let title;
  try {
    title = decodeURIComponent(path);
  } catch {
    title = path;
  }
  title = title.replace(/\.(html?|php|aspx?)$/i, '').replace(/[_-]+/g, ' ').trim();
  return title.length > 0 ? title : url.hostname.replace(/^www\./, '');
}
