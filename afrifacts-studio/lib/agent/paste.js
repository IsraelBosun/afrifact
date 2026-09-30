/**
 * Paste mode: facts you saw, checked and made into cards.
 *
 * The research agent chooses what to look for. Here you have already
 * chosen: you paste whatever you came across, as much as you like, and
 * this works out how many separate facts are in it, finds a source for
 * each, and ends on the same shortlist as a research run. The shortlist
 * is still the one question; Develop runs the same development and
 * publishing as a research run.
 *
 * What does NOT change is the standard. A pasted fact is a claim from the
 * internet, often half-right, and it becomes a card only the way every
 * fact does: a verbatim passage that string-matches a real document
 * (verify.js, no model), a card sentence grounded in that passage, and
 * people introduced. The model reads and writes; code decides whether it
 * is true enough to show you.
 *
 * Each claim ends in one of:
 *   verified      a source states it; on the shortlist, ticked
 *   corrected     a source covers it but says something different; offered
 *                 as an alternate with the difference spelled out, unticked
 *   in the app    already a live fact
 *   unconfirmed   no source found that states it; listed with why
 */

import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { AGENT_COUNTRIES, countryName, mapLimit } from '../judge/index.js';
import { dedupeAgainstCorpus } from '../pipeline/dedupe.js';
import { checkIntroductions, introduce } from '../pipeline/introductions.js';
import { shorten } from '../pipeline/shorten.js';
import { searchArticles, searchSources } from '../pipeline/source-search.js';
import { leadOf, verify } from '../pipeline/verify.js';
import { storedFacts } from '../studio/facts.js';
import { CATEGORIES } from '../types/fact.js';
import { SURPRISE_AXES, SURPRISE_THRESHOLD } from '../types/provenance.js';
import { MAX_FACT_CHARS } from '../validate.js';
import { saveRun } from './runs.js';
import { WEB_QUERIES_PER_SEARCH, judgeOne, openDocument } from './tools.js';

/** Longest paste read, in characters. About 40 social-media posts. */
export const MAX_PASTE_CHARS = 30000;
/** Claims checked from one paste. Each costs 2 to 8 model calls. */
export const MAX_CLAIMS = 60;
/**
 * Paid web searches per paste, of 250 a month. Wikipedia is tried first
 * and is free; the web is only for claims Wikipedia could not confirm.
 */
export const PASTE_WEB_QUERIES = 8;
/** Wikipedia articles tried per claim before giving up on Wikipedia. */
const DOCS_PER_CLAIM = 3;

/**
 * @typedef {object} Claim
 * @property {number} n     1-based, in paste order.
 * @property {string} claim
 * @property {string} country
 * @property {string[]} look
 */

/**
 * Split the paste into claims. The count is the model's reading of the
 * text, not a number you pick.
 *
 * @param {string} text
 * @param {string} fallback ISO code for a claim with no clear country.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Claim[]>}
 */
async function splitClaims(text, fallback, signal) {
  const prompt = await loadPrompt('paste-split', {
    text,
    countries: AGENT_COUNTRIES.map((c) => `${c} (${countryName(c)})`).join(', '),
    fallback,
  });
  const raw = await completeJson({ model: MODELS.agent, prompt, temperature: 0, signal });
  const rows = Array.isArray(raw?.facts) ? raw.facts : [];
  return rows
    .filter((r) => typeof r?.claim === 'string' && r.claim.trim().length > 10)
    .map((r, i) => ({
      n: i + 1,
      claim: r.claim.trim(),
      country: AGENT_COUNTRIES.includes(r.country) ? r.country : fallback,
      look: (Array.isArray(r.look) ? r.look : [])
        .filter((t) => typeof t === 'string' && t.trim().length > 1)
        .map((t) => t.trim())
        .slice(0, 3),
    }));
}

/**
 * One claim against one document.
 *
 * @param {Claim} claim
 * @param {any} doc
 * @param {{ signal?: AbortSignal, say: (line: string) => void }} ctx
 * @returns {Promise<{ status: 'supported' | 'different', candidate: any, note: string } | { status: 'absent' | 'failed', why: string }>}
 */
