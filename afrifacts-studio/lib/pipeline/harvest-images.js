/**
 * Stage 6: find an image for a fact, or decide it has none.
 *
 * The premise, and the reason this stage is small: the article a fact was
 * extracted from already has images, chosen by human editors, with
 * machine-readable licences. There is no matching problem to solve — only
 * a harvesting one. This does not search for images, it reads what is
 * already attached to the page the fact came from.
 *
 * Three rules shape everything here:
 *
 *   1. The licence filter is CODE, never the model. Asking a model whether
 *      a licence permits commercial use is asking the faculty that
 *      hallucinates to guard against hallucination — the same argument
 *      that keeps a model out of verify.js.
 *
 *   2. Most facts get no image, and that is the expected outcome. A fact
 *      about a moment — a player taking the field the day after a death —
 *      has no photograph and never will. `image: null` is a designed value
 *      in the contract, and the typographic card is a real variant, not a
 *      fallback. Forcing a generic photo onto a specific claim is how a
 *      facts app quietly stops being evidential.
 *
 *   3. What this writes goes live. Matches used to be 'proposed' and
 *      wait on a page of their own, which meant a finished run produced
 *      131 typographic cards and a queue nobody had time for. They are
 *      accepted now, and the review page is where an image is swapped,
 *      searched for, or removed — alongside the fact it belongs to,
 *      which is the only place the question "does this picture fit this
 *      claim" can actually be answered.
 *
 *      The licence filter is unchanged and still runs in code. What was
 *      dropped is a second human gate, not a check.
 */

import { loadCorpus } from '../../corpus/index.js';
import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { FOUND_KEY, loadImages, loadPool, rememberFound, saveImages, savePool } from '../studio/images.js';
import { hasSearchKey, searchImages } from './image-search.js';

/** Wikipedia asks for a real User-Agent that identifies the caller. */
export const UA = 'AfriFacts-Studio/0.1 (content pipeline; contact via repo)';

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Width to request from Commons.
 *
 * Covers both consumers: the in-app photo card is ~350dp wide at 3x, and
 * the share card is 1080px wide with the photo across the full bleed. One
 * size serves both, so one URL is stored.
 */
export const TARGET_WIDTH = 1080;

/** Below this the original is too small to fill a card without softening. */
export const MIN_SOURCE_WIDTH = 800;

/**
 * How many facts may share one image.
 *
 * One. A feed that shows the same photograph three times in a minute
 * looks broken, and the whole point of the photo card is rhythm. This
 * makes the run order-dependent, which is acceptable: the reviewer can
 * reassign anything on the images page, and a second run only fills gaps.
 */
const MAX_USES_PER_IMAGE = 1;

/**
 * Does this fact actually have a picture?
 *
 * Not the same question as "has it been decided". A rejection is a
 * decision and leaves the fact with nothing, which is why counting
 * decisions once left 43 facts permanently blank: every future run saw a
 * record and moved on.
 *
 * @param {import('../studio/images.js').ImageDecision | undefined} decision
 */
function hasImage(decision) {
  return Boolean(decision) && decision.status === 'accepted' && decision.file.length > 0;
}

/**
 * Pictures this fact has already been refused.
 *
 * The whole of what a rejection means, kept when the fact is refilled. A
 * person who said no to a squad photo said no to that squad photo, and
 * handing it back on the next run would make the button a suggestion.
 *
 * @param {import('../studio/images.js').ImageDecision | undefined} decision
 */
function refusedFor(decision) {
  if (!decision) return [];
  const prior = Array.isArray(decision.refused) ? decision.refused : [];
  const own = decision.status === 'rejected' && decision.file.length > 0 ? [decision.file] : [];
  return [...new Set([...prior, ...own])];
}

/**
 * Facts per model call.
 *
 * Batched by article rather than one call per fact: the pool is the same
 * for every fact from a page, and asking once lets the model honour "each
 * image at most once" itself instead of being forced into it afterwards.
 * Chunked so a long article cannot produce a reply that hits the token cap
 * mid-JSON.
 */
const BATCH_SIZE = 12;

