/**
 * What the agent can do, and nothing else.
 *
 * Every tool here is an existing stage with a narrower mouth. Search is
 * `searchSources`, reading is fetch + extract + verify + dedupe, and
 * judging is `lib/judge`. None of the standards moved: a fact the agent
 * finds still needs a verbatim passage that string-matches the cached
 * document, and a source still gets its tier from `source-trust.js`. What
 * the agent adds is the choosing: which query, which document, when a
 * document is dead and it is time to move on.
 *
 * Tools return OBSERVATIONS: short plain text written for the model to
 * read, plus structured data for the loop to keep. The model never sees
 * a whole document, only what came out of it and why.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { assess, mapLimit, rank } from '../judge/index.js';
import { DATA_DIR } from '../paths.js';
import { dedupe, dedupeAgainstCorpus } from '../pipeline/dedupe.js';
import { extractFrom } from '../pipeline/extract.js';
import { cachePath, fetchDoc, loadCached } from '../pipeline/fetch.js';
import { searchSources } from '../pipeline/source-search.js';
import { loadSources } from '../pipeline/sources.js';
import { addSource } from '../studio/actions.js';
import { storedFacts } from '../studio/facts.js';
import { loadLedger, recordExtract } from '../studio/ledger.js';
import { MODELS } from '../llm/index.js';
import { loadReviewedCorpus } from '../check.js';
import { isPublishable } from '../validate.js';

/**
 * One web search sends 2 to 4 queries to SerpApi (see source-search.js),
 * so the budget is checked against the worst case BEFORE searching. A
 * cap that is checked afterwards is a cap that has already been passed.
 */
export const WEB_QUERIES_PER_SEARCH = 4;

/**
 * @typedef {object} Found A search result the agent may read, by id.
 * @property {string} id  r1, r2, ... stable for the whole run.
 * @property {string} title
 * @property {string} url
 * @property {'wikipedia' | 'web'} kind
 * @property {string} host
 * @property {string} tier
 * @property {boolean} usable
 * @property {number} words
 * @property {string} summary
 */

/**
 * Search for documents. Wikipedia always; the web only when asked AND
 * the run can afford it.
 *
 * @param {import('./index.js').RunState} state
 * @param {string} query
 * @param {boolean} wantWeb
 */
export async function searchTool(state, query, wantWeb) {
  const affordable = state.webSpent + WEB_QUERIES_PER_SEARCH <= state.budget.webQueries;
  const web = wantWeb && affordable;
  const result = await searchSources(query, { web, country: state.countryName });
  state.webSpent += result.spent;

  const fresh = [];
  for (const row of result.results) {
    if (row.disambiguation) continue;
    const known = state.found.find((f) => f.url === row.url);
    if (known) {
      fresh.push(known);
      continue;
    }
    /** @type {Found} */
    const found = {
      id: `r${state.found.length + 1}`,
      title: row.title,
      url: row.url,
      kind: row.kind,
      host: row.host,
      tier: row.trust?.tier ?? 'reference',
      usable: row.trust?.usable !== false,
      words: row.words ?? 0,
      summary: String(row.summary ?? '').slice(0, 180),
    };
    state.found.push(found);
    fresh.push(found);
  }

  const mined = await minedTitles();
  const lines = fresh.slice(0, 12).map((f) => {
    const tags = [f.kind === 'web' ? `${f.host}, ${f.tier}` : 'wikipedia'];
    if (f.words) tags.push(`${f.words} words`);
    if (!f.usable) tags.push('NOT USABLE');
    if (state.read.has(f.id)) tags.push('already read this run');
    else if (mined.has(f.title.toLowerCase())) tags.push('mined before; its best facts are in the app');
    return `${f.id}  ${f.title}  (${tags.join(', ')})\n     ${f.summary}`;
  });

  const note = wantWeb && !affordable
    ? `\n(Web search skipped: the run's web budget is spent. Wikipedia only.)`
    : '';
  return {
    text: lines.length > 0
      ? `Search "${query}"${web ? ' (Wikipedia + web)' : ' (Wikipedia)'}:\n${lines.join('\n')}${note}`
      : `Search "${query}" found nothing usable.${note}`,
  };
}

