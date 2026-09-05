/**
 * Stage 6: find an image for a fact, or decide it has none.
 *
 * `npm run images`            propose images for facts that have no decision
 * `npm run images -- --force` refetch the candidate pools from Commons first
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
 *      that keeps a model out of verify.ts.
 *
 *   2. Most facts get no image, and that is the expected outcome. A fact
 *      about a moment — a player taking the field the day after a death —
 *      has no photograph and never will. `image: null` is a designed value
 *      in the contract, and the typographic card is a real variant, not a
 *      fallback. Forcing a generic photo onto a specific claim is how a
 *      facts app quietly stops being evidential.
 *
 *   3. Nothing this writes is publishable. Every match is 'proposed' and
 *      waits for a person at /images, exactly as facts wait at /.
 */

import { sep } from 'node:path';
import { completeJson, loadPrompt, MODELS } from '../llm';
import { corpus } from '../corpus';
import {
  loadImages,
  loadPool,
  savePool,
  saveImages,
  type ImageCandidate,
  type ImagePool,
  type ImageStore,
} from '../studio/images';
import type { SourcedFact } from '../types/provenance';

/** Wikipedia asks for a real User-Agent that identifies the caller. */
const UA = 'AfriFacts-Factory/0.1 (content pipeline; contact via repo)';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Width to request from Commons.
 *
 * Covers both consumers: the in-app photo card is ~350dp wide at 3x, and
 * the share card is 1080px wide with the photo across the full bleed. One
 * size serves both, so one URL is stored.
 */
const TARGET_WIDTH = 1080;

/** Below this the original is too small to fill a card without softening. */
const MIN_SOURCE_WIDTH = 800;

/**
 * How many facts may share one image.
 *
 * One. A feed that shows the same photograph three times in a minute
 * looks broken, and the whole point of the photo card is rhythm. This
 * makes the run order-dependent, which is acceptable: the reviewer can
 * reassign anything at /images, and a second run only fills gaps.
 */
const MAX_USES_PER_IMAGE = 1;

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
const FURNITURE = [
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
const BAD_EXTENSION = /\.(svg|ogg|ogv|oga|webm|mid|wav|flac|pdf|djvu|tif|tiff|xcf)$/i;

/**
 * The API returns file titles with spaces where Commons shows
 * underscores, so patterns written either way have to meet in the middle.
 * Without this, every underscored pattern above silently matches nothing —
 * which is how a relief location map got into the Zuma Rock pool.
 */
function normaliseTitle(title: string): string {
  return title.toLowerCase().replace(/[\s_]+/g, '_');
}

/**
 * Commons' Artist field is free text and frequently is not an artist.
 *
 * It holds bare URLs, whole publication titles, and its own value repeated
 * twice. All three end up printed on a card and burned into a share image,
 * so anything that does not look like a name is dropped — the credit falls
 * back to Commons alone, which is still a correct attribution.
 */
function cleanArtist(raw: string): string {
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

interface ExtMetaValue {
  value?: unknown;
}

interface ImageInfo {
  url?: string;
  thumburl?: string;
  descriptionurl?: string;
  width?: number;
  height?: number;
  extmetadata?: Record<string, ExtMetaValue>;
}

interface ImagesQuery {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        missing?: string;
        imagerepository?: string;
        imageinfo?: ImageInfo[];
      }
    >;
  };
}