// --- the licence filter. Deterministic, and the only thing standing
// --- between the app and a copyright claim.

/**
 * Template furniture.
 *
 * Every Wikipedia article carries maintenance icons, portal marks, edit
 * pencils and flags. They are free-licensed and utterly useless, and they
 * would otherwise dominate a small pool.
 */
export const FURNITURE = [
  'commons-logo',
  'wikisource',
  'wikiquote',
  'wikidata',
  'wiktionary',
  'wikispecies',
  'wikibooks',
  'wikinews',
  'wikiversity',
  'wikimedia',
  'wikipedia',
  'ambox',
  'question_book',
  'edit-',
  'padlock',
  'symbol_',
  'disambig',
  'portal',
  'magnify-clip',
  'loudspeaker',
  'speakerlink',
  'sound-icon',
  'increase',
  'decrease',
  'steady',
  'red_pencil',
  'folder_',
  'crystal_',
  'nuvola',
  'gnome-',
  'emblem-',
  'star_full',
  'star_empty',
  'text_document',
  'office-book',
  'blank_',
  'transparent',
  'flag_of',
  'coat_of_arms',
  'seal_of',
  'location_map',
  'merge-arrow',
  'searchtool',
  'translation_to',
  'wiki_letter',
];

/** Stills only. The card renders an image, not a player. */
export const BAD_EXTENSION = /\.(svg|ogg|ogv|oga|webm|mid|wav|flac|pdf|djvu|tif|tiff|xcf)$/i;

/**
 * The API returns file titles with spaces where Commons shows
 * underscores, so patterns written either way have to meet in the middle.
 * Without this, every underscored pattern above silently matches nothing —
 * which is how a relief location map got into the Zuma Rock pool.
 *
 * @param {string} title
 */
export function normaliseTitle(title) {
  return title.toLowerCase().replace(/[\s_]+/g, '_');
}

/**
 * Commons' Artist field is free text and frequently is not an artist.
 *
 * It holds bare URLs, whole publication titles, and its own value repeated
 * twice. All three end up printed on a card and burned into a share image,
 * so anything that does not look like a name is dropped — the credit falls
 * back to Commons alone, which is still a correct attribution.
 *
 * @param {string} raw
 */
