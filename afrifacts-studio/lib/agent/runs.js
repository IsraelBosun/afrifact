/**
 * Agent runs, on disk.
 *
 * A run stops halfway on purpose: research finds a shortlist, and then it
 * waits for the one question the owner wants to be asked. That wait can
 * be minutes or days, and the job runner's memory does not survive a dev
 * server reload. So the run lives here, in `data/`, from the moment it
 * has a shortlist until it is developed.
 *
 * In `data/` and not `_generated/` because a shortlist is paid for and
 * cannot be recomputed: the same brief tomorrow reads different documents
 * and judges them differently. The trace goes in the same file, because
 * it is the answer to "why is this fact in my app".
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { DATA_DIR } from '../paths.js';

export const RUNS_DIR = join(DATA_DIR, 'agent-runs');

/**
 * @typedef {'awaiting' | 'developing' | 'done' | 'empty' | 'failed'} RunStatus
 *   awaiting   the shortlist is ready and waiting for you
 *   developing you answered; deep dives, images and links are being made
 *   done       developed and pushed
 *   empty      research ended with nothing strong enough to show
 *   failed     development stopped part-way; see `error`
 */

/**
 * @typedef {object} Pick One fact on the shortlist or among the alternates.
 * @property {string} key   s1.. for the shortlist, a1.. for alternates.
 * @property {string} fact
 * @property {string} category
 * @property {string} votes e.g. "3/3"
 * @property {string} why   A reader's reason, from the judge.
 * @property {string} title The document it came from.
 * @property {string} url
 * @property {string} [aside] For an alternate: why it was set aside.
 * @property {any} candidate The full candidate, for development.
 */

/**
 * @typedef {object} AgentRun
 * @property {string} runId
 * @property {RunStatus} status
 * @property {string} brief
 * @property {string} [country] ISO code; runs before countries existed were Nigeria.
 * @property {number} target
 * @property {string} createdAt
 * @property {string} stopReason
 * @property {number} docsRead
 * @property {number} webQueriesSpent
 * @property {Pick[]} shortlist
 * @property {Pick[]} alternates
 * @property {object[]} trace
 * @property {string[]} [developed] Fact ids written.
 * @property {'research' | 'paste'} [kind] Paste runs check facts you pasted; research is the default.
 * @property {{ n: number, claim: string, status: string, why: string }[]} [unverified] Paste runs: claims that did not become facts.
 * @property {string} [decidedAt]
 * @property {string} [error]
 */

/** @param {string} runId */
function pathFor(runId) {
  if (!/^agent-[0-9T-]+$/.test(runId)) throw new Error(`'${runId}' is not a run id.`);
  return join(RUNS_DIR, `${runId}.json`);
}

/** @param {AgentRun} run */
export async function saveRun(run) {
  await mkdir(RUNS_DIR, { recursive: true });
  await writeFile(pathFor(run.runId), `${JSON.stringify(run, null, 2)}\n`);
}

/**
 * @param {string} runId
 * @returns {Promise<AgentRun | null>}
 */
export async function loadRun(runId) {
  try {
    return JSON.parse(await readFile(pathFor(runId), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Every run, newest first, without the bulky trace and candidates.
 *
 * @returns {Promise<Omit<AgentRun, 'trace'>[]>}
 */
export async function listRuns() {
  let files = [];
  try {
    files = (await readdir(RUNS_DIR)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  const runs = [];
  for (const f of files) {
    try {
      const run = JSON.parse(await readFile(join(RUNS_DIR, f), 'utf8'));
      const strip = (p) => {
        const { candidate: _candidate, ...rest } = p;
        return rest;
      };
      runs.push({
        ...run,
        trace: undefined,
        shortlist: (run.shortlist ?? []).map(strip),
        alternates: (run.alternates ?? []).map(strip),
      });
    } catch {
      // A half-written file is skipped rather than taking the page down.
    }
  }
  return runs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}