/** @returns {Promise<Set<string>>} Lowercased titles of documents already extracted. */
async function minedTitles() {
  const [sources, ledger] = await Promise.all([loadSources(), loadLedger()]);
  return new Set(
    sources.filter((s) => ledger.extract[s.slug]).map((s) => s.title.toLowerCase()),
  );
}

/**
 * The seed-list entry for a search result, adding one if needed.
 *
 * Goes through `addSource`, the same door a person uses on /sources, so
 * the slug rules, the cache adoption and the trust check all apply. The
 * group marks it as the agent's choice, which is how /sources and a
 * later reader can tell a document the agent picked from one you did.
 *
 * @param {Found} found
 * @param {import('./index.js').RunState} state
 */
export async function sourceFor(found, state) {
  const bare = (v) => String(v ?? '').replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();
  const sources = await loadSources();
  const existing = sources.find((s) =>
    found.kind === 'web'
      ? s.kind === 'web' && bare(s.url) === bare(found.url)
      : s.kind !== 'web' && s.title.toLowerCase() === found.title.toLowerCase(),
  );
  if (existing) return { ok: true, source: existing };

  const added = await addSource({
    input: found.kind === 'web' ? found.url : found.title,
    country: state.country,
    group: `Chosen by the agent (${state.runId})`,
    wanted: state.brief,
  });
  return added.ok ? { ok: true, source: added.source } : { ok: false, error: added.error };
}

/**
 * Put one candidate before the judge, twice if it is borderline.
 *
 * The extract eval found the panel unstable near the line: the same
 * sentence scored 1/3 on one run and 3/3 on the next. Unanimous and
 * near-empty verdicts were stable, so only a 2/3 is asked again, and it
 * passes on 4 votes of 6.
 *
 * @param {import('../pipeline/extract.js').Candidate} c
 * @param {AbortSignal} [signal]
 */
export async function judgeOne(c, signal) {
  const fact = { text: c.fact, country: c.country };
  const first = await assess(fact, { signal });
  if (first.votes !== 2) {
    return { pass: first.votes === 3, votes: first.votes, of: 3, readings: first.readings };
  }
  const second = await assess(fact, { signal });
  const votes = first.votes + second.votes;
  return { pass: votes >= 4, votes, of: 6, readings: [...first.readings, ...second.readings] };
}

/**
 * The cached document for a search result, fetching it on first use.
 *
 * Seed-list writes are serialised: `addSource` rewrites sources.json
 * whole, and paste mode opens documents for several claims at once. Two
 * overlapping writes would each keep only their own new entry.
 *
 * @param {Found | { title: string, url: string, kind: string }} found
 * @param {{ country: string, runId: string, brief: string }} state
 * @returns {Promise<{ ok: true, doc: any, source: any } | { ok: false, error: string }>}
 */
