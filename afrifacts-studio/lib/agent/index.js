/**
 * The research agent: finds strong facts on its own.
 *
 * A loop, one action per turn. The model reads the state of the run and
 * picks search, read or finish; the tool runs; the observation goes back
 * into the next turn. That is the whole of what makes this an agent
 * rather than a stage: the next step depends on what the last one found.
 *
 * WHAT THE MODEL CHOOSES AND WHAT IT CANNOT. It chooses queries and
 * documents, and when to give up on a line of search. It cannot change
 * any standard, because none of them live in the model:
 *
 *   - a fact still needs a passage that string-matches the cached
 *     document (verify.js, no model);
 *   - a source still gets its tier from its hostname (source-trust.js);
 *   - "strong" is the judge panel's verdict, not the agent's opinion;
 *   - every limit is checked HERE, in code, before the tool runs. The
 *     model is told its budget so it can plan, but telling is not
 *     enforcing, and a model that asks to read a twelfth document when
 *     ten is the limit is simply stopped.
 *
 * WHY A JSON ACTION AND NOT PROVIDER TOOL CALLING. `lib/llm` exposes one
 * function, `complete()`, and the pipeline moved from Gemini to DeepSeek
 * by rewriting only that. Native tool calling is shaped differently by
 * every provider; a JSON reply with an "action" field is not. It costs
 * nothing in capability for a loop with three actions.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { AGENT_COUNTRIES, countryName } from '../judge/index.js';
import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { loadSources } from '../pipeline/sources.js';
import { DATA_DIR } from '../paths.js';
import { loadLedger } from '../studio/ledger.js';
import { deliver } from './deliver.js';
import { loadRun, saveRun } from './runs.js';
import { runPush } from '../pipeline/push-to-supabase.js';
import { PER_CATEGORY, RESERVE_PATH, WEB_QUERIES_PER_SEARCH, readTool, searchTool } from './tools.js';
import { loadReviewedCorpus } from '../check.js';
import { runImages } from '../pipeline/harvest-images.js';
import { runFurtherReading } from '../pipeline/further-reading.js';
import { isPublishable } from '../validate.js';
import { CATEGORIES } from '../types/fact.js';

/** Chosen by the owner: small runs, reviewed in one sitting. */
export const DEFAULT_TARGET = 5;

export const DEFAULT_BUDGET = {
  /** SerpApi queries, of 250 a month. One web search spends 2 to 4. */
  webQueries: 5,
  /** Documents extracted and judged. Each is roughly 20 to 40 model calls. */
  docs: 8,
  /** Agent turns, of any kind. A backstop against a model that loops. */
  steps: 24,
};

/**
 * @typedef {object} RunState
 * @property {string} runId
 * @property {string} brief
 * @property {string} country
 * @property {string} countryName
 * @property {number} target
 * @property {typeof DEFAULT_BUDGET} budget
 * @property {number} webSpent
 * @property {number} docsRead
 * @property {import('./tools.js').Found[]} found
 * @property {Set<string>} read
 * @property {{ candidate: any, votes: number, of: number, readings: any[], docId: string, slug: string, title: string, url: string }[]} strong
 * @property {{ candidate: any, votes: number, of: number, readings: any[], docId: string, slug: string, title: string, url: string, aside: string }[]} alternates
 * @property {{ step: number, thought: string, action: string, detail: string, observation: string }[]} trace
 * @property {AbortSignal} [signal]
 * @property {import('./tools.js').AppSubject[]} [app] Live facts' subjects, loaded on the first read.
 */

/**
 * Titles of documents already mined, for the prompt.
 *
 * @returns {Promise<string>}
 */
async function collectionList() {
  const [sources, ledger] = await Promise.all([loadSources(), loadLedger()]);
  const titles = sources.filter((s) => ledger.extract[s.slug]).map((s) => s.title);
  return titles.length > 0 ? titles.join('; ') : '(none yet)';
}

/**
 * The run so far, as the model reads it.
 *
 * Full observations for the last three steps, one line each for the
 * rest. A read observation lists every fact and a reason, and twenty of
 * them in full would bury the brief under its own history.
 *
 * @param {RunState} state
 */