function metaString(meta: Record<string, ExtMetaValue> | undefined, key: string): string {
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
 */
function stripHtml(html: string): string {
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
 */
function licenceVerdict(meta: Record<string, ExtMetaValue> | undefined): {
  ok: boolean;
  license: string;
  licenseId: string;
} {
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
 */
export async function fetchPool(articleTitle: string): Promise<ImageCandidate[]> {
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

  const body = (await res.json()) as ImagesQuery;
  const pages = Object.values(body.query?.pages ?? {});
  const out: ImageCandidate[] = [];

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

    /**
     * Commons flags trademark and personality-rights encumbrances here.
     * They are rare, and a fact card is exactly the context where they
     * bite, so anything encumbered is dropped rather than surfaced for a
     * judgement call.
     */
    if (stripHtml(metaString(info.extmetadata, 'Restrictions')).trim().length > 0) continue;

    const thumb = typeof info.thumburl === 'string' ? info.thumburl : info.url;
    if (typeof thumb !== 'string' || thumb.length === 0) continue;

    /**
     * The API appends its own utm_* campaign parameters to every URL.
     * Stored as-is they would be baked into the app and sent from every
     * reader's phone on every card, which is analytics for Wikimedia
     * about our users. The bare file URL fetches the same bytes.
     */
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
 */
function articleFor(entry: SourcedFact): string | null {
  const source = entry.provenance.sources[0];
  if (!source) return null;
  const url = source.locator.url ?? '';
  if (!url.includes('wikipedia.org')) return null;
  return source.shortName.trim() || null;
}

interface RawMatch {
  factId?: unknown;
  file?: unknown;
  why?: unknown;
}

function factLines(entries: SourcedFact[]): string {
  return entries.map((e) => `${e.fact.id} | ${e.fact.fact}`).join('\n');
}

function imageLines(candidates: ImageCandidate[]): string {
  return candidates
    .map((c) => {
      const name = c.file.replace(/^File:/, '').replace(/_/g, ' ');
      const desc = c.description.length > 0 ? ` — ${c.description}` : '';
      return `${c.file} | ${name}${desc}`;
    })
    .join('\n');
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
 */
async function proposeForBatch(
  entries: SourcedFact[],
  candidates: ImageCandidate[],
  country: string,
): Promise<Map<string, { file: string; why: string }>> {
  const out = new Map<string, { file: string; why: string }>();
  if (entries.length === 0 || candidates.length === 0) return out;

  const prompt = await loadPrompt('pick-image', {
    country,
    facts: factLines(entries),
    images: imageLines(candidates),
  });

  const raw = await completeJson<{ matches?: unknown }>({
    model: MODELS.pickImage,
    prompt,
    temperature: 0,
  });

  if (!Array.isArray(raw.matches)) return out;

  const validIds = new Set(entries.map((e) => e.fact.id));
  const validFiles = new Set(candidates.map((c) => c.file));

  for (const item of raw.matches) {
    const match = item as RawMatch;
    if (typeof match.factId !== 'string' || typeof match.file !== 'string') continue;
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

async function main(): Promise<void> {
  const refetch = process.argv.includes('--force');
  const today = new Date().toISOString().slice(0, 10);

  const decisions: ImageStore = await loadImages();
  const pool: ImagePool = refetch ? {} : await loadPool();

  // Group by article: the pool is per page, so one fetch and one model
  // call serve every fact extracted from it.
  const byArticle = new Map<string, SourcedFact[]>();
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

  console.log(`\n  Harvesting images for ${byArticle.size} article(s)`);
  if (skippedNoArticle > 0) {
    console.log(`  ${skippedNoArticle} fact(s) skipped: not sourced to a Wikipedia article`);
  }
  console.log(`  Commons only. Non-free, NC and ND cannot reach this list.\n`);

  // Images already spoken for, so a second run does not hand the same
  // photograph to a second fact.
  const used = new Map<string, number>();
  for (const decision of Object.values(decisions)) {
    if (decision.status === 'rejected' || decision.file.length === 0) continue;
    used.set(decision.file, (used.get(decision.file) ?? 0) + 1);
  }

  let proposed = 0;
  let alreadyDecided = 0;
  const failed: string[] = [];

  for (const [article, entries] of byArticle) {
    if (!pool[article]) {
      try {
        pool[article] = await fetchPool(article);
        await sleep(800);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  x ${article} — ${message}`);
        // Deliberately not cached as an empty pool. A rate-limited fetch
        // and an article with no usable images look identical once
        // written to disk, and storing [] here would mean a transient 429
        // silently cost that article its pictures for good. Left absent,
        // so the next run tries again.
        failed.push(article);
        continue;
      }
    }

    const candidates = pool[article] ?? [];

    // A fact a person has already ruled on is not asked about again.
    const undecided = entries.filter((e) => {
      if (decisions[e.fact.id]) {
        alreadyDecided += 1;
        return false;
      }
      return true;
    });

    const free = candidates.filter((c) => (used.get(c.file) ?? 0) < MAX_USES_PER_IMAGE);

    console.log(
      `  ${article}\n    ${candidates.length} usable image(s), ${free.length} unused, ${undecided.length} fact(s) to match`,
    );

    if (undecided.length === 0 || free.length === 0) continue;

    const country = entries[0]?.fact.country ?? 'NG';

    for (let i = 0; i < undecided.length; i += BATCH_SIZE) {
      const batch = undecided.slice(i, i + BATCH_SIZE);
      const stillFree = candidates.filter((c) => (used.get(c.file) ?? 0) < MAX_USES_PER_IMAGE);
      if (stillFree.length === 0) break;

      try {
        const matches = await proposeForBatch(batch, stillFree, country);

        for (const [factId, match] of matches) {
          // The model was told each image may be used once. It is not
          // trusted to have obeyed.
          if ((used.get(match.file) ?? 0) >= MAX_USES_PER_IMAGE) continue;

          decisions[factId] = {
            status: 'proposed',
            file: match.file,
            reasoning: match.why,
            decidedBy: '',
            decidedAt: today,
          };
          used.set(match.file, (used.get(match.file) ?? 0) + 1);
          proposed += 1;
          console.log(`    + ${factId}  ${match.file.replace(/^File:/, '').slice(0, 54)}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`    x batch failed — ${message}`);
      }
    }
  }

  await savePool(pool);
  await saveImages(decisions);

  const poolTotal = Object.values(pool).reduce((sum, list) => sum + list.length, 0);

  console.log(`\n  ${poolTotal} licence-clean image(s) in the pool`);
  console.log(`  ${proposed} newly proposed, ${alreadyDecided} already decided`);
  console.log(`\n  Nothing is published yet. Every proposal is waiting for a person:`);
  console.log(`  npm run studio  ->  http://localhost:4321/images\n`);
}

if (process.argv[1]?.split(sep).at(-1) === 'harvest-images.ts') {
  void main();
}
