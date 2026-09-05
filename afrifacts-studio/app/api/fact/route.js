import { changeQueued, deleteFact, deleteFacts, saveFactEdit } from '@/lib/studio/actions.js';
import { buildFactsPayload } from '@/lib/studio/payloads.js';
import { publishToApp } from '@/lib/studio/publish.js';

export const dynamic = 'force-dynamic';

/**
 * Change a fact that is already in the corpus.
 *
 * One route, two operations, because they are the same thing from the
 * reviewer's side: this fact should not go out as it stands, and I am
 * doing something about it — fixing it, or holding it back. `op` says
 * which.

 * Retire used to be a third. It differed from queue only in the words
 * on the button: both took a fact out of the app, both were reversed by
 * one click, and neither did anything the other could not. Two names
 * for one state is a question the reviewer has to answer before every
 * click, and the answer never mattered. Both answer with the whole refreshed queue, so the page never
 * has to guess what the write did to the rest of the list — an edit to a
 * claim can clear an approval, which changes a fact's status without the
 * reviewer touching its status.
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  let result;
  if (body.op === 'edit') result = await saveFactEdit(body);
  else if (body.op === 'queue') result = await changeQueued(body);
  // Delete is the one operation here that does not answer "this fact
  // should not go out as it stands". It is on this route anyway because
  // it is the same door — one fact, one write, the whole queue back —
  // and a route of its own would only mean a second place to forget the
  // export runs afterwards.
  else if (body.op === 'delete') result = await deleteFact(body);
  else if (body.op === 'deleteMany') result = await deleteFacts(body);
  else result = { ok: false, error: `Unknown operation '${body.op ?? ''}'.` };

  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  return Response.json({
    ...(await buildFactsPayload()),
    changed: result.changed ?? [],
    removed: result.removed ?? null,
    bulk: typeof result.done === 'number' ? { done: result.done, failed: result.failed } : null,
    // Set when the edit touched the claim or a passage and the fact was
    // approved. The page has to say so out loud: the reviewer edited one
    // word and quietly unpublished a fact.
    resetApproval: result.resetApproval ?? false,
    // The passage check, re-run because the claim moved. It does not
    // block the save — a half-finished edit is a legitimate state — but
    // an ungrounded claim is exactly what the page must not hide.
    verification: result.verification ?? null,
    exported: await publishToApp(),
  });
}