function historyText(state) {
  if (state.trace.length === 0) return 'Nothing yet. This is the first step.';
  const recent = state.trace.length - 3;
  return state.trace
    .map((t, i) => {
      const head = `Step ${t.step}: ${t.action} ${t.detail}\n  (you thought: ${t.thought})`;
      if (i >= recent) return `${head}\n${t.observation}`;
      return `${head}\n  -> ${t.observation.split('\n')[0]}`;
    })
    .join('\n\n');
}

/**
 * Live facts per category, fewest first, and what this run has so far.
 * The agent aims at the gaps; the per-category cap in tools.js makes
 * sure it cannot ignore them.
 *
 * @param {RunState} state
 * @param {Record<string, number>} live
 */
function varietyText(state, live) {
  const cats = [...CATEGORIES].sort((a, b) => (live[a] ?? 0) - (live[b] ?? 0));
  const inApp = cats.map((c) => `${c} ${live[c] ?? 0}`).join(', ');
  const run = state.strong.length === 0
    ? 'nothing yet'
    : state.strong.map((s) => `${s.candidate.category} (${s.title})`).join('; ');
  return `Live ${state.countryName} facts in the app by category, fewest first: ${inApp}.\nThis run so far: ${run}.`;
}

/**
 * Per country: the gaps a Ghana run should aim at are Ghana's, not the
 * app's as a whole, which is mostly Nigeria.
 *
 * @param {string} country
 * @returns {Promise<Record<string, number>>}
 */
async function liveByCategory(country) {
  const live = (await loadReviewedCorpus()).filter((e) => isPublishable(e) && e.fact.country === country);
  const counts = {};
  for (const e of live) counts[e.fact.category] = (counts[e.fact.category] ?? 0) + 1;
  return counts;
}

/** @param {RunState} state */
function budgetText(state) {
  const webLeft = state.budget.webQueries - state.webSpent;
  return [
    `Strong facts so far: ${state.strong.length} of ${state.target}.`,
    `Documents read: ${state.docsRead} of ${state.budget.docs}.`,
    `Steps used: ${state.trace.length} of ${state.budget.steps}.`,
    webLeft >= WEB_QUERIES_PER_SEARCH
      ? `Web searches: available (${webLeft} paid queries left; one web search uses up to ${WEB_QUERIES_PER_SEARCH}).`
      : 'Web searches: none left this run. Wikipedia search is free and unlimited.',
  ].join('\n');
}

/**
 * @param {{
 *   brief?: string,
 *   country?: string,
 *   target?: number,
 *   budget?: Partial<typeof DEFAULT_BUDGET>,
 *   signal?: AbortSignal,
 * }} [options]
 * @param {(line: string) => void} [onProgress]
 */
