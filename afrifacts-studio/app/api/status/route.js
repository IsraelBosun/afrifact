import { pipelineStatus } from '@/lib/status.js';
import { currentJob, jobHistory } from '@/lib/jobs.js';

/** Read from disk on every request; never cached. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await pipelineStatus();
  return Response.json({
    ...status,
    current: currentJob(),
    history: jobHistory().map((j) => ({
      id: j.id,
      stage: j.stage,
      state: j.state,
      startedAt: j.startedAt,
      finishedAt: j.finishedAt,
      error: j.error,
    })),
  });
}
