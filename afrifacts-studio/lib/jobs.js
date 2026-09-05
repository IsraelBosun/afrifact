/**
 * Running a pipeline stage from a button.
 *
 * A stage takes minutes and calls a model dozens of times, so it cannot
 * be awaited inside a request — a server action or a route handler is
 * request-scoped, and the browser would time out with no way to tell a
 * dead run from a slow one. So: the request starts a job and returns, the
 * job keeps running in module state, and the page subscribes to its log.
 *
 * Two rules this enforces, both of which have teeth:
 *
 *   1. ONE JOB AT A TIME. Two extract runs would both write
 *      candidates.json and you would get whichever finished last, with no
 *      error and no clue. The lock is the whole reason this file exists
 *      rather than each route just calling its stage.
 *
 *   2. THE LOG SURVIVES THE TAB. Closing the page or losing the socket
 *      must not lose what a twenty-minute run said. Lines are buffered
 *      here and replayed to whoever connects.
 *
 *   3. A RUN CAN BE STOPPED. Until there was a Stop button the only way
 *      to cancel a stage that was spending money was to kill the dev
 *      server — which also took the log, and left the pipeline unable to
 *      say how far the run had got. Each job owns an AbortController and
 *      the stage is handed its signal, so a stop lands between documents
 *      and keeps whatever finished.
 *
 * Module state does not survive a dev-server hot reload. That is
 * acceptable and deliberately not worked around: every stage writes its
 * result to disk, so the pipeline view reads what actually happened from
 * `status.js` rather than trusting this. A lost job log is a cosmetic
 * loss; a lost candidates file would not be.
 */

/**
 * @typedef {object} Job
 * @property {string} id
 * @property {string} stage
 * @property {'running' | 'done' | 'failed'} state
 * @property {string} startedAt
 * @property {string} [finishedAt]
 * @property {string[]} log
 * @property {unknown} [result]
 * @property {string} [error]
 * @property {boolean} [cancelled] Set when a stop was asked for. The job
 *   still settles normally afterwards — a cancelled run is a short run,
 *   not a failed one.
 * @property {AbortController} [controller]
 */

/** @type {Job | null} */
let current = null;

/** @type {Job[]} */
const history = [];

/** @type {Set<(event: { type: string, job: Job, line?: string }) => void>} */
const listeners = new Set();

/** How many lines to keep. A long run is chatty; a browser is not infinite. */
const MAX_LOG = 2000;

/** How many finished jobs to remember. */
const MAX_HISTORY = 10;

function emit(event) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // A dead subscriber must not take down the run that is feeding it.
    }
  }
}

/**
 * Subscribe to job events. Returns an unsubscribe function.
 *
 * @param {(event: { type: string, job: Job, line?: string }) => void} listener
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The job running right now, if any. */
export function currentJob() {
  return current;
}

/** Finished jobs, newest first. */
export function jobHistory() {
  return history;
}

/** True while a stage is running. */
export function isBusy() {
  return current !== null && current.state === 'running';
}

/**
 * Start a stage.
 *
 * `run` is handed an `onProgress` that pushes a line to the job's log and
 * out to every subscriber. It is the same callback the CLI passes
 * `console.log` to, which is what lets one implementation serve both.
 *
 * @param {string} stage
 * @param {(onProgress: (line: string) => void, signal: AbortSignal) => Promise<unknown>} run
 * @returns {{ ok: true, job: Job } | { ok: false, error: string }}
 */
export function startJob(stage, run) {
  if (isBusy()) {
    return {
      ok: false,
      error: `'${current.stage}' is still running. One stage at a time — two runs would write the same files.`,
    };
  }

  const controller = new AbortController();

  /** @type {Job} */
  const job = {
    id: `${stage}-${Date.now()}`,
    stage,
    state: 'running',
    startedAt: new Date().toISOString(),
    log: [],
    controller,
  };
  current = job;
  emit({ type: 'start', job });

  /** @param {string} line */
  const onProgress = (line) => {
    job.log.push(line);
    if (job.log.length > MAX_LOG) job.log.splice(0, job.log.length - MAX_LOG);
    emit({ type: 'line', job, line });
  };

  // Deliberately not awaited: the caller is a request that must return
  // now. Every path below settles the job, so it cannot be left running.
  void (async () => {
    try {
      job.result = await run(onProgress, controller.signal);
      job.state = 'done';
    } catch (error) {
      // A stage that threw because it was aborted did what it was told.
      // Reporting that as a failure would put a red line in the log for a
      // button the user pressed on purpose.
      if (controller.signal.aborted) {
        job.state = 'done';
        onProgress('Stopped.');
      } else {
        job.error = error instanceof Error ? error.message : String(error);
        job.state = 'failed';
        onProgress(`FAILED — ${job.error}`);
      }
    } finally {
      delete job.controller;
      job.finishedAt = new Date().toISOString();
      history.unshift(job);
      if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
      current = null;
      emit({ type: 'end', job });
    }
  })();

  return { ok: true, job };
}

/**
 * Ask the running job to stop.
 *
 * It does not kill anything. The signal is handed to the stage, which
 * checks it between units of work and settles normally — so a stopped
 * extract keeps the documents it finished, and a stopped enrich keeps the
 * facts it promoted. That is the difference between stopping a run and
 * killing the process, which was the only option before.
 *
 * @returns {{ ok: true, stage: string } | { ok: false, error: string }}
 */
export function cancelJob() {
  if (!isBusy()) return { ok: false, error: 'Nothing is running.' };
  const job = current;
  job.cancelled = true;
  job.log.push('Stopping after the current document…');
  emit({ type: 'line', job, line: 'Stopping after the current document…' });
  job.controller?.abort();
  return { ok: true, stage: job.stage };
}