export async function findFacts(options = {}, onProgress = () => {}) {
  const say = onProgress;
  const country = options.country ?? 'NG';
  if (!AGENT_COUNTRIES.includes(country)) throw new Error(`The agent does not research '${country}' yet.`);
  /** @type {RunState} */
  const state = {
    runId: `agent-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`,
    brief: String(options.brief ?? '').trim(),
    country,
    countryName: countryName(country),
    target: options.target ?? DEFAULT_TARGET,
    budget: { ...DEFAULT_BUDGET, ...options.budget },
    webSpent: 0,
    docsRead: 0,
    found: [],
    read: new Set(),
    strong: [],
    alternates: [],
    trace: [],
    signal: options.signal,
  };

  const brief =
    state.brief.length > 0
      ? state.brief
      : `No brief. Choose the subjects yourself: anything about ${state.countryName} where you expect surprising facts that are not in the app yet. Range across people, business, culture, sport and history.`;
  const collection = await collectionList();
  const live = await liveByCategory(country);

  say(`${state.runId}: target ${state.target} strong facts${state.brief ? ` on "${state.brief}"` : ', open brief'}`);

  let stopReason = '';
  while (!stopReason) {
    if (state.signal?.aborted) stopReason = 'Stopped by you.';
    else if (state.strong.length >= state.target) stopReason = `Target met: ${state.strong.length} strong facts.`;
    else if (state.trace.length >= state.budget.steps) stopReason = 'Step budget used up.';
    if (stopReason) break;

    const prompt = await loadPrompt('agent', {
      country: state.countryName,
      target: String(state.target),
      brief,
      collection,
      perCategory: String(PER_CATEGORY),
      variety: varietyText(state, live),
      budget: budgetText(state),
      history: historyText(state),
    });

    let decision;
    try {
      decision = await completeJson(
        { model: MODELS.agent, prompt, temperature: 0.4, signal: state.signal },
        say,
      );
    } catch (error) {
      if (state.signal?.aborted) continue;
      stopReason = `The agent model failed: ${error instanceof Error ? error.message : error}`;
      break;
    }

    const step = state.trace.length + 1;
    const thought = String(decision?.thought ?? '').slice(0, 400);
    const action = String(decision?.action ?? '');
    say(`[${step}] ${thought}`);

    let detail = '';
    let observation = '';
    try {
      if (action === 'search') {
        const query = String(decision.query ?? '').trim();
        detail = `"${query}"${decision.web ? ' (web)' : ''}`;
        say(`[${step}] search ${detail}`);
        observation = query.length < 3
          ? 'That query is empty. Search for a name or a subject.'
          : (await searchTool(state, query, decision.web === true)).text;
      } else if (action === 'read') {
        const id = String(decision.id ?? '').trim();
        const doc = state.found.find((f) => f.id === id);
        detail = `${id}${doc ? ` "${doc.title}"` : ''}`;
        if (state.docsRead >= state.budget.docs) {
          observation = 'Document budget used up. You can only finish now.';
        } else {
          say(`[${step}] read ${detail}`);
          const r = await readTool(state, id, say);
          observation = r.text;
          if (r.strong !== undefined) say(`[${step}] kept ${r.strong}, set aside ${r.setAside} for variety, ${r.weak} weak (total ${state.strong.length}/${state.target})`);
        }
      } else if (action === 'finish') {
        detail = String(decision.reason ?? '');
        stopReason = `The agent finished: ${detail}`;
      } else {
        observation = `'${action}' is not an action. Use search, read or finish.`;
      }
    } catch (error) {
      if (state.signal?.aborted) {
        stopReason = 'Stopped by you.';
      } else {
        observation = `That failed: ${error instanceof Error ? error.message : error}`;
      }
    }
    state.trace.push({ step, thought, action, detail, observation });
    if (state.docsRead >= state.budget.docs && action !== 'finish' && !stopReason) {
      // One more turn would only be a forced finish; save the call.
      stopReason = 'Document budget used up.';
    }
  }


  say(stopReason);

  /** @param {typeof state.strong[0]} s @param {string} key @returns {import('./runs.js').Pick} */
  const toPick = (s, key) => {
    const voter = (s.readings ?? []).find((r) => r.vote) ?? (s.readings ?? [])[0];
    return {
      key,
      fact: s.candidate.fact,
      category: s.candidate.category,
      votes: `${s.votes}/${s.of}`,
      why: voter?.why ?? '',
      title: s.title,
      url: s.url ?? '',
      ...(s.aside ? { aside: s.aside } : {}),
      candidate: s.candidate,
    };
  };

  /** @type {import('./runs.js').AgentRun} */
  const run = {
    runId: state.runId,
    status: state.strong.length > 0 ? 'awaiting' : 'empty',
    brief: state.brief,
    country: state.country,
    target: state.target,
    createdAt: new Date().toISOString(),
    stopReason,
    docsRead: state.docsRead,
    webQueriesSpent: state.webSpent,
    shortlist: state.strong.map((s, i) => toPick(s, `s${i + 1}`)),
    alternates: state.alternates.map((s, i) => toPick(s, `a${i + 1}`)),
    trace: state.trace,
  };
  // Saved even when stopped: whatever was found was paid for, and the
  // shortlist page can still offer it.
  await saveRun(run);

  if (run.status === 'awaiting') {
    say(`Shortlist ready: ${run.shortlist.length} facts, ${run.alternates.length} alternates. Waiting for you on /agent.`);
  } else {
    say('Nothing strong enough to shortlist this time.');
  }
  return { runId: run.runId, status: run.status, shortlist: run.shortlist.length, alternates: run.alternates.length };
}

