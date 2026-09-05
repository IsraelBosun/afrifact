/**
 * Image decisions, stored outside the corpus files.
 *
 * Same reasoning as `reviews.ts`, and the same shape of problem: an image
 * belongs to a fact, but `_enriched.ts` is regenerated on every
 * `npm run enrich`, so anything written in there is lost on the next run.
 * Decisions are precious and pools are cheap, so they are separated:
 *
 *   `_image-pool.json`  generated, regenerable, per-article candidates
 *   `images.json`       decided, keyed by fact id, never regenerated
 *
 * `images.json` is what a Supabase `fact_images` table replaces later.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const STORE = join(here, '..', '..', 'images.json');

/**
 * One free-licence image from Wikimedia Commons.
 *
 * Everything needed to render a credit line lives here, because a credit
 * is a licence condition and not a nice-to-have: a card without it is a
 * licence breach, not a cosmetic bug (CLAUDE.md §10).
 */
export interface ImageCandidate {
  /** Commons file title, e.g. 'File:Igbo-Ukwu bronze vessel.jpg'. */
  file: string;
  /** Scaled to roughly the width the card and the share card both need. */
  url: string;
  /** The Commons file page. The attribution trail, kept for the record. */
  descriptionUrl: string;
  width: number;
  height: number;
  /** Human-readable, e.g. 'CC BY-SA 4.0'. Goes in `FactImage.license`. */
  license: string;
  /** Machine-readable where Commons gives one, e.g. 'cc-by-sa-4.0'. */
  licenseId: string;
  /** Author, HTML stripped. Empty for many public-domain works. */
  artist: string;
  /** Commons' own caption. What the model reads, and what the reviewer sees. */
  description: string;
}

/**
 * 'proposed' is the model's suggestion and is NOT publishable — it is a
 * queue entry waiting for a person. Only 'accepted' reaches the app.
 * 'rejected' is a decision too: it says this fact stays typographic, and
 * it stops the next run proposing the same image again.
 */
export type ImageStatus = 'proposed' | 'accepted' | 'rejected';

export interface ImageDecision {
  status: ImageStatus;
  /** Commons file title of the chosen image. */
  file: string;
  /** Why this image was matched to this fact. */
  reasoning: string;
  /** Who decided. Empty while the decision is still the model's. */
  decidedBy: string;
  decidedAt: string;
}

/** factId -> the image decision for it. */
export type ImageStore = Record<string, ImageDecision>;

function isStatus(value: unknown): value is ImageStatus {
  return value === 'proposed' || value === 'accepted' || value === 'rejected';
}

/** A corrupt entry should cost one image, not the whole store. */
function parse(raw: string): ImageStore {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return {};

  const store: ImageStore = {};
  for (const [factId, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as Record<string, unknown>;
    if (!isStatus(entry.status)) continue;
    if (typeof entry.file !== 'string') continue;

    store[factId] = {
      status: entry.status,
      file: entry.file,
      reasoning: typeof entry.reasoning === 'string' ? entry.reasoning : '',
      decidedBy: typeof entry.decidedBy === 'string' ? entry.decidedBy : '',
      decidedAt: typeof entry.decidedAt === 'string' ? entry.decidedAt : '',
    };
  }
  return store;
}

export async function loadImages(): Promise<ImageStore> {
  try {
    return parse(await readFile(STORE, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    console.warn(`  Could not read images.json, starting empty: ${String(error)}`);
    return {};
  }
}

export async function saveImages(store: ImageStore): Promise<void> {
  await writeFile(STORE, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

export async function saveImageDecision(
  factId: string,
  decision: ImageDecision,
): Promise<ImageStore> {
  const store = await loadImages();
  store[factId] = decision;
  await saveImages(store);
  return store;
}

export const IMAGES_PATH = STORE;

/** The generated side: per-article candidate pools, safe to delete. */
export const POOL_PATH = join(here, '..', '..', '_image-pool.json');

/** Wikipedia article title -> every image that survived the licence filter. */
export type ImagePool = Record<string, ImageCandidate[]>;

export async function loadPool(): Promise<ImagePool> {
  try {
    const parsed: unknown = JSON.parse(await readFile(POOL_PATH, 'utf8'));
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as ImagePool;
  } catch {
    return {};
  }
}

export async function savePool(pool: ImagePool): Promise<void> {
  await writeFile(POOL_PATH, `${JSON.stringify(pool, null, 2)}\n`, 'utf8');
}

/** Find a candidate by file title across every pool. */
export function findCandidate(pool: ImagePool, file: string): ImageCandidate | null {
  for (const candidates of Object.values(pool)) {
    const hit = candidates.find((c) => c.file === file);
    if (hit) return hit;
  }
  return null;
}

/**
 * The credit line shown on the card and burned into every share export.
 *
 * Attribution is a licence condition, so this is built from the record
 * rather than typed by hand. Public-domain works often have no named
 * author, which is why the artist is conditional and Commons is not.
 */
export function creditFor(candidate: ImageCandidate): string {
  const artist = candidate.artist.trim();
  return artist.length > 0
    ? `Photo · ${artist} · Wikimedia Commons`
    : 'Photo · Wikimedia Commons';
}