async function confirmIn(claim, doc, ctx) {
  const prompt = await loadPrompt('paste-confirm', {
    claim: claim.claim,
    country: countryName(claim.country),
    title: doc.title,
    document: doc.text,
  });
  const raw = await completeJson({ model: MODELS.extract, prompt, temperature: 0, signal: ctx.signal });
  const status = raw?.status;
  if (status !== 'supported' && status !== 'different') {
    return { status: 'absent', why: `"${doc.title}" does not say it.` };
  }

  let fact = typeof raw.fact === 'string' ? raw.fact.trim() : '';
  const passage = typeof raw.passage === 'string' ? raw.passage.trim() : '';
  const category = CATEGORIES.includes(raw.category) ? raw.category : '';
  if (!fact || !passage || !category) return { status: 'failed', why: `The reading of "${doc.title}" came back incomplete.` };

  if (fact.length > MAX_FACT_CHARS) {
    const short = await shorten(fact, passage, { signal: ctx.signal });
    if (!short) return { status: 'failed', why: `Too long for the card, and no grounded shorter version was found.` };
    fact = short;
  }

  // The same gate as every extracted fact: the passage must be in the
  // document word for word, and the card sentence must stay inside it.
  const checked = verify(fact, passage, doc.text);
  if (!checked.ok) return { status: 'failed', why: `Found in "${doc.title}" but failed the check: ${checked.reasons[0]}` };

  // The bar validate() holds every fact to at publish time. Measured: a
  // corrected lion fact scored 2 on specificity, was shortlisted,
  // developed and pushed, and then sat unpublished because validate()
  // blocked it. Checked here, it is "not usable" with a reason instead.
  const score = (v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? v : 1);
  const raws = raw.surprise ?? {};
  const surprise = {
    priorProbability: score(raws.priorProbability),
    specificity: score(raws.specificity),
    explicability: score(raws.explicability),
  };
  const low = SURPRISE_AXES.filter((axis) => surprise[axis] < SURPRISE_THRESHOLD);
  if (low.length > 0) {
    const label = { priorProbability: 'too widely known', specificity: 'too vague', explicability: 'bare trivia' };
    return {
      status: 'failed',
      why: `What "${doc.title}" supports is ${low.map((a) => label[a]).join(' and ')} to publish: "${fact.slice(0, 120)}"`,
    };
  }

  let lead;
  const intro = await checkIntroductions(fact, { signal: ctx.signal });
  if (!intro.ok) {
    const opening = leadOf(doc.text);
    const fixed = await introduce(fact, passage, opening, intro.missing, { signal: ctx.signal });
    if (!fixed) return { status: 'failed', why: `Assumes the reader knows ${intro.missing.join(', ')}, and the source does not say who they are.` };
    fact = fixed.fact;
    if (fixed.usedLead) lead = opening;
  }

  return {
    status,
    note: status === 'different' ? String(raw.note ?? '').trim() : '',
    candidate: {
      fact,
      passage,
      category,
      surprise,
      reasoning: `Pasted by the owner: "${claim.claim.slice(0, 200)}"`,
      volatile: false,
      slug: doc.slug,
      country: claim.country,
      ...(lead ? { lead } : {}),
      source: {
        title: doc.title,
        url: doc.url,
        revisionId: doc.revisionId ?? '',
        contentHash: doc.contentHash ?? '',
        kind: doc.kind ?? 'wikipedia',
        tier: doc.tier,
        fetchedAt: doc.fetchedAt,
        siteName: doc.siteName ?? '',
        doi: doc.doi ?? '',
        publishedAt: doc.publishedAt ?? '',
        wayback: doc.wayback ?? '',
      },
    },
  };
}

/**
 * Wikipedia articles worth trying for a claim: the model's guesses at
 * titles first, then a search on the claim itself.
 *
 * @param {Claim} claim
 */
async function wikipediaFor(claim) {
  const seen = new Set();
  const out = [];
  const add = (rows) => {
    for (const r of rows) {
      if (r.disambiguation || seen.has(r.url)) continue;
      seen.add(r.url);
      out.push(r);
    }
  };
  for (const title of claim.look) {
    add((await searchArticles(title, 2).catch(() => [])).slice(0, 1));
  }
  if (out.length < DOCS_PER_CLAIM) add(await searchArticles(claim.claim, 3).catch(() => []));
  return out.slice(0, DOCS_PER_CLAIM);
}

/**
 * @param {Claim} claim
 * @param {object} run
 * @param {{ signal?: AbortSignal, say: (line: string) => void }} ctx
 */