/**
 * The second half: your answer, then everything after it.
 *
 * `keys` names what you kept, from the shortlist and the alternates
 * alike. Development is deep dive, quiz and citation, then a headline
 * image, then further reading, then the push. Approving IS publishing:
 * the owner wants one question per run, and a separate "go live?" would
 * be a second. `validate()` still blocks anything broken from going up.
 *
 * What you dropped from the shortlist is written to the judge's labels
 * as weak, and what you kept as strong. Those are real verdicts on facts
 * the judge liked, which is exactly the data the eval was short of.
 *
 * @param {string} runId
 * @param {string[]} keys
 * @param {{ signal?: AbortSignal, push?: boolean }} [options]
 * @param {(line: string) => void} [onProgress]
 */
export async function developFacts(runId, keys, options = {}, onProgress = () => {}) {
  const say = onProgress;
  const run = await loadRun(runId);
  if (!run) throw new Error(`No run '${runId}'.`);
  if (run.status !== 'awaiting') throw new Error(`Run '${runId}' is ${run.status}, not waiting for an answer.`);

  const wanted = new Set(keys);
  const chosen = [...run.shortlist, ...run.alternates].filter((p) => wanted.has(p.key));
  const dropped = run.shortlist.filter((p) => !wanted.has(p.key));

  run.status = 'developing';
  run.decidedAt = new Date().toISOString();
  await saveRun(run);

  await recordLabels(chosen, dropped);
  await releaseFromReserve(chosen.filter((p) => p.key.startsWith('a')));

  if (chosen.length === 0) {
    run.status = 'done';
    run.developed = [];
    await saveRun(run);
    say('Nothing kept, so nothing to develop. Your choices were saved as labels for the judge.');
    return { runId, developed: [] };
  }

  try {
    say(`Developing ${chosen.length} fact(s): deep dive, quiz and citation...`);
    const delivered = await deliver(
      chosen.map((p) => ({ candidate: p.candidate })),
      say,
      options.signal,
    );
    run.developed = delivered.ids;
    await saveRun(run);

    if (delivered.ids.length > 0 && !options.signal?.aborted) {
      say('Finding headline images...');
      await runImages({ ids: delivered.ids, webBudget: delivered.ids.length, signal: options.signal }, say);
      say('Finding further reading...');
      await runFurtherReading({ ids: delivered.ids, signal: options.signal }, say);
    }

    if (options.push !== false && !options.signal?.aborted) {
      say('Publishing to the app...');
      await runPush({ signal: options.signal }, say);
    }

    run.status = options.signal?.aborted ? 'failed' : 'done';
    if (options.signal?.aborted) run.error = 'Stopped during development.';
    await saveRun(run);
    say(`${delivered.ids.length} fact(s) developed${options.push !== false ? ' and live' : ''}: ${delivered.ids.join(', ')}`);
    return { runId, developed: delivered.ids };
  } catch (error) {
    run.status = 'failed';
    run.error = error instanceof Error ? error.message : String(error);
    await saveRun(run);
    throw error;
  }
}

/**
 * Your answer, as labels for the judge eval.
 *
 * @param {import('./runs.js').Pick[]} kept
 * @param {import('./runs.js').Pick[]} dropped
 */
async function recordLabels(kept, dropped) {
  const path = join(DATA_DIR, 'judge-labels.json');
  let labels = {};
  try {
    labels = JSON.parse(await readFile(path, 'utf8'));
  } catch {
    // First labels.
  }
  const at = new Date().toISOString().slice(0, 10);
  for (const p of kept) labels[p.fact] = { label: 'strong', by: 'agent shortlist', at };
  for (const p of dropped) labels[p.fact] = { label: 'weak', by: 'agent shortlist', at };
  await writeFile(path, `${JSON.stringify(labels, null, 2)}\n`);
}

/**
 * An alternate you chose is no longer in reserve.
 *
 * @param {import('./runs.js').Pick[]} picks
 */
async function releaseFromReserve(picks) {
  if (picks.length === 0) return;
  let reserve = [];
  try {
    reserve = JSON.parse(await readFile(RESERVE_PATH, 'utf8'));
  } catch {
    return;
  }
  const used = new Set(picks.map((p) => p.fact));
  await writeFile(RESERVE_PATH, `${JSON.stringify(reserve.filter((r) => !used.has(r.fact)), null, 2)}\n`);
}