export async function openDocument(found, state) {
  const entry = await (sourceLock = sourceLock.then(() => sourceFor(found, state), () => sourceFor(found, state)));
  if (!entry.ok) return { ok: false, error: entry.error };
  let doc = await loadCached(entry.source.slug);
  if (!doc) {
    try {
      doc = await fetchDoc(entry.source);
      await writeFile(cachePath(entry.source.slug), JSON.stringify(doc, null, 2), 'utf8');
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  return { ok: true, doc, source: entry.source };
}

/** @type {Promise<unknown>} */
let sourceLock = Promise.resolve();

/*
  DIVERSITY, enforced here rather than asked for.

  The first run returned six facts about one family: five from the
  Alhassan Dantata article, one from Aliko Dangote, his great-grandson.
  Nothing was wrong with any of them; a feed of them in a row would still
  read as one story told six times. The owner's rule is that variety
  matters as much as strength, so it is a rule the code keeps, in three
  parts:

    1. ONE FACT PER DOCUMENT. Several strong facts from one article are
       ranked head to head and only the best is kept.
    2. ONE FACT PER SUBJECT. A subject is the names in a document's
       title. Once one has given a fact, a document whose title shares a
       name is not read, and a new fact mentioning the name is set
       aside. Dangote then Dantata is exactly the path this closes: the
       Dangote fact names Dantata.
    3. A CAP PER CATEGORY, so five facts cannot all be History.

  What loses on diversity is not thrown away. It passed the judge and it
  was paid for, so it goes to `data/agent-reserve.json` for a later run.
*/

/** Strong facts kept from any one document. */
export const PER_DOCUMENT = 1;
/** Strong facts per category in one run. */
export const PER_CATEGORY = 2;

export const RESERVE_PATH = join(DATA_DIR, 'agent-reserve.json');

/** Title words that name a place or a kind of thing, not a subject. */
const GENERIC = new Set([
  'nigeria', 'nigerian', 'nigerians', 'africa', 'african', 'west', 'east', 'north', 'south',
  'kingdom', 'empire', 'state', 'city', 'history', 'civil', 'war', 'university', 'people',
  'federal', 'republic', 'national', 'lagos', 'abuja', 'kano', 'list', 'company', 'group',
  'world', 'records', 'record', 'guinness', 'tallest', 'buildings', 'cuisine', 'science',
  'technology', 'football', 'team', 'corporation', 'culture', 'confederacy', 'affair',
  'the', 'and', 'of', 'in',
]);

/**
 * @param {string} title
 * @param {Set<string>} [stop]
 */
function subjectNames(title, stop = GENERIC) {
  return String(title)
    .replace(/\(.*?\)/g, ' ')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !stop.has(w));
}

/** @param {string} text */
function words(text) {
  return new Set(
    String(text).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/),
  );
}

/**
 * Is this document's subject already in the run?
 *
 * @param {import('./index.js').RunState} state
 * @param {string} title
 * @returns {string} The fact or title it clashes with, or empty.
 */
function subjectClash(state, title) {
  const names = subjectNames(title);
  if (names.length === 0) return '';
  for (const s of state.strong) {
    const said = words(`${s.candidate.fact} ${s.title}`);
    if (names.some((n) => said.has(n))) return s.candidate.fact;
  }
  return '';
}

/*
  ONE FACT PER SUBJECT, ACROSS THE APP, not just the run.

  A run's own check could not see that Patrick Sawyer was already in the
  app inside the Adadevoh fact, so the Sawyer article was read, paid for
  and shortlisted. The same test now runs against every live fact, but
  it has to be stricter about what counts as a match: the app has well
  over a hundred facts, and any shared word ("patrick") would block half
  of Nigeria. So a subject matches only on ALL of its names:

    - a live fact's subject (its source's title, "Stella Obasanjo") is
      inside a new document's title, or named near the start of a new
      fact; or
    - a new document's whole title ("Patrick Sawyer") is inside a live
      fact.

  A set-aside fact still goes to the reserve and is offered as an
  alternate, so a false alarm here costs a swap, not the fact.
*/

/**
 * @typedef {object} AppSubject
 * @property {string} id
 * @property {string} fact
 * @property {Set<string>} said Every word of the fact and its source titles.
 * @property {string[][]} subjects Names of each source title.
 */

/**
 * Words dropped from a live fact's subject. Much shorter than GENERIC,
 * because a live subject has to match in FULL: dropping "republic" from
 * "Chicken Republic" would leave any fact that mentions chicken a repeat.
 */
const LIVE_STOP = new Set([
  'nigeria', 'nigerian', 'nigerians', 'africa', 'african', 'list', 'guinness', 'world',
  'records', 'record', 'lagos', 'the', 'and',
]);

