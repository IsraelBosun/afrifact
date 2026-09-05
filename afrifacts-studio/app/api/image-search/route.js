import { NO_PROVIDER, hasSearchKey, searchImages, searchQuota } from '@/lib/pipeline/image-search.js';
import { rememberFound } from '@/lib/studio/images.js';

export const dynamic = 'force-dynamic';

/**
 * Look for an image the harvester never had.
 *
 * Results are written to `data/found-images.json` as they are returned,
 * before anybody clicks anything. That looks eager and is the point: a
 * decision records only a file name, and the licence and credit for that
 * file live nowhere else. Remembering them at accept time would mean a
 * page reload between searching and choosing could ship an image with no
 * attribution behind it.
 *
 * Nothing here decides anything. Every hit is a candidate in the pool,
 * which is exactly what the article harvest produces, and it still needs
 * a named person to accept it. What that person is accepting is now a
 * picture with no licence behind it, so the accepting is the whole of
 * the rights clearance — see `image-search.js` for the trade being made.
 *
 * `?force=1` is the only way to pay for a query twice. Everything else
 * — a reload, a reopened panel, the same article title asked for a
 * second fact — is answered from the cache, because the plan is 250
 * searches a month and a duplicate is a percent of it.
 */
export async function GET(request) {
  const query = new URL(request.url).searchParams.get('q') ?? '';

  // Asked before the request, so a missing key reads as a setup step
  // rather than as a search that found nothing.
  if (!(await hasSearchKey())) {
    return Response.json({ error: NO_PROVIDER }, { status: 503 });
  }

  const force = new URL(request.url).searchParams.get('force') === '1';

  let result;
  try {
    result = await searchImages(query, { force });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: `The search failed: ${message}` }, { status: 502 });
  }

  if (result.candidates.length > 0) await rememberFound(result.candidates);

  // Free to ask, so it rides along with every search rather than needing
  // a poll of its own.
  const quota = await searchQuota();

  return Response.json({
    candidates: result.candidates,
    warnings: result.warnings,
    provider: result.provider,
    cached: result.cached,
    searchedAt: result.searchedAt,
    quota,
    query: query.trim(),
  });
}
