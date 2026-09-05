import { cachedSlugs } from '@/lib/pipeline/extract.js';
import { loadSources } from '@/lib/pipeline/sources.js';
import { searchSources } from '@/lib/pipeline/source-search.js';
import { searchQuota } from '@/lib/pipeline/image-search.js';

export const dynamic = 'force-dynamic';

/**
 * Find source documents from a description.
 *
 * Two engines behind one box: Wikipedia's own search, free and always
 * run, and Google through SerpApi, which costs one search per query from
 * a plan of 250 a month. The model writes the queries and filters the
 * results for relevance; `source-trust.js` decides what each domain is
 * worth, in code, and orders them.
 *
 * Each hit is then marked with what the studio already knows about it. A
 * search that offers you an article you added last week, with no sign
 * that you did, is a search that wastes the one thing it was meant to
 * save.
 *
 * The quota is returned alongside, because this is the one search a
 * person triggers by hand and it is the only place they can see the
 * month's budget before spending more of it. Asking SerpApi for the
 * number does not itself consume a search.
 */
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const query = params.get('q') ?? '';

  let found;
  try {
    found = await searchSources(query, {
      // The web half is opt-outable so a description can be re-run
      // against Wikipedia alone without spending anything.
      web: params.get('web') !== 'off',
      force: params.get('force') === '1',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: `The search failed: ${message}` }, { status: 502 });
  }

  const [sources, cached, quota] = await Promise.all([
    loadSources(),
    cachedSlugs(),
    searchQuota(),
  ]);

  const bare = (value) => String(value).replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();
  const onTitle = new Map(sources.map((s) => [s.title.toLowerCase(), s.slug]));
  const onUrl = new Map(sources.filter((s) => s.url).map((s) => [bare(s.url), s.slug]));
  const inCache = new Set(cached);

  return Response.json({
    query: query.trim(),
    queries: found.queries,
    cached: found.cached,
    spent: found.spent,
    warning: found.warning ?? '',
    quota,
    results: found.results.map((article) => {
      const slug = onUrl.get(bare(article.url)) ?? onTitle.get(article.title.toLowerCase()) ?? '';
      return {
        ...article,
        alreadyOnList: slug.length > 0,
        slug,
        alreadyCached: slug.length > 0 && inCache.has(slug),
      };
    }),
  });
}