async function checkClaim(claim, run, ctx) {
  const state = { country: claim.country, runId: run.runId, brief: claim.claim };
  const misses = [];
  /** @type {{ status: string, candidate: any, note: string, title: string } | null} */
  let corrected = null;

  const tryDocs = async (rows) => {
    for (const row of rows) {
      if (ctx.signal?.aborted) return null;
      const opened = await openDocument(row, state);
      if (!opened.ok) {
        misses.push(`"${row.title}" could not be opened.`);
        continue;
      }
      run.docsRead += 1;
      const r = await confirmIn(claim, opened.doc, ctx);
      if (r.status === 'supported') return { ...r, title: opened.doc.title };
      if (r.status === 'different') corrected ??= { ...r, title: opened.doc.title };
      else misses.push(r.why);
    }
    return null;
  };

  const found = await tryDocs(await wikipediaFor(claim));
  if (found) return found;

  // The web, only for what Wikipedia could not confirm, and only while
  // the paste's budget lasts. Checked before searching, not after.
  if (!corrected && run.webQueriesSpent + WEB_QUERIES_PER_SEARCH <= PASTE_WEB_QUERIES) {
    const result = await searchSources(claim.claim, { web: true, country: countryName(claim.country) });
    run.webQueriesSpent += result.spent;
    const web = result.results.filter((r) => r.kind === 'web' && r.trust?.usable !== false).slice(0, 2);
    const onWeb = await tryDocs(web);
    if (onWeb) return onWeb;
  }

  if (corrected) return corrected;
  return { status: 'unconfirmed', why: misses.length > 0 ? misses.slice(-2).join(' ') : 'No source found.' };
}

/**
 * @param {string} text
 * @param {{ country?: string, signal?: AbortSignal }} [options]
 * @param {(line: string) => void} [onProgress]
 */
