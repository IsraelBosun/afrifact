/**
 * The facts the verifier threw out, and the one way back in.
 *
 * WHY THIS EXISTS
 *
 * `_generated/rejects.json` has always been written and never shown. The
 * argument for keeping rejects is in paths.js — the bar is not calibrated,
 * and a filter that is silently too harsh looks exactly like Nigeria being
 * short of surprising facts. But nothing in the browser read the file, so
 * "silently" was literal: a fact could be extracted, refused, and recorded
 * with its reason, and the only way to learn any of that was to open a
 * JSON file by hand. Someone lost an afternoon to that, which is what
 * this route is for.
 *
 * WHY A REJECT CAN BE EDITED HERE
 *
 * Most rejects are one word from being right. The common failure is a
 * true detail the passage does not contain — a model welding its own
 * memory onto a real quotation — and the fix is to drop the detail or
 * cite it properly, which is a text edit and not a pipeline run.
 *
 * The edit is re-verified by the SAME function that rejected it, never by
 * a flag that marks it approved. That is the whole point: a human may
 * reword a claim, but nobody may wave one past the check. If the rewrite
 * still is not in the passage it still fails, and it says why.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { CANDIDATES_PATH, REJECTS_PATH, ensureDirs } from '@/lib/paths.js';
import { factGroundedInPassage } from '@/lib/pipeline/verify.js';
import { loadSources } from '@/lib/pipeline/sources.js';

export const dynamic = 'force-dynamic';

/** @param {string} path */
async function readArray(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Identity of a reject.
 *
 * Deliberately not `keyOf`: a reject is edited in place, so keying on the
 * head of the claim would change the key at the moment the row is being
 * matched. Slug plus the ORIGINAL text is what stays put.
 *
 * @param {{ slug: string, fact: string }} row
 */
function rejectKey(row) {
  return `${row.slug}::${row.fact}`;
}

export async function GET() {
  const [rejects, sources] = await Promise.all([readArray(REJECTS_PATH), loadSources()]);
  const meta = new Map(sources.map((s) => [s.slug, s]));

  // Grouped by article rather than by time. rejects.json is merged by
  // slug and never appended chronologically, so there is no honest
  // ordering by date — and by article is how they are actually read.
  const byArticle = new Map();
  for (const row of rejects) {
    const list = byArticle.get(row.slug) ?? [];
    list.push({ ...row, key: rejectKey(row) });
    byArticle.set(row.slug, list);
  }

  const articles = [...byArticle.entries()]
    .map(([slug, rows]) => ({
      slug,
      title: meta.get(slug)?.title ?? slug,
      url: meta.get(slug)?.url ?? '',
      rows,
    }))
    .sort((a, b) => b.rows.length - a.rows.length);

  return Response.json({ total: rejects.length, articles });
}

/**
 * Re-check an edited claim, and keep it if it now holds.
 *
 * Body: `{ key, fact, category }`. The passage is NOT taken from the
 * request — it is read from the stored reject. A passage supplied by the
 * browser alongside the claim it is meant to justify would make the check
 * meaningless, because both sides of the comparison would be under the
 * same person's control.
 */
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const key = typeof body?.key === 'string' ? body.key : '';
  const edited = typeof body?.fact === 'string' ? body.fact.trim() : '';
  const category = typeof body?.category === 'string' ? body.category : '';
  const keepIt = body?.keep === true;

  if (!key || !edited) {
    return Response.json({ error: 'Need a reject and some text.' }, { status: 400 });
  }

  const rejects = await readArray(REJECTS_PATH);
  const row = rejects.find((r) => rejectKey(r) === key);
  if (!row) return Response.json({ error: 'That reject is no longer on file.' }, { status: 404 });

  const verdict = factGroundedInPassage(edited, row.passage);

  // A dry run: the page checks as you type, and only asks to keep when
  // you press the button. Checking must never write.
  if (!keepIt || !verdict.ok) {
    return Response.json({ ok: verdict.ok, reasons: verdict.reasons ?? [] });
  }

  const sources = await loadSources();
  const source = sources.find((s) => s.slug === row.slug);
  if (!source) {
    return Response.json(
      { error: `No source on the list for '${row.slug}', so this cannot be sourced.` },
      { status: 409 },
    );
  }

  /*
    Built to the same shape extract writes, so enrich cannot tell the
    difference — with two fields that say where it came from.

    `surprise` is left null rather than filled with a flattering guess.
    The model's scores are already known to inflate (§11), and inventing
    three 5s for a fact a human rescued would put a number in the UI that
    nobody produced.
  */
  const candidate = {
    fact: edited,
    passage: row.passage,
    category: category || row.category || 'History',
    surprise: null,
    reasoning: 'Rewritten by hand from a verifier reject, then re-verified.',
    volatile: false,
    slug: row.slug,
    country: source.country ?? 'NG',
    source: {
      title: source.title,
      url: source.url,
      tier: source.tier,
      fetchedAt: new Date().toISOString().slice(0, 10),
    },
    rescued: { from: row.fact, reasons: row.reasons ?? [] },
  };

  const candidates = await readArray(CANDIDATES_PATH);

  // Same claim twice would enrich twice into two facts saying one thing.
  if (candidates.some((c) => c.slug === candidate.slug && c.fact === candidate.fact)) {
    return Response.json({ error: 'That claim is already waiting as a candidate.' }, { status: 409 });
  }

  await ensureDirs();
  await writeFile(CANDIDATES_PATH, JSON.stringify([...candidates, candidate], null, 2), 'utf8');
  await writeFile(
    REJECTS_PATH,
    JSON.stringify(
      rejects.filter((r) => rejectKey(r) !== key),
      null,
      2,
    ),
    'utf8',
  );

  return Response.json({ ok: true, kept: true, reasons: [] });
}
