/**
 * Further reading: where a curious reader goes after the deep dive.
 *
 * The source link answers "is this true". This answers "tell me more":
 * up to three articles about the people, events and places the fact
 * touches, stored as `deepDive.furtherReading` so the push carries them
 * inside the `deep_dive` column with no schema change.
 *
 * What the model does and does not do. Wikipedia's own search finds the
 * candidates, and the model only PICKS from that list, by id; an id it
 * invents is ignored. The one-line description under each link is the
 * article's own first sentence, not model prose, so nothing shipped here
 * was written by a model. Same division as everywhere else in the
 * studio: the model is used for relevance, never for content a reader
 * takes as true.
 *
 * Wikipedia only, on purpose: it is free to search, every link is a live
 * article, and a reader tapping through lands somewhere stable. A web
 * version would spend the same scarce searches the sources and images do.
 */

import { MODELS, completeJson, loadPrompt } from '../llm/index.js';
import { loadReviewedCorpus } from '../check.js';
import { isPublishable } from '../validate.js';
import { editFact, loadFactStore } from '../studio/facts.js';
import { mapLimit } from '../judge/index.js';
import { searchArticles } from './source-search.js';

/** At most this many links under a deep dive. */
export const MAX_LINKS = 3;

/** Below this an article is a stub; a reader tapping through gets a paragraph. */
const MIN_WORDS = 400;

/**
 * @typedef {object} FurtherReading
 * @property {string} title
 * @property {string} url
 * @property {string} site
 * @property {string} summary The article's own first sentence.
 */

/** Words ending in a full stop that do not end a sentence. */
const ABBREVIATION = /\b(c|ca|b|d|fl|st|dr|mr|mrs|ms|jr|sr|no|vs|gen|col|capt|prof|rev|lt|sgt)$/i;

/**
 * The article's opening sentence, tidied for a phone screen.
 *
 * Plain-text extracts keep the husk of what was stripped: "Kano (;
 * Ajami: ...)" where a pronunciation was, "()" where audio was. Those
 * husks go; birth dates in parentheses stay, being part of the sentence.
 * The split skips abbreviations, since the first test cut "Sanusi
 * Dantata (c. 1919 ..." at the "c.".
 *
 * @param {string} text
 */
