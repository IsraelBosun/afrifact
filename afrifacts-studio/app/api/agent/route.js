import { readFile } from 'node:fs/promises';

import { DEFAULT_BUDGET, developFacts, findFacts } from '@/lib/agent/index.js';
import { MAX_PASTE_CHARS, checkPasted } from '@/lib/agent/paste.js';
import { listRuns, loadRun } from '@/lib/agent/runs.js';
import { RESERVE_PATH } from '@/lib/agent/tools.js';
import { loadReviewedCorpus } from '@/lib/check.js';
import { currentJob, startJob } from '@/lib/jobs.js';
import { AGENT_COUNTRIES, countryName } from '@/lib/judge/index.js';
import { hasApiKey } from '@/lib/llm/index.js';
import { loadFactStore } from '@/lib/studio/facts.js';
import { CATEGORIES } from '@/lib/types/fact.js';
import { isPublishable } from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

/**
 * The research agent, from the studio.
 *
 * GET              every run, newest first, whether a job is running, the
 *                  app's facts per category and the reserve
 * GET ?runId=...   one run, with its trace
 * POST { action: 'find', brief?, country?, target? }  start research
 * POST { action: 'paste', text, country? }        check facts you pasted
 * POST { action: 'develop', runId, keys: [...] }  your answer: develop and publish
 *
 * Both actions are jobs on the shared runner, so the live log is the
 * ordinary `/api/run/stream`, Stop is the ordinary `/api/run/cancel`,
 * and the one-job-at-a-time lock keeps an agent run from racing an
 * extract over the same files.
 */
export async function GET(request) {
  const runId = new URL(request.url).searchParams.get('runId');
  if (runId) {
    const run = await loadRun(runId).catch(() => null);
    if (!run) return Response.json({ error: `No run '${runId}'.` }, { status: 404 });
    // Candidates carry whole passages and sources; the page needs none of it.
    const strip = ({ candidate: _candidate, ...rest }) => rest;
    return Response.json({
      run: { ...run, shortlist: run.shortlist.map(strip), alternates: run.alternates.map(strip) },
    });
  }

  const job = currentJob();
  const [runs, store, corpus, reserve] = await Promise.all([
    listRuns(),
    loadFactStore(),
    loadReviewedCorpus(),
    readFile(RESERVE_PATH, 'utf8').then(JSON.parse).catch(() => []),
  ]);

  // What each finished run put in the app, so a past run can show its
  // facts rather than a list of ids.
  const published = (ids = []) =>
    ids
      .map((id) => store[id]?.fact)
      .filter(Boolean)
      .map((f) => ({ id: f.id, fact: f.fact, category: f.category }));

  // Per country, so the page can show the gaps of the country it is about
  // to research.
  const live = corpus.filter(isPublishable);
  const byCountry = Object.fromEntries(
    AGENT_COUNTRIES.map((code) => [code, { total: 0, byCategory: Object.fromEntries(CATEGORIES.map((c) => [c, 0])) }]),
  );
  for (const e of live) {
    const slot = byCountry[e.fact.country];
    if (!slot) continue;
    slot.total += 1;
    slot.byCategory[e.fact.category] = (slot.byCategory[e.fact.category] ?? 0) + 1;
  }
  const countries = AGENT_COUNTRIES.map((code) => ({ code, name: countryName(code) }));

  return Response.json({
    runs: runs.map((r) => ({ ...r, published: published(r.developed) })),
    busy: job ? job.stage : null,
    hasApiKey: await hasApiKey(),
    live: { total: live.length, byCountry },
    countries,
    reserve: reserve
      .map((r) => ({ fact: r.fact, category: r.category, votes: r.votes ?? '', why: r.why ?? '', runId: r.runId ?? '' }))
      .reverse(),
    budget: DEFAULT_BUDGET,
    maxPaste: MAX_PASTE_CHARS,
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action === 'find') {
    const brief = typeof body.brief === 'string' ? body.brief.trim().slice(0, 400) : '';
    const target = Number.isInteger(body.target) && body.target > 0 && body.target <= 10 ? body.target : undefined;
    const country = typeof body.country === 'string' ? body.country : 'NG';
    if (!AGENT_COUNTRIES.includes(country)) {
      return Response.json({ error: `The agent does not research '${country}' yet.` }, { status: 400 });
    }
    const started = startJob('agent', (say, signal) => findFacts({ brief, country, target, signal }, say));
    return started.ok
      ? Response.json({ ok: true, job: started.job.id })
      : Response.json({ error: started.error }, { status: 409 });
  }

  if (action === 'paste') {
    const text = typeof body.text === 'string' ? body.text : '';
    if (text.trim().length < 20) return Response.json({ error: 'Paste some facts first.' }, { status: 400 });
    if (text.length > MAX_PASTE_CHARS) {
      return Response.json(
        { error: `That is ${text.length.toLocaleString()} characters; the limit is ${MAX_PASTE_CHARS.toLocaleString()}. Split it into two pastes.` },
        { status: 400 },
      );
    }
    const country = AGENT_COUNTRIES.includes(body.country) ? body.country : 'NG';
    const started = startJob('agent-paste', (say, signal) => checkPasted(text, { country, signal }, say));
    return started.ok
      ? Response.json({ ok: true, job: started.job.id })
      : Response.json({ error: started.error }, { status: 409 });
  }

  if (action === 'develop') {
    const runId = typeof body.runId === 'string' ? body.runId : '';
    const keys = Array.isArray(body.keys) ? body.keys.filter((k) => typeof k === 'string') : [];
    const run = await loadRun(runId).catch(() => null);
    if (!run) return Response.json({ error: `No run '${runId}'.` }, { status: 404 });
    if (run.status !== 'awaiting') {
      return Response.json({ error: `That run is ${run.status}, not waiting for an answer.` }, { status: 409 });
    }
    const started = startJob('agent-develop', (say, signal) => developFacts(runId, keys, { signal }, say));
    return started.ok
      ? Response.json({ ok: true, job: started.job.id })
      : Response.json({ error: started.error }, { status: 409 });
  }

  return Response.json({ error: "Unknown action. Use 'find', 'paste' or 'develop'." }, { status: 400 });
}
