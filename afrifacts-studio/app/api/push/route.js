import { currentJob, isBusy } from '@/lib/jobs.js';
import { publishToApp } from '@/lib/studio/publish.js';

export const dynamic = 'force-dynamic';

/**
 * Push the corpus to Supabase again, by hand.
 *
 * Every review decision and every developed agent run already pushes
 * behind itself. This is for the one case that leaves the app behind: a
 * push that failed because the network was down. It calls no model, so
 * it is free and safe to repeat.
 *
 * Refused while a job runs, because an agent develop ends with its own
 * push and two at once would race on the same rows.
 */
export async function POST() {
  if (isBusy()) {
    const stage = currentJob()?.stage ?? 'a job';
    return Response.json({ error: `Busy: ${stage} is running. Its own push comes at the end.` }, { status: 409 });
  }
  const result = await publishToApp();
  if (!result.ok) return Response.json({ error: result.error }, { status: 502 });
  return Response.json(result);
}