function firstSentence(text) {
  const t = String(text ?? '')
    .replace(/\(\s*[;,][^)]*\)/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const end = /[.!?](?=\s+[A-Z(]|$)/g;
  let m;
  while ((m = end.exec(t)) !== null) {
    if (!ABBREVIATION.test(t.slice(0, m.index))) return t.slice(0, m.index + 1).slice(0, 240);
  }
  return t.slice(0, 240);
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One Wikipedia search, paced and retried on a 429.
 *
 * Wikipedia is free but not unlimited; it answers a burst with 429s.
 * A pause before every search keeps a full run under the limit, and a
 * 429 that still happens waits 5, 15 then 45 seconds before giving up.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {AbortSignal} [signal]
 * @returns {Promise<T>}
 */
async function politely(fn, signal) {
  for (let attempt = 0; ; attempt += 1) {
    await sleep(700);
    try {
      return await fn();
    } catch (error) {
      const limited = error instanceof Error && error.message.includes('429');
      if (!limited || attempt >= 3 || signal?.aborted) throw error;
      await sleep(5000 * 3 ** attempt);
    }
  }
}

const bare = (u) => String(u ?? '').replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();

/**
 * Links for one fact, or an empty list.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @param {{ signal?: AbortSignal, onProgress?: (line: string) => void }} [options]
 * @returns {Promise<FurtherReading[]>}
 */
export async function readingFor(entry, options = {}) {
  const own = new Set(
    (entry.provenance?.sources ?? []).map((s) => bare(s.locator?.url)).concat(bare(entry.fact.source?.url)),
  );
  const sourceTitle = entry.provenance?.sources?.[0]?.shortName ?? entry.fact.source?.name ?? '';

  // Two searches, both free: the article the fact came from (its
  // neighbours) and the fact itself (the specific names in it). In turn,
  // not at once, and a failure is thrown rather than read as "nothing
  // found": the first full run was rate-limited and saved an empty list
  // for 106 facts that had simply not been searched.
  const bySource = await politely(() => searchArticles(sourceTitle, 10), options.signal);
  const byFact = await politely(() => searchArticles(entry.fact.fact.slice(0, 200), 10), options.signal);

  const seen = new Set();
  const candidates = [];
  for (const row of [...byFact, ...bySource]) {
    const key = bare(row.url);
    if (seen.has(key) || own.has(key)) continue;
    seen.add(key);
    if (row.disambiguation || row.words < MIN_WORDS) continue;
    if (row.title.toLowerCase() === sourceTitle.toLowerCase()) continue;
    candidates.push({ ...row, id: `c${candidates.length + 1}` });
  }
  if (candidates.length === 0) return [];

  const prompt = await loadPrompt('further-reading', {
    fact: entry.fact.fact,
    body: entry.fact.deepDive.body.join('\n\n'),
    candidates: candidates.map((c) => `${c.id} | ${c.title} | ${c.summary.slice(0, 160)}`).join('\n'),
  });
  const raw = await completeJson(
    { model: MODELS.findSources, prompt, temperature: 0, signal: options.signal },
    options.onProgress,
  );

  const picks = Array.isArray(raw?.picks) ? raw.picks : [];
  const chosen = [];
  for (const id of picks) {
    const c = candidates.find((x) => x.id === id);
    if (!c || chosen.some((x) => x.url === c.url)) continue;
    chosen.push({ title: c.title, url: c.url, site: 'Wikipedia', summary: firstSentence(c.summary) });
    if (chosen.length >= MAX_LINKS) break;
  }
  return chosen;
}

/**
 * Further reading for live facts that have none.
 *
 * @param {{ ids?: string[], force?: boolean, signal?: AbortSignal }} [options]
 *   `ids` limits the run; `force` redoes facts that already have links.
 * @param {(line: string) => void} [onProgress]
 */
export async function runFurtherReading(options = {}, onProgress = () => {}) {
  const say = onProgress;
  const ids = Array.isArray(options.ids) && options.ids.length > 0 ? new Set(options.ids) : null;
  // Store facts only. Hand-authored facts live in corpus/*.js with their
  // reasoning in the comments, and no script rewrites those files.
  const store = await loadFactStore();
  const live = (await loadReviewedCorpus()).filter((e) => isPublishable(e) && (!ids || ids.has(e.fact.id)));
  const handAuthored = live.filter((e) => !store[e.fact.id]).length;
  const corpus = live.filter(
    (e) => store[e.fact.id] && (options.force || !Array.isArray(e.fact.deepDive?.furtherReading)),
  );

  say(`Finding further reading for ${corpus.length} fact(s). Wikipedia search is free; one model call each.`);
  if (handAuthored > 0) say(`${handAuthored} hand-authored fact(s) skipped: corpus/*.js is not rewritten by a script.`);
  let linked = 0;
  let empty = 0;
  let failed = 0;

  // One fact at a time (Wikipedia rate-limits bursts), and writes queued
  // behind each other regardless. editFact
  // reads the whole store, changes one record and writes it all back, so
  // two concurrent edits would each save a store missing the other's.
  let writes = Promise.resolve();
  const serially = (fn) => {
    const next = writes.then(fn);
    writes = next.catch(() => {});
    return next;
  };

  await mapLimit(corpus, 1, async (entry) => {
    if (options.signal?.aborted) return;
    try {
      const links = await readingFor(entry, { signal: options.signal, onProgress: say });
      // editFact refuses a no-op edit, which a forced rerun often is.
      if (JSON.stringify(links) === JSON.stringify(entry.fact.deepDive?.furtherReading)) {
        if (links.length > 0) linked += 1;
        else empty += 1;
        return;
      }
      // Written even when empty: [] records "looked, found nothing", so the
      // next run does not pay to look again. `force` redoes it.
      const result = await serially(() =>
        editFact(
          entry.fact.id,
          { fact: { ...entry.fact, deepDive: { ...entry.fact.deepDive, furtherReading: links } } },
          { by: 'pipeline', reason: 'Further reading added.' },
        ),
      );
      if (!result.ok) throw new Error(result.error);
      if (links.length > 0) linked += 1;
      else empty += 1;
      say(`${links.length > 0 ? '+' : '.'} ${entry.fact.id}  ${links.map((l) => l.title).join(' | ') || 'nothing that fits'}`);
    } catch (error) {
      if (options.signal?.aborted) return;
      failed += 1;
      say(`x ${entry.fact.id}  ${error instanceof Error ? error.message : error}`);
    }
  });

  say(`${linked} fact(s) got further reading, ${empty} had nothing that fit, ${failed} failed.`);
  return { linked, empty, failed };
}