export function cleanArtist(raw) {
  let artist = raw.trim();
  if (artist.length === 0) return '';
  if (/^https?:\/\//i.test(artist)) return '';

  // 'Unknown artist Unknown artist' — Commons doubles this often enough.
  const half = Math.floor(artist.length / 2);
  const first = artist.slice(0, half).trim();
  if (first.length > 0 && artist.slice(half).trim() === first) artist = first;

  // A real credit is a name, not a sentence. Longer than this is a
  // description that landed in the wrong field.
  if (artist.length > 60) return '';
  return artist;
}

/**
 * @param {Record<string, { value?: unknown }> | undefined} meta
 * @param {string} key
 */
export function metaString(meta, key) {
  const raw = meta?.[key]?.value;
  return typeof raw === 'string' ? raw : '';
}

/**
 * extmetadata returns HTML — author fields are usually a link.
 *
 * The credit line is plain text on a card and on an exported PNG, so the
 * markup has to come off. Entities are decoded by hand rather than by
 * pulling in a parser: this project holds the LLM keys and its dependency
 * list stays short on purpose.
 *
 * @param {string} html
 */
export function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Does this licence let a commercial app crop the image onto a card?
 *
 * Commons policy already forbids non-free content, NC and ND, so most of
 * this is a second lock on a door that should be shut. It is here anyway
 * because the cost of being wrong is a takedown against an app whose whole
 * premise is trust, and because files do occasionally arrive mislabelled.
 *
 * NC is excluded from day one, not "later": the app plans ads and a
 * premium tier (CLAUDE.md §9), so non-commercial was never available.
 *
 * @param {Record<string, { value?: unknown }> | undefined} meta
 * @returns {{ ok: boolean, license: string, licenseId: string }}
 */
export function licenceVerdict(meta) {
  const licenseId = metaString(meta, 'License').toLowerCase().trim();
  const shortName = stripHtml(metaString(meta, 'LicenseShortName')).trim();
  const usageTerms = stripHtml(metaString(meta, 'UsageTerms')).toLowerCase();
  const license = shortName.length > 0 ? shortName : licenseId.toUpperCase();

  const haystack = `${licenseId} ${shortName.toLowerCase()} ${usageTerms}`;

  // Non-commercial and no-derivatives, in id form and in prose form.
  if (/-nc(-|$|\d)/.test(licenseId) || /noncommercial|non-commercial/.test(haystack)) {
    return { ok: false, license, licenseId };
  }
  if (/-nd(-|$|\d)/.test(licenseId) || /noderiv|no derivative/.test(haystack)) {
    return { ok: false, license, licenseId };
  }
  if (/fair use|non-free|nonfree|copyright/.test(haystack) && !/free/.test(licenseId)) {
    return { ok: false, license, licenseId };
  }

  const allowed =
    /^(cc-by(-sa)?([-\d.]*)?|cc-zero|cc0|pd|pd-.*|public domain.*)$/.test(licenseId) ||
    /^(cc by|cc by-sa|cc0|public domain)/i.test(shortName);

  return { ok: allowed, license, licenseId };
}

/**
 * Pull every image on an article and keep the ones that are usable.
 *
 * `imagerepository: 'shared'` is the load-bearing check. Commons forbids
 * non-free content, so a file hosted there is free for commercial use and
 * derivatives by policy. Files that are fair-use — album covers, logos,
 * the good photograph of a living person, which are exactly the tempting
 * ones — are hosted locally on en-wiki instead, and are filtered out here
 * by that one field.
 *
 * @param {string} articleTitle
 * @returns {Promise<import('../studio/images.js').ImageCandidate[]>}
 */
export async function fetchPool(articleTitle) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('titles', articleTitle);
  url.searchParams.set('generator', 'images');
  url.searchParams.set('gimlimit', '100');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|size|extmetadata');
  url.searchParams.set('iiurlwidth', String(TARGET_WIDTH));
  url.searchParams.set('redirects', '1');

  let res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  for (let attempt = 1; res.status === 429 && attempt <= 3; attempt += 1) {
    await sleep(2000 * attempt);
    res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  }
  if (!res.ok) throw new Error(`Wikipedia returned ${res.status} for '${articleTitle}'.`);

  const body = await res.json();
  const pages = Object.values(body?.query?.pages ?? {});
  /** @type {import('../studio/images.js').ImageCandidate[]} */
  const out = [];

  for (const page of pages) {
    const title = page.title ?? '';
    const info = page.imageinfo?.[0];
    if (!info) continue;

    // Locally hosted means non-free on en-wiki. This is the whole filter.
    if (page.imagerepository !== 'shared') continue;

    const normalised = normaliseTitle(title);
    if (BAD_EXTENSION.test(normalised)) continue;
    if (FURNITURE.some((mark) => normalised.includes(mark))) continue;

    const width = typeof info.width === 'number' ? info.width : 0;
    const height = typeof info.height === 'number' ? info.height : 0;
    if (width < MIN_SOURCE_WIDTH) continue;

    const verdict = licenceVerdict(info.extmetadata);
    if (!verdict.ok) continue;

    // Commons flags trademark and personality-rights encumbrances here.
    // They are rare, and a fact card is exactly the context where they
    // bite, so anything encumbered is dropped rather than surfaced for a
    // judgement call.
    if (stripHtml(metaString(info.extmetadata, 'Restrictions')).trim().length > 0) continue;

    const thumb = typeof info.thumburl === 'string' ? info.thumburl : info.url;
    if (typeof thumb !== 'string' || thumb.length === 0) continue;

    // The API appends its own utm_* campaign parameters to every URL.
    // Stored as-is they would be baked into the app and sent from every
    // reader's phone on every card, which is analytics for Wikimedia
    // about our users. The bare file URL fetches the same bytes.
    const cleanUrl = thumb.split('?')[0] ?? thumb;

    out.push({
      file: title,
      url: cleanUrl,
      descriptionUrl: info.descriptionurl ?? '',
      width,
      height,
      license: verdict.license,
      licenseId: verdict.licenseId,
      artist: cleanArtist(stripHtml(metaString(info.extmetadata, 'Artist'))),
      description: stripHtml(
        metaString(info.extmetadata, 'ImageDescription') ||
          metaString(info.extmetadata, 'ObjectName'),
      ).slice(0, 400),
    });
  }

  return out;
}

