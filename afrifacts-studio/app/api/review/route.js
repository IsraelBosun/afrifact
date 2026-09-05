import { recordReview, recordReviews } from '@/lib/studio/actions.js';
import { buildFactsPayload } from '@/lib/studio/payloads.js';
import { publishToApp } from '@/lib/studio/publish.js';

export const dynamic = 'force-dynamic';

/**
 * One decision, or a selection of them.
 *
 * The bulk path is not a faster path: it runs the same rule per fact and
 * reports what it could not do. What it does save is the export — sixty
 * approvals used to mean sixty rewrites of the app's data file, so the
 * publish happens once at the end of the batch instead.
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const bulk = Array.isArray(body.items);
  const result = bulk ? await recordReviews(body) : await recordReview(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  // An approval that does not reach the app is not visibly an approval.
  return Response.json({
    ...(await buildFactsPayload()),
    exported: await publishToApp(),
    ...(bulk ? { bulk: { done: result.done, failed: result.failed } } : {}),
  });
}