/** @returns {Promise<AppSubject[]>} */
export async function appSubjects() {
  const live = (await loadReviewedCorpus()).filter(isPublishable);
  return live.map((e) => {
    const titles = [...new Set((e.provenance?.sources ?? []).map((s) => s.shortName).filter(Boolean))];
    return {
      id: e.fact.id,
      fact: e.fact.fact,
      said: words(`${e.fact.fact} ${titles.join(' ')}`),
      subjects: titles.map((t) => subjectNames(t, LIVE_STOP)).filter((n) => n.length > 0),
    };
  });
}

/**
 * The live fact this title or fact repeats, if any.
 *
 * @param {AppSubject[]} app
 * @param {{ title?: string, fact?: string }} what
 * @returns {AppSubject | undefined}
 */
export function inApp(app, { title = '', fact = '' }) {
  const titleNames = subjectNames(title);
  const inTitle = words(title);
  // In a fact, a live subject counts only if it is named in the first
  // half, where the fact's own subject sits. Measured: "Bennet Omalu ...
  // was born during the Nigerian Civil War" is about Omalu, and the war
  // at its end is the background, not a repeat of the war's live fact.
  const said = [...words(fact)];
  const all = new Set(said);
  const head = new Set(said.slice(0, Math.ceil(said.length / 2)));
  const named = (names) =>
    names.every((n) => inTitle.has(n)) ||
    (names.every((n) => all.has(n)) && names.some((n) => head.has(n)));
  return app.find(
    (a) =>
      a.subjects.some(named) ||
      (titleNames.length >= 2 && titleNames.every((n) => a.said.has(n))),
  );
}

/** @param {object[]} rows */
async function addToReserve(rows) {
  if (rows.length === 0) return;
  let reserve = [];
  try {
    reserve = JSON.parse(await readFile(RESERVE_PATH, 'utf8'));
  } catch {
    // First entry.
  }
  await writeFile(RESERVE_PATH, `${JSON.stringify([...reserve, ...rows], null, 2)}\n`);
}

/**
 * Read a document: fetch it, extract, verify, dedupe, judge.
 *
 * @param {import('./index.js').RunState} state
 * @param {string} id
 * @param {(line: string) => void} say
 */