/**
 * Which Wikipedia article did this fact come from?
 *
 * The enrich stage records the article title as the source's shortName.
 * A hand-authored fact sourced to a book has no article and no pool, so
 * it is skipped rather than guessed at.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @returns {string | null}
 */
export function articleFor(entry) {
  const source = entry.provenance?.sources?.[0];
  if (!source) return null;
  const url = source.locator?.url ?? '';
  if (!url.includes('wikipedia.org')) return null;
  return source.shortName?.trim() || null;
}

/** @param {import('../types/provenance.js').SourcedFact[]} entries */
function factLines(entries) {
  return entries.map((e) => `${e.fact.id} | ${e.fact.fact}`).join('\n');
}

/** @param {import('../studio/images.js').ImageCandidate[]} candidates */
function imageLines(candidates) {
  return candidates
    .map((c) => {
      const name = c.file.replace(/^File:/, '').replace(/_/g, ' ');
      const desc = c.description.length > 0 ? ` — ${c.description}` : '';
      return `${c.file} | ${name}${desc}`;
    })
    .join('\n');
}

/**
 * A search query per fact, for the pass that fills the gaps.
 *
 * The article title is the wrong query for a fact about a moment inside
 * the article — every fact from one page would search the same words and
 * receive the same photograph, which the one-use rule then hands to
 * whichever fact happened to be first. So the model is asked for the
 * photographable subject of each fact in turn.
 *
 * This is a cheap call and a safe one: the output is search terms, not a
 * claim. Nothing it returns reaches a reader, and a poor query costs one
 * search and a picture nobody wanted.
 *
 * @param {import('../types/provenance.js').SourcedFact[]} entries
 * @param {string} country
 * @returns {Promise<Map<string, string>>} factId -> query
 */
async function queriesFor(entries, country, onProgress, signal) {
  /** @type {Map<string, string>} */
  const out = new Map();
  if (entries.length === 0) return out;

  const prompt = await loadPrompt('image-query', { country, facts: factLines(entries) });
  const raw = await completeJson(
    { model: MODELS.pickImage, prompt, temperature: 0, signal },
    onProgress,
  );

  const validIds = new Set(entries.map((e) => e.fact.id));
  for (const row of Array.isArray(raw?.queries) ? raw.queries : []) {
    if (typeof row?.factId !== 'string' || typeof row?.query !== 'string') continue;
    if (!validIds.has(row.factId)) continue;
    const query = row.query.trim();
    if (query.length >= 3) out.set(row.factId, query);
  }
  return out;
}

/**
 * Ask the model to assign images, and let it decline.
 *
 * This is the one job in the stage a model is good at: choosing among
 * human-curated options using their text descriptions. It is not judging
 * truth, not writing prose, and not reading a licence. The prompt's most
 * important instruction is that returning nothing is a correct answer —
 * this pipeline has already measured that the model will fill any quota
 * it is given, and a forced match here is exactly the generic image the
 * whole stage exists to avoid.
 *
 * @param {import('../types/provenance.js').SourcedFact[]} entries
 * @param {import('../studio/images.js').ImageCandidate[]} candidates
 * @param {string} country
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<Map<string, { file: string, why: string }>>}
 */
