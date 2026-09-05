import { addSource, removeSource, removeSources } from '@/lib/studio/actions.js';
import { loadSources } from '@/lib/pipeline/sources.js';
import { cachedSlugs } from '@/lib/pipeline/extract.js';
import { loadCached } from '@/lib/pipeline/fetch.js';
import { loadLedger } from '@/lib/studio/ledger.js';

export const dynamic = 'force-dynamic';

/**
 * The seed list, with what has happened to each entry.
 *
 * `cached` and `extracted` are read from disk rather than remembered,
 * for the same reason the board is: a stage that ran before the server
 * restarted still ran. They are also what makes removal honest — the
 * page can say what a removal leaves behind before you click it.
 *
 * `landedOn` is the title Wikipedia actually served, when it is not the
 * one that was typed. Fetch follows redirects, so 'Aba Women's War'
 * quietly becomes 'Women's War' and — the case that already cost this
 * corpus a fact — a near-miss title lands on a disambiguation page and
 * gets extracted as though it were an article. The seed list cannot be
 * rewritten to match, because `data/` is decisions and no stage may
 * overwrite them. Showing the divergence is the honest half.
 */
export async function GET() {
  const [sources, cached, ledger] = await Promise.all([
    loadSources(),
    cachedSlugs(),
    loadLedger(),
  ]);
  const inCache = new Set(cached);

  const docs = new Map();
  await Promise.all(
    cached.map(async (slug) => {
      const doc = await loadCached(slug);
      if (doc) docs.set(slug, doc);
    }),
  );

  /*
    Two slugs that landed on one article.

    Redirects make this reachable without anyone being careless: 'Aba
    Women's Riots' and 'Aba Women's War' are different titles that
    Wikipedia serves as the same page. Fetch is free so it costs nothing,
    but extract keys off the slug — it would send the same document to the
    model twice, under two names, and the ledger would call both of them
    honest work. The duplicate is only visible after the resolution, which
    is why it is computed here and not at the point of adding.
  */
  const byTitle = new Map();
  for (const [slug, doc] of docs) {
    const list = byTitle.get(doc.title) ?? [];
    list.push(slug);
    byTitle.set(doc.title, list);
  }

  /*
    Did the fetch land somewhere other than where it was pointed?

    The test is per kind, because "somewhere else" means different things.

    A Wikipedia article is asked for BY TITLE, so a different title coming
    back is the whole signal: fetch follows redirects, 'Aba Women's War'
    quietly becomes 'Women's War', and — the case that already cost this
    corpus a fact — a near-miss title lands on a disambiguation page and
    is extracted as though it were an article.

    A web page is asked for by URL, and its title is EXPECTED to change:
    the entry's title is guessed from the URL slug and `fetchWebPage`
    replaces it with what the page calls itself, on purpose. Testing the
    title there flagged every single web source, permanently — the row
    could never be hidden, and it said "Wikipedia served…" about a page
    Wikipedia had nothing to do with. The URL is what to compare.
  */
  const bare = (value) =>
    String(value ?? '').replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();

  const rows = sources.map((entry) => {
    const doc = docs.get(entry.slug) ?? null;
    const twins = doc ? (byTitle.get(doc.title) ?? []).filter((s) => s !== entry.slug) : [];

    let landedOn = '';
    if (doc) {
      landedOn =
        entry.kind === 'web'
          ? bare(doc.url) !== bare(entry.url)
            ? doc.url
            : ''
          : doc.title !== entry.title
            ? doc.title
            : '';
    }

    return {
      ...entry,
      cached: doc !== null,
      extracted: Boolean(ledger.extract[entry.slug]),
      landedOn,
      // The title the document actually turned out to have. For a web
      // page this is the real headline rather than the slug guess, and
      // it is the honest thing to put on the row.
      resolvedTitle: doc?.title ?? '',
      duplicateOf: twins,
      url: doc?.url ?? entry.url ?? '',
    };
  });

  return Response.json({
    sources: rows,
    // Cached documents with no seed entry: articles fetched under an
    // earlier list. They still extract, so the fetch count and the source
    // count legitimately disagree, and saying so beats looking like a bug.
    orphaned: cached.filter((slug) => !sources.some((s) => s.slug === slug)),
  });
}

export async function POST(request) {
  const result = await addSource(await request.json());
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ source: result.source, note: result.note ?? '' });
}

/** One article off the list, or a selection of them. */
export async function DELETE(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  if (Array.isArray(body.slugs)) {
    const result = await removeSources(body);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    return Response.json({ kept: result.kept, done: result.done, failed: result.failed });
  }

  const result = await removeSource(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ kept: result.kept });
}