export async function checkPasted(text, options = {}, onProgress = () => {}) {
  const say = onProgress;
  const fallback = AGENT_COUNTRIES.includes(options.country) ? options.country : 'NG';
  const pasted = String(text ?? '').slice(0, MAX_PASTE_CHARS).trim();
  if (pasted.length < 20) throw new Error('Paste some facts first.');

  const run = {
    runId: `agent-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`,
    kind: 'paste',
    status: 'awaiting',
    brief: '',
    country: fallback,
    target: 0,
    createdAt: new Date().toISOString(),
    stopReason: '',
    docsRead: 0,
    webQueriesSpent: 0,
    shortlist: [],
    alternates: [],
    unverified: [],
    trace: [],
  };

  say('Reading what you pasted...');
  let claims = await splitClaims(pasted, fallback, options.signal);
  const found = claims.length;
  if (claims.length > MAX_CLAIMS) {
    say(`Found ${found} facts; checking the first ${MAX_CLAIMS}. Paste the rest in another run.`);
    claims = claims.slice(0, MAX_CLAIMS);
  } else {
    say(`Found ${found} fact${found === 1 ? '' : 's'} in what you pasted.`);
  }
  run.target = claims.length;
  run.brief = `${claims.length} pasted fact${claims.length === 1 ? '' : 's'}`;

  // Already in the app, on the claim's own words. Cheap, and it saves a
  // search and a read for every repost of something you already have.
  const corpus = await storedFacts();
  const asCandidate = (c) => ({ fact: c.claim, passage: c.claim, slug: `paste-${c.n}`, category: 'History' });
  // A high bar: this is on the pasted words, before any source, so it
  // should only catch a near-copy. A NEW fact about a subject the app
  // already has is still checked.
  const early = dedupeAgainstCorpus(claims.map(asCandidate), corpus, { similarity: 0.6 });
  const inApp = new Map(early.culled.map((x) => [x.candidate.slug, x.reason]));

  const say1 = (c, line) => say(`[${c.n}/${claims.length}] ${line}`);
  const results = await mapLimit(claims, 2, async (c) => {
    if (options.signal?.aborted) return { c, status: 'stopped', why: 'Stopped before this one was checked.' };
    const dup = inApp.get(`paste-${c.n}`);
    if (dup) {
      say1(c, `in the app: ${c.claim.slice(0, 90)}`);
      return { c, status: 'in the app', why: dup };
    }
    try {
      const r = await checkClaim(c, run, { signal: options.signal, say });
      if (r.status === 'supported') say1(c, `verified: ${r.candidate.fact.slice(0, 100)}`);
      else if (r.status === 'different') say1(c, `corrected: ${r.candidate.fact.slice(0, 100)}`);
      else say1(c, `not confirmed: ${c.claim.slice(0, 80)} (${r.why.slice(0, 100)})`);
      return { c, ...r };
    } catch (error) {
      if (options.signal?.aborted) return { c, status: 'stopped', why: 'Stopped while this one was being checked.' };
      const why = error instanceof Error ? error.message : String(error);
      say1(c, `not confirmed: ${c.claim.slice(0, 80)} (${why.slice(0, 100)})`);
      return { c, status: 'unconfirmed', why };
    }
  });

  // Verified facts against the app again, now with their real passages
  // (the same sentence already quoted by a live fact is the same fact),
  // and against each other (two reposts of one story).
  const confirmed = results.filter((r) => r.status === 'supported' || r.status === 'different');
  const againstApp = dedupeAgainstCorpus(confirmed.map((r) => r.candidate), corpus);
  for (const x of againstApp.culled) {
    const r = confirmed.find((y) => y.candidate === x.candidate);
    if (r) {
      r.status = 'in the app';
      r.why = x.reason;
    }
  }
  // Not `dedupe()`: it also culls facts it finds boring in shape, and
  // these were chosen by you. Only the same passage twice is a repeat.
  //
  // A kept fact that resembles a live one but adds something comes back
  // as a COPY carrying `echoes`, so it is matched back to its claim by
  // content, not identity, and the resemblance is shown to you.
  const keptSet = new Set();
  const byPassage = new Map();
  for (const k of againstApp.kept) {
    const r = confirmed.find((y) => y.candidate.fact === k.fact && y.candidate.passage === k.passage);
    if (!r) continue;
    const key = `${k.slug}|${k.passage.toLowerCase().replace(/\s+/g, ' ')}`;
    const first = byPassage.get(key);
    if (first) {
      r.status = 'repeat';
      r.why = `Same source sentence as "${first.fact.slice(0, 80)}", pasted earlier.`;
      continue;
    }
    if (k.echoes) r.echoes = `Close to ${k.echoes.id} in the app; adds ${k.echoes.adds.slice(0, 6).join(', ')}.`;
    byPassage.set(key, k);
    keptSet.add(r.candidate);
  }

  // The judge's view, shown beside each fact. It does not filter: you
  // chose these, and the votes are there to help you decide, not to
  // decide for you.
  const toJudge = confirmed.filter((r) => keptSet.has(r.candidate));
  if (toJudge.length > 0) say(`Asking the reader panel about ${toJudge.length} verified fact(s)...`);
  await mapLimit(toJudge, 3, async (r) => {
    try {
      const v = await judgeOne(r.candidate, options.signal);
      const voter = v.readings.find((x) => x.vote) ?? v.readings[0];
      r.votes = `${v.votes}/${v.of}`;
      r.readerWhy = voter?.why ?? '';
    } catch {
      r.votes = '';
    }
  });

  let s = 0;
  let a = 0;
  for (const r of results) {
    const base = {
      fact: r.candidate?.fact ?? '',
      category: r.candidate?.category ?? '',
      votes: r.votes ?? '',
      why: r.readerWhy ?? '',
      title: r.candidate?.source?.title ?? r.title ?? '',
      url: r.candidate?.source?.url ?? '',
      claim: r.c.claim,
      ...(r.echoes ? { echoes: r.echoes } : {}),
      candidate: r.candidate,
    };
    if (r.status === 'supported' && keptSet.has(r.candidate)) {
      run.shortlist.push({ key: `s${++s}`, ...base });
    } else if (r.status === 'different' && keptSet.has(r.candidate)) {
      run.alternates.push({ key: `a${++a}`, ...base, aside: `Corrected. You pasted: "${r.c.claim.replace(/[.!?]+$/, "")}". ${r.note}`.trim() });
    } else {
      run.unverified.push({ n: r.c.n, claim: r.c.claim, status: r.status, why: r.why ?? '' });
    }
  }

  run.status = run.shortlist.length + run.alternates.length > 0 ? 'awaiting' : 'empty';
  run.stopReason = options.signal?.aborted
    ? 'Stopped by you.'
    : `${claims.length} checked: ${run.shortlist.length} verified, ${run.alternates.length} corrected, ${run.unverified.length} not usable.`;
  await saveRun(run);
  say(run.stopReason);
  if (run.status === 'awaiting') say('Waiting for you on /agent.');
  return { runId: run.runId, status: run.status };
}