async function proposeForBatch(entries, candidates, country, onProgress, signal) {
  /** @type {Map<string, { file: string, why: string }>} */
  const out = new Map();
  if (entries.length === 0 || candidates.length === 0) return out;

  const prompt = await loadPrompt('pick-image', {
    country,
    facts: factLines(entries),
    images: imageLines(candidates),
  });

  const raw = await completeJson(
    { model: MODELS.pickImage, prompt, temperature: 0, signal },
    onProgress,
  );

  if (!Array.isArray(raw?.matches)) return out;

  const validIds = new Set(entries.map((e) => e.fact.id));
  const validFiles = new Set(candidates.map((c) => c.file));

  for (const match of raw.matches) {
    if (typeof match?.factId !== 'string' || typeof match?.file !== 'string') continue;
    // A model naming a fact or a file that was not on the list is
    // inventing one, which is the normal failure and not a rare one.
    if (!validIds.has(match.factId) || !validFiles.has(match.file)) continue;
    if (out.has(match.factId)) continue;

    out.set(match.factId, {
      file: match.file,
      why: typeof match.why === 'string' ? match.why.trim() : '',
    });
  }

  return out;
}

/**
 * @typedef {object} ImagesSummary
 * @property {number} articles
 * @property {number} poolTotal
 * @property {number} proposed
 * @property {number} alreadyDecided
 * @property {number} skippedNoArticle
 * @property {string[]} failed
 */

/**
 * Harvest image candidates and propose matches.
 *
 * @param {{ force?: boolean, ids?: string[], webBudget?: number, signal?: AbortSignal }} [options]
 *   `force` refetches every pool. `ids` limits the run to those facts.
 * @param {(line: string) => void} [onProgress]
 * @returns {Promise<ImagesSummary>}
 */
