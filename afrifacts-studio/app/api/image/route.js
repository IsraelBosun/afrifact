import { recordImageDecision, recordImageDecisions } from '@/lib/studio/actions.js';
import { buildImagePayload } from '@/lib/studio/payloads.js';
import { publishToApp } from '@/lib/studio/publish.js';

export const dynamic = 'force-dynamic';

/** One image decision, or a selection of them. See the review route. */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const bulk = Array.isArray(body.items);
  const result = bulk ? await recordImageDecisions(body) : await recordImageDecision(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  // Accepting an image turns a typographic card into a photo card, so
  // this changes what ships just as much as approving the fact does.
  return Response.json({
    ...(await buildImagePayload()),
    exported: await publishToApp(),
    ...(bulk ? { bulk: { done: result.done, failed: result.failed } } : {}),
  });
}
