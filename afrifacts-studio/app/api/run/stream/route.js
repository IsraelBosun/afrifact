import { currentJob, subscribe } from '@/lib/jobs.js';

export const dynamic = 'force-dynamic';

/**
 * The live log, as server-sent events.
 *
 * SSE rather than a websocket because this is one-way and Node's own
 * Response streaming does it with no dependency. The whole point of the
 * job runner is that a stage outlives the request that started it, so
 * this is a separate connection that can come and go while the run
 * continues.
 *
 * A client that connects mid-run gets the backlog replayed first, so
 * opening the page five minutes into a twenty-minute enrich shows what
 * has happened rather than an empty box.
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let open = true;

      const send = (event, data) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          open = false;
        }
      };

      // Replay whatever the running job has already said.
      const job = currentJob();
      if (job) {
        send('start', { stage: job.stage, id: job.id });
        for (const line of job.log) send('line', { line });
      }

      const unsubscribe = subscribe((event) => {
        if (event.type === 'line') send('line', { line: event.line });
        else if (event.type === 'start') send('start', { stage: event.job.stage, id: event.job.id });
        else if (event.type === 'end') {
          send('end', {
            stage: event.job.stage,
            state: event.job.state,
            error: event.job.error ?? null,
            result: event.job.result ?? null,
          });
        }
      });

      // A comment frame every 20s. Without traffic some proxies and
      // browsers give up on an idle stream, and a fetch stage can be
      // quiet for a while.
      const keepAlive = setInterval(() => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch {
          open = false;
        }
      }, 20000);

      // Called when the client disconnects.
      this.cleanup = () => {
        open = false;
        clearInterval(keepAlive);
        unsubscribe();
      };
    },
    cancel() {
      this.cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