export async function readTool(state, id, say) {
  const found = state.found.find((f) => f.id === id);
  if (!found) return { text: `There is no result '${id}'. Use an id from a search.` };
  if (!found.usable) return { text: `${id} (${found.host}) cannot be a source. Pick another.` };
  if (state.read.has(id)) return { text: `${id} was already read this run.` };
  const clash = subjectClash(state, found.title);
  if (clash) {
    return {
      text: `Not read: "${found.title}" is the same subject as a fact this run already has ("${clash.slice(0, 100)}"). One fact per subject. Choose something unrelated.`,
    };
  }
  state.app ??= await appSubjects();
  const live = inApp(state.app, { title: found.title });
  if (live) {
    return {
      text: `Not read: "${found.title}" is a subject the app already covers (${live.id}: "${live.fact.slice(0, 100)}"). Choose a subject that is not in the app.`,
    };
  }
  state.read.add(id);
  state.docsRead += 1;

  const entry = await sourceFor(found, state);
  if (!entry.ok) return { text: `${id} could not be added as a source: ${entry.error}` };
  const source = entry.source;

  let doc = await loadCached(source.slug);
  if (!doc) {
    try {
      doc = await fetchDoc(source);
      await writeFile(cachePath(source.slug), JSON.stringify(doc, null, 2), 'utf8');
    } catch (error) {
      return { text: `${id} "${found.title}" could not be fetched: ${error instanceof Error ? error.message : error}` };
    }
  }

  say(`reading ${source.slug} (${doc.text.length} chars)`);
  const { kept, rejected } = await extractFrom(doc, say, state.signal, state.brief);

  // Against the app, then against what this run already accepted.
  const withinDoc = dedupe(kept);
  const againstCorpus = dedupeAgainstCorpus(withinDoc.kept, await storedFacts());
  const acceptedFacts = state.strong.map((s) => s.candidate.fact);
  const againstRun = dedupe([...state.strong.map((s) => s.candidate), ...againstCorpus.kept]);
  const fresh = againstRun.kept.filter((c) => !acceptedFacts.includes(c.fact));
  const duplicates = kept.length - fresh.length;

  const verdicts = await mapLimit(fresh, 3, async (c) => ({ candidate: c, ...(await judgeOne(c, state.signal)) }));

  await recordExtract(source.slug, {
    revisionId: doc.revisionId,
    model: MODELS.extract,
    candidates: kept.length,
    rejected: rejected.length,
  });

  const strong = verdicts.filter((v) => v.pass);
  const weak = verdicts.filter((v) => !v.pass);

  // Diversity. Set aside what names a subject the run already has, and
  // what would overfill a category; rank the rest and keep the best.
  const coveredNames = new Set(state.strong.flatMap((s) => subjectNames(s.title)));
  const perCategory = (cat) => state.strong.filter((s) => s.candidate.category === cat).length;
  /** @type {{ v: any, why: string }[]} */
  const setAside = [];
  const eligible = [];
  for (const v of strong) {
    const said = words(v.candidate.fact);
    const named = [...coveredNames].find((n) => said.has(n));
    const live = inApp(state.app, { fact: v.candidate.fact });
    if (named) setAside.push({ v, why: `same subject as an earlier fact ('${named}')` });
    else if (live) setAside.push({ v, why: `same subject as ${live.id}, already in the app` });
    else if (perCategory(v.candidate.category) >= PER_CATEGORY) setAside.push({ v, why: `${v.candidate.category} is full this run` });
    else eligible.push(v);
  }
  let chosen = eligible;
  if (eligible.length > PER_DOCUMENT) {
    const ranked = await rank(
      eligible.map((v) => ({ text: v.candidate.fact, country: v.candidate.country, v })),
      { signal: state.signal },
    );
    chosen = ranked.slice(0, PER_DOCUMENT).map((r) => r.fact.v);
    for (const r of ranked.slice(PER_DOCUMENT)) setAside.push({ v: r.fact.v, why: 'one fact per document; ranked lower' });
  }
  for (const v of chosen) state.strong.push({ ...v, docId: id, slug: source.slug, title: doc.title, url: doc.url });
  // Offered beside the shortlist as swaps, so dropping a fact never needs
  // a second round of questions.
  for (const { v, why } of setAside) {
    state.alternates.push({ ...v, docId: id, slug: source.slug, title: doc.title, url: doc.url, aside: why });
  }

  await addToReserve(
    setAside.map(({ v, why }) => ({
      fact: v.candidate.fact,
      category: v.candidate.category,
      votes: `${v.votes}/${v.of}`,
      why,
      runId: state.runId,
      candidate: v.candidate,
    })),
  );

  const reason = (v) => {
    const r = v.readings.find((x) => !x.vote) ?? v.readings[0];
    return r ? `${r.kind}: ${r.why}` : 'no reading';
  };

  const lines = [
    `Read ${id} "${doc.title}": ${kept.length} facts verified, ${rejected.length} failed the verifier, ${duplicates} already in the app or this run.`,
    `KEPT (${chosen.length}):`,
    ...chosen.map((v) => `  + [${v.votes}/${v.of}, ${v.candidate.category}] ${v.candidate.fact}`),
    `STRONG BUT SET ASIDE FOR VARIETY (${setAside.length}):`,
    ...setAside.map(({ v, why }) => `  ~ ${v.candidate.fact.slice(0, 110)}  (${why})`),
    `WEAK (${weak.length}):`,
    ...weak.map((v) => `  - [${v.votes}/${v.of}] ${v.candidate.fact.slice(0, 140)}\n      why: ${reason(v).slice(0, 160)}`),
    `This subject is now covered. Move to something unrelated.`,
  ];
  return { text: lines.join('\n'), strong: chosen.length, weak: weak.length, setAside: setAside.length };
}
