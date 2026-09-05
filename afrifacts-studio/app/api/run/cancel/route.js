import { cancelJob } from '@/lib/jobs.js';

export const dynamic = 'force-dynamic';

/**
 * Stop the running stage.
 *
 * Cancelling is not the same as killing. The job is asked to stop, and it
 * settles the way any run settles — writing what it finished, recording
 * the ledger for the documents it paid for, and reporting a normal end on
 * the log stream. Before this existed, the only way to stop a stage that
 * was spending money was to kill the dev server, which lost the log and
 * left no record of how far the run had got.
 */
export async function POST() {
  const result = cancelJob();
  if (!result.ok) {
    // 409 rather than 400: asking to stop nothing is a state, not a
    // malformed request. The page says so instead of showing an error.
    return Response.json({ error: result.error }, { status: 409 });
  }
  return Response.json({ stage: result.stage, stopping: true });
}