export async function runImages(options = {}, onProgress) {
  const say = onProgress ?? (() => {});
  const { force = false, signal } = options;
  const today = new Date().toISOString().slice(0, 10);

  // `ids` narrows the run to named facts. The agent passes the facts it
  // just wrote: without it, a five-fact run would walk the whole corpus
  // and spend a web search on every old fact that has no picture.
  const ids = Array.isArray(options.ids) && options.ids.length > 0 ? new Set(options.ids) : null;
  const corpus = (await loadCorpus()).filter((e) => !ids || ids.has(e.fact.id));
  const decisions = await loadImages();
  const pool = force ? {} : await loadPool();

  // Group by article: the pool is per page, so one fetch and one model
  // call serve every fact extracted from it.
  const byArticle = new Map();
  let skippedNoArticle = 0;

  for (const entry of corpus) {
    const article = articleFor(entry);
    if (!article) {
      skippedNoArticle += 1;
      continue;
    }
    const list = byArticle.get(article) ?? [];
    list.push(entry);
    byArticle.set(article, list);
  }

  say(`Harvesting images for ${byArticle.size} article(s)`);
  if (skippedNoArticle > 0) {
    say(`${skippedNoArticle} fact(s) skipped: not sourced to a Wikipedia article`);
  }
  say('Commons only. Non-free, NC and ND cannot reach this list.');

  // Images already spoken for, so a second run does not hand the same
  // photograph to a second fact.
  const used = new Map();
  for (const decision of Object.values(decisions)) {
    if (decision.status === 'rejected' || decision.file.length === 0) continue;
    used.set(decision.file, (used.get(decision.file) ?? 0) + 1);
  }

  let proposed = 0;
  let alreadyDecided = 0;
  /*
    A ceiling on what one run can spend.

    The plan is 250 searches a month and the second pass searches once
    per imageless fact, so this is the only thing between a click and a
    third of the month. Cached queries do not count — they cost nothing,
    which is why a re-run over the same corpus is free.

    Eighty is about half a month, enough to fill the whole corpus in one
    go from a standing start. When it runs out the stage says so and
    stops rather than failing, and the next run picks up where it left.
  */
  const webBudget = Number(options.webBudget ?? 80);
  let webSearches = 0;
  let webFound = 0;
  /** @type {string[]} */
  const failed = [];

  let stopped = false;

  for (const [article, entries] of byArticle) {
    // Between articles, so a stop never leaves a half-matched page.
    if (signal?.aborted) {
      stopped = true;
      say('Stopped. Every proposal made so far is saved.');
      break;
    }
    if (!pool[article]) {
      try {
        pool[article] = await fetchPool(article);
        await sleep(800);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        say(`x ${article} — ${message}`);
        // Deliberately not cached as an empty pool. A rate-limited fetch
        // and an article with no usable images look identical once
        // written to disk, and storing [] here would mean a transient 429
        // silently cost that article its pictures for good. Left absent,
        // so the next run tries again.
        failed.push(article);
        continue;
      }
    }

    let candidates = pool[article] ?? [];

    // A fact that already HAS a picture is finished. One that was
    // rejected is not: a rejection says "not that photograph", which is
    // a different sentence from "this fact should have none". The file
    // it refused is remembered and never offered again, so re-running
    // fills the gap without overturning the judgement that made it.
    const undecided = entries.filter((e) => {
      if (hasImage(decisions[e.fact.id])) {
        alreadyDecided += 1;
        return false;
      }
      return true;
    });

    let free = candidates.filter((c) => (used.get(c.file) ?? 0) < MAX_USES_PER_IMAGE);

    /*
      When the article itself has nothing, ask the web.

      Harvesting rests on the premise that the page a fact came from
      already carries pictures human editors chose. For a good fraction
      of the corpus that premise is simply false — Commons has no free
      image for the article at all — and those facts were stuck: the
      harvester skipped them, and they would have been skipped by every
      future run too.

      The web search is the fallback, not the default, because it costs
      money and licences. Only reached when the article's own pool is
      empty or entirely spoken for, only for facts nobody has ruled on,
      and answered from `data/search-cache.json` when the same article
      has been asked about before, so a re-run is free.

      What comes back carries no licence. It goes into the pool marked
      as such and the model may propose it like anything else — but the
      picture and its unverified marker travel together into
      `data/images.json`, so which facts got one this way stays a grep
      rather than a memory.
    */
    if (undecided.length > 0 && free.length === 0 && webSearches < webBudget) {
      if (await hasSearchKey()) {
        webSearches += 1;
        try {
          const result = await searchImages(article, { want: 12 });
          if (result.candidates.length > 0) {
            await rememberFound(result.candidates);
            pool[FOUND_KEY] = [...(pool[FOUND_KEY] ?? []), ...result.candidates];
            candidates = result.candidates;
            free = candidates.filter((c) => (used.get(c.file) ?? 0) < MAX_USES_PER_IMAGE);
            webFound += free.length;
          }
          say(
            `  web search "${article}" — ${result.candidates.length} found` +
              (result.cached ? ' (cached, no search spent)' : ' (1 search spent)'),
          );
          if (result.cached) webSearches -= 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          say(`  x web search failed — ${message}`);
        }
      }
    }

    say(
      `${article} — ${candidates.length} usable image(s), ${free.length} unused, ${undecided.length} fact(s) to match`,
    );

    if (undecided.length === 0 || free.length === 0) continue;

    const country = entries[0]?.fact.country ?? 'NG';

    for (let i = 0; i < undecided.length; i += BATCH_SIZE) {
      const batch = undecided.slice(i, i + BATCH_SIZE);
      const stillFree = candidates.filter((c) => (used.get(c.file) ?? 0) < MAX_USES_PER_IMAGE);
      if (stillFree.length === 0) break;

      try {
        const matches = await proposeForBatch(batch, stillFree, country, say, signal);

        for (const [factId, match] of matches) {
          // The model was told each image may be used once. It is not
          // trusted to have obeyed.
          if ((used.get(match.file) ?? 0) >= MAX_USES_PER_IMAGE) continue;
          // Nor to have avoided the one this fact was already refused.
          const refused = refusedFor(decisions[factId]);
          if (refused.includes(match.file)) continue;

          decisions[factId] = {
            status: 'accepted',
            file: match.file,
            reasoning: match.why,
            decidedBy: 'pipeline',
            decidedAt: today,
            at: new Date().toISOString(),
            refused,
          };
          used.set(match.file, (used.get(match.file) ?? 0) + 1);
          proposed += 1;
          say(`+ ${factId}  ${match.file.replace(/^File:/, '').slice(0, 54)}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        say(`x batch failed — ${message}`);
      }
    }
  }

  /*
    Pass two: fill everything the first pass left blank.

    The first pass is discriminating on purpose — it asks whether a
    Commons photograph genuinely depicts the fact, and a no is the
    expected answer. That is the right question for a pool of pictures
    somebody else chose for a different reason, and it leaves roughly
    half the corpus with nothing.

    This pass asks a different question: what would you search for to
    find a picture of THIS fact. The query is the subject, so the top
    result is on-topic by construction and there is no judgement call
    for a model to get wrong. Every fact that still has nothing gets
    one, which is the point — you should not have to open this again.

    WHAT THIS TRADES. These images carry no licence. Nothing here has
    checked whether one may be published, and nothing pretends to: the
    candidate is stamped `Not verified — found by web search`, that
    string travels into `data/images.json` and into the app's
    `FactImage.license`, and the site it came from is recorded as the
    credit. Clearing rights before the app ships with ads is a human
    step this code does not perform and cannot.
  */
  const needing = corpus.filter((e) => !hasImage(decisions[e.fact.id]));

  if (needing.length > 0 && !stopped && (await hasSearchKey())) {
    say(`${needing.length} fact(s) still without a picture — searching the web for each`);

    for (let i = 0; i < needing.length; i += BATCH_SIZE) {
      if (signal?.aborted) {
        stopped = true;
        say('Stopped. Every picture found so far is saved.');
        break;
      }

      const batch = needing.slice(i, i + BATCH_SIZE);
      /** @type {Map<string, string>} */
      let queries = new Map();
      try {
        queries = await queriesFor(batch, batch[0]?.fact.country ?? 'NG', say, signal);
      } catch (error) {
        say(`  x query batch failed — ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }

      for (const entry of batch) {
        if (signal?.aborted) break;
        const factId = entry.fact.id;
        const query = queries.get(factId);
        if (!query) continue;
        if (webSearches >= webBudget) {
          say(`  budget reached — ${webBudget} searches this run. Run again to continue.`);
          break;
        }

        try {
          const result = await searchImages(query, { want: 12 });
          if (!result.cached) webSearches += 1;
          const refused = refusedFor(decisions[factId]);
          const pick = result.candidates.find(
            (c) => (used.get(c.file) ?? 0) < MAX_USES_PER_IMAGE && !refused.includes(c.file),
          );
          if (!pick) {
            say(`  · ${factId}  nothing usable for "${query}"`);
            continue;
          }

          await rememberFound([pick]);
          pool[FOUND_KEY] = [...(pool[FOUND_KEY] ?? []), pick];
          decisions[factId] = {
            status: 'accepted',
            file: pick.file,
            reasoning: `Top web image result for "${query}". Licence not checked.`,
            decidedBy: 'pipeline',
            decidedAt: today,
            at: new Date().toISOString(),
            refused,
          };
          used.set(pick.file, (used.get(pick.file) ?? 0) + 1);
          webFound += 1;
          proposed += 1;
          say(`+ ${factId}  ${query}${result.cached ? ' (cached)' : ''}`);
        } catch (error) {
          say(`  x ${factId} — ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  } else if (needing.length > 0 && !(await hasSearchKey())) {
    say(`${needing.length} fact(s) have no picture and there is no SERPAPI_KEY to search with.`);
  }

  await savePool(pool);
  await saveImages(decisions);

  const poolTotal = Object.values(pool).reduce((sum, list) => sum + list.length, 0);
  const withImage = corpus.filter((e) => hasImage(decisions[e.fact.id])).length;

  say(`${poolTotal} licence-clean image(s) in the pool`);
  say(`${proposed} newly matched, ${alreadyDecided} already had one`);
  if (webSearches > 0 || webFound > 0) {
    say(`${webSearches} web search(es) spent, ${webFound} unlicensed picture(s) accepted`);
  }
  say(`${withImage} of ${corpus.length} facts now carry a picture. All of it is live.`);
  say('Change or remove any of them on /review.');

  return {
    articles: byArticle.size,
    poolTotal,
    proposed,
    alreadyDecided,
    skippedNoArticle,
    failed,
    stopped,
  };
}
