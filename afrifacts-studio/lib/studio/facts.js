/**
 * The fact store: where a fact stops being build output and becomes a record.
 *
 * Until now a fact was one of two things, and neither could be edited:
 *
 *   - a pipeline fact lived in `_generated/enriched.json`, which enrich
 *     OVERWRITES on every run. Editing it meant writing to a scratch file.
 *     Worse, enrich writes only the current run's results, so facts from
 *     an earlier run silently disappeared from the corpus.
 *   - a hand-authored fact lived in `corpus/*.js`, which is source code
 *     with reasoning in the comments. A clicked button must not rewrite it.
 *
 * So this file exists. `data/facts.json` is the authority for every
 * pipeline fact once it has been promoted, it sits in `data/` with the
 * other precious decisions, and no pipeline stage may overwrite a record
 * that is already in it. It is shaped like the Supabase `facts` table it
 * becomes later, so that migration is a copy rather than a rewrite.
 *
 * A StoredFact is a SourcedFact plus a `record` field. That is deliberate:
 * everything downstream — validate, check, export, the review pages —
 * reads `.fact` and `.provenance` and needs no change to accept one.
 *
 * Four rules the store enforces, each of which is a hole if it is missing:
 *
 *   1. `factNumber` is assigned once and never re-derived. It is printed
 *      on share cards already circulating on WhatsApp, so a number that
 *      moves points a shared card at a different fact.
 *   2. Editing the claim or its passage drops the fact out of `approved`
 *      and re-runs the verifier. Without this, edit-after-approve is a
 *      hole straight through the review gate.
 *   3. Delete is soft. A live fact may be bookmarked and its share card is
 *      already out in the world; `queued` keeps both intact.
 *   4. An edit is attributable, exactly like an approval.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { FACTS_PATH, ensureDirs } from '../paths.js';
import { factGroundedInPassage } from '../pipeline/verify.js';
import { effectiveReview, loadReviews, saveReview } from './reviews.js';
import { validate } from '../validate.js';

/**
 * Store-level metadata. Everything here is about the record, not the fact.
 *
 * @typedef {object} FactRecord
 * @property {string} createdAt ISO 8601. When the record entered the store.
 * @property {string} updatedAt ISO 8601. Last change of any kind.
 * @property {string} updatedBy Who made that change. '' for promotion.
 * @property {number} revision Bumped on every edit. Starts at 1.
 * @property {boolean} queued Held back. Excluded from publish, kept on disk.
 * @property {string} [candidateKey] Lineage: the triage key this fact came
 *   from, so cross-corpus dedupe can tell a fact from its own candidate.
 * @property {EditNote[]} history What changed, when, and by whom.
 */

/**
 * @typedef {object} EditNote
 * @property {string} at ISO 8601
 * @property {string} by
 * @property {string} what Human-readable summary, e.g. 'claim, passage'.
 * @property {string} [reason]
 * @property {boolean} [resetApproval] True when the edit dropped an approval.
 */

/**
 * @typedef {object} StoredFact
 * @property {import('../types/fact.js').Fact} fact
 * @property {import('../types/provenance.js').Provenance} provenance
 * @property {FactRecord} record
 */

/** @typedef {Record<string, StoredFact>} FactStore */

const now = () => new Date().toISOString();

/**
 * Fields whose change invalidates verification.
 *
 * The verifier's guarantee is that every number and most content words in
 * the claim appear in the passage — that is what catches a real quote with
 * the model's own knowledge welded onto it. Change either side of that
 * pair and the guarantee is void, so the fact goes back to draft.
 *
 * The deep dive is not in this list. It ships, and it can certainly carry
 * a hallucination, but it was never verifier-gated in the first place —
 * resetting approval on a typo fix there would add friction without adding
 * safety. Rewriting the claim is the dangerous act, and that is what this
 * covers.
 */
export const CLAIM_FIELDS = ['fact', 'passages'];

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * A stored record is only trusted if it still looks like one.
 *
 * Same argument as reviews.js: a corrupt or hand-edited file should cost
 * one record, not the whole store. The difference is that dropping a fact
 * silently is worse than dropping a review, so this warns.
 *
 * @param {unknown} value
 * @param {string} id
 * @returns {StoredFact | null}
 */
function parseEntry(value, id) {
  if (typeof value !== 'object' || value === null) return null;
  const { fact, provenance, record } = /** @type {any} */ (value);

  if (typeof fact !== 'object' || fact === null || !isNonEmptyString(fact.id)) return null;
  if (typeof provenance !== 'object' || provenance === null) return null;
  if (fact.id !== id) {
    console.warn(`  facts.json: key '${id}' holds fact '${fact.id}'. Skipping.`);
    return null;
  }

  return {
    fact,
    provenance,
    record: {
      createdAt: isNonEmptyString(record?.createdAt) ? record.createdAt : now(),
      updatedAt: isNonEmptyString(record?.updatedAt) ? record.updatedAt : now(),
      updatedBy: typeof record?.updatedBy === 'string' ? record.updatedBy : '',
      revision: Number.isInteger(record?.revision) && record.revision > 0 ? record.revision : 1,
      // Held back: not in front of readers. This parser is an allowlist
      // — a field it does not name is silently dropped on load, which is
      // what it is for and also how `queued` came to be written to disk
      // and read back as undefined until it was named here.
      queued: record?.queued === true,
      ...(isNonEmptyString(record?.candidateKey) ? { candidateKey: record.candidateKey } : {}),
      history: Array.isArray(record?.history) ? record.history : [],
    },
  };
}

/**
 * @returns {Promise<FactStore>}
 */
export async function loadFactStore() {
  let raw;
  try {
    raw = await readFile(FACTS_PATH, 'utf8');
  } catch (error) {
    // No file yet is the normal state before the first promotion.
    if (error?.code === 'ENOENT') return {};
    throw error;
  }

  const parsed = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${FACTS_PATH} is not an object keyed by fact id.`);
  }

  /** @type {FactStore} */
  const store = {};
  for (const [id, value] of Object.entries(parsed)) {
    const entry = parseEntry(value, id);
    if (entry) store[id] = entry;
  }
  return store;
}

/**
 * @param {FactStore} store
 */
export async function saveFactStore(store) {
  await ensureDirs();
  // Sorted by id so a diff of this file is readable and a promotion does
  // not reshuffle 131 records.
  const sorted = Object.fromEntries(Object.entries(store).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(FACTS_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
}

/**
 * Every stored fact as an array, in id order.
 *
 * Retired facts are included. They are excluded at the publish gate, not
 * here — the review pages need to see them to un-retire one.
 *
 * @returns {Promise<StoredFact[]>}
 */
export async function storedFacts() {
  const store = await loadFactStore();
  return Object.values(store).sort((a, b) => a.fact.id.localeCompare(b.fact.id));
}

/**
 * The next free factNumber above `base`.
 *
 * Derived from the store's high-water mark, never from a loop counter.
 * `enrichOne` used `PIPELINE_ID_BASE + index`, which meant re-running
 * enrich with a different keep list renumbered every fact — and a
 * factNumber is printed on share cards that are already out in the world.
 *
 * @param {FactStore} store
 * @param {number} base Lowest number this range may use.
 */
export function nextFactNumber(store, base) {
  let highest = base;
  for (const entry of Object.values(store)) {
    const n = entry.fact.factNumber;
    if (Number.isInteger(n) && n >= base && n > highest) highest = n;
  }
  return highest + 1;
}

/**
 * Add facts the store has not seen. Never overwrites.
 *
 * This is the whole reason the store exists: enrich rewrites its output
 * file wholesale, so anything that had been edited in place would be lost
 * on the next run. Promotion is one-way and additive — an id already in
 * the store is left exactly as it is, edits and all.
 *
 * @param {import('../types/provenance.js').SourcedFact[]} entries
 * @param {{ by?: string, keyOf?: (entry: any) => string | undefined }} [options]
 * @returns {Promise<{ added: string[], skipped: string[] }>}
 */
export async function promote(entries, options = {}) {
  const store = await loadFactStore();
  const added = [];
  const skipped = [];
  const stamp = now();

  for (const entry of entries) {
    const id = entry?.fact?.id;
    if (!isNonEmptyString(id)) continue;

    if (store[id]) {
      skipped.push(id);
      continue;
    }

    const candidateKey = options.keyOf?.(entry);
    store[id] = {
      fact: entry.fact,
      provenance: entry.provenance,
      record: {
        createdAt: stamp,
        updatedAt: stamp,
        updatedBy: options.by ?? '',
        revision: 1,
        queued: false,
        ...(isNonEmptyString(candidateKey) ? { candidateKey } : {}),
        history: [],
      },
    };
    added.push(id);
  }

  /*
    A promoted fact is approved and live.

    The pipeline used to stop here and wait: every fact arrived 'draft'
    and a person clicked Approve on each one. With the triage and image
    gates gone, that click was the last thing standing between a finished
    run and an empty app — and it was a click that only ever said yes.

    `validate()` still decides publishability, so this cannot push a fact
    with errors into the app: nf_0087 stays blocked on its missing
    passages exactly as before. What is gone is the ceremony, not the
    standard. Review is now where you edit or retire what is already out
    there.
  */
  if (added.length > 0) {
    await saveFactStore(store);
    await approveOnArrival(added, options.by ?? 'pipeline');
  }
  return { added, skipped };
}

/**
 * Stamp the review record for freshly promoted facts.
 *
 * Written to `reviews.json` rather than into the fact, because that file
 * is where a person's later decision lands too — an edit or a retire has
 * to be able to overrule this without the two disagreeing about which is
 * current.
 *
 * Imported lazily because `reviews.js` reads this module for the fact
 * store, and a static import both ways is a cycle.
 *
 * @param {string[]} ids
 * @param {string} by
 */
async function approveOnArrival(ids, by) {
  const { saveReview } = await import('./reviews.js');
  const today = new Date().toISOString().slice(0, 10);
  for (const id of ids) {
    await saveReview(id, {
      status: 'approved',
      reviewer: by,
      reviewedAt: today,
      notes: 'Approved on arrival from the pipeline.',
    });
  }
}

/**
 * Every candidate key the store has already turned into a fact.
 *
 * This is what stops enrich re-doing work. Promotion is keyed by fact id,
 * and enrichment mints a NEW id every run, so "is this id in the store"
 * can never answer "have I already enriched this candidate". The lineage
 * key can, because it is a property of the candidate rather than of the
 * fact made from it.
 *
 * Held facts are included deliberately. A held fact is one that was
 * enriched and then withdrawn; re-enriching its candidate would spend
 * money to recreate the thing that was just removed.
 *
 * @returns {Promise<Set<string>>}
 */
export async function promotedKeys() {
  const store = await loadFactStore();
  const keys = new Set();
  for (const entry of Object.values(store)) {
    const key = entry.record?.candidateKey;
    if (isNonEmptyString(key)) keys.add(key);
  }
  return keys;
}

/**
 * Attach lineage to records that were promoted before it was recorded.
 *
 * The first 131 facts were promoted by a migration that had no candidate
 * to hand, so their records carry no `candidateKey` — which would make
 * both the enrich skip and the corpus dedupe blind to exactly the facts
 * they most need to see.
 *
 * Matched on the PASSAGE, not the claim. The passage is copied verbatim
 * from candidate to stored fact and is not touched by enrichment, so an
 * exact match after whitespace normalisation is an identity, not a
 * resemblance. Matching on the claim would be a guess.
 *
 * Never overwrites a key that is already there.
 *
 * @param {{ slug: string, fact: string, passage: string }[]} candidates
 * @param {(candidate: { slug: string, fact: string }) => string} keyOf
 * @returns {Promise<{ matched: string[], unmatched: string[] }>}
 */
export async function backfillLineage(candidates, keyOf) {
  const norm = (text) => String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

  /** @type {Map<string, string>} normalised passage -> candidate key */
  const byPassage = new Map();
  for (const candidate of candidates) {
    const key = norm(candidate.passage);
    if (key.length > 0 && !byPassage.has(key)) byPassage.set(key, keyOf(candidate));
  }

  const store = await loadFactStore();
  const matched = [];
  const unmatched = [];

  for (const [id, entry] of Object.entries(store)) {
    if (isNonEmptyString(entry.record?.candidateKey)) continue;
    const passages = (entry.provenance?.sources ?? []).map((s) => norm(s?.passage));
    const hit = passages.map((p) => byPassage.get(p)).find(isNonEmptyString);
    if (hit) {
      entry.record.candidateKey = hit;
      matched.push(id);
    } else {
      unmatched.push(id);
    }
  }

  if (matched.length > 0) await saveFactStore(store);
  return { matched, unmatched };
}

/**
 * Re-run the verifier over a fact against its own stored passages.
 *
 * Note what this does NOT do: it does not re-fetch the source document.
 * The passage is the evidence, and it is already on the record. This asks
 * the narrower question the verifier was built for — does the claim
 * actually say what the passage says, or has something been welded on?
 *
 * A fact with several sources passes if ANY passage grounds it, because a
 * claim only needs one source to be quoted from.
 *
 * What it catches and what it does not, so the guarantee is not oversold:
 * a number in the claim that is absent from the passage is always caught,
 * and so is a rewrite whose subject has drifted off the quote. A short
 * clause with no figure in it can pass, because the word check tolerates
 * a third of the claim being rephrasing. It is a floor under editing, not
 * a proof of truth — the reviewer is still the one who reads it.
 *
 * @param {import('../types/provenance.js').SourcedFact} entry
 * @returns {{ ok: boolean, reason: string }}
 */
export function reverify(entry) {
  const sources = Array.isArray(entry?.provenance?.sources) ? entry.provenance.sources : [];
  const passages = sources.map((s) => s?.passage).filter(isNonEmptyString);

  if (passages.length === 0) {
    return { ok: false, reason: 'No passage to check the claim against.' };
  }

  let lastReason = '';
  for (const passage of passages) {
    // factGroundedInPassage returns `reasons` (plural). Reading `.reason`
    // here silently produced an empty explanation for every failure.
    const result = factGroundedInPassage(entry.fact.fact, passage);
    if (result.ok) return { ok: true, reason: '' };
    lastReason = (result.reasons ?? []).join(' ');
  }

  return { ok: false, reason: lastReason || 'The claim is not grounded in any stored passage.' };
}

/**
 * What an edit actually changed, named in the terms the store cares about.
 *
 * @param {StoredFact} before
 * @param {import('../types/provenance.js').SourcedFact} after
 */
function changedFields(before, after) {
  /** @type {string[]} */
  const changed = [];

  if (before.fact.fact !== after.fact.fact) changed.push('fact');

  const passagesOf = (e) => (e.provenance?.sources ?? []).map((s) => s?.passage ?? '').join(' ');
  if (passagesOf(before) !== passagesOf(after)) changed.push('passages');

  for (const key of ['country', 'category', 'relatedIds', 'image']) {
    if (JSON.stringify(before.fact[key]) !== JSON.stringify(after.fact[key])) changed.push(key);
  }
  if (JSON.stringify(before.fact.deepDive) !== JSON.stringify(after.fact.deepDive)) {
    changed.push('deepDive');
  }
  if (JSON.stringify(before.fact.source) !== JSON.stringify(after.fact.source)) {
    changed.push('source');
  }

  return changed;
}

/**
 * Edit a stored fact.
 *
 * `patch` is a partial SourcedFact: `{ fact?, provenance? }`, shallow-merged
 * over the record. `factNumber` and `id` are stripped — those are the store's
 * to assign, not an editor's to change.
 *
 * If the edit touches the claim or a passage, the fact is re-verified and
 * an existing approval is dropped. That is the rule that keeps editing
 * from being a way around the review gate.
 *
 * @param {string} factId
 * @param {{ fact?: object, provenance?: object }} patch
 * @param {{ by?: string, reason?: string }} [options]
 * @returns {Promise<
 *   { ok: true, entry: StoredFact, resetApproval: boolean, verification: { ok: boolean, reason: string } | null, changed: string[] }
 *   | { ok: false, error: string }
 * >}
 */
export async function editFact(factId, patch, options = {}) {
  const store = await loadFactStore();
  const before = store[factId];
  if (!before) {
    return { ok: false, error: `'${factId}' is not in the fact store.` };
  }

  const by = typeof options.by === 'string' ? options.by.trim() : '';
  if (by.length === 0) {
    // Same rule as an approval: a change that ships is attributable, or it
    // is not a change.
    return { ok: false, error: 'An edit needs your name.' };
  }

  const { id: _ignoredId, factNumber: _ignoredNumber, ...factPatch } = patch?.fact ?? {};

  /** @type {import('../types/provenance.js').SourcedFact} */
  const after = {
    fact: { ...before.fact, ...factPatch, id: before.fact.id, factNumber: before.fact.factNumber },
    provenance: {
      ...before.provenance,
      ...(patch?.provenance ?? {}),
      factId: before.fact.id,
    },
  };

  const changed = changedFields(before, after);
  if (changed.length === 0) {
    return { ok: false, error: 'Nothing changed.' };
  }

  const touchedClaim = changed.some((field) => CLAIM_FIELDS.includes(field));
  const verification = touchedClaim ? reverify(after) : null;

  /*
    Whether a fact is approved is NOT answered by the record in this store.

    A promoted record carries the review the pipeline gave it, which is
    always 'draft'; the real decision lives in data/reviews.json and is
    layered on top by `effectiveReview`. Reading the record alone would
    report every fact as unapproved, so an edit to a live, approved fact
    would clear nothing and the fact would stay published with a claim
    nobody re-read. The gate has to consult, and clear, the same file the
    reviewer's click wrote to.
  */
  const reviews = await loadReviews();
  const current = effectiveReview(factId, before.provenance.review, reviews);
  const wasApproved = current?.status === 'approved';

  /*
    Editing a live fact is correcting it, not un-reviewing it.

    This used to clear the approval on any edit to the claim, which meant
    fixing one word pulled the fact out of the app until somebody pressed
    Approve again. That is the wrong reading of the rule: the edit was
    made by a named person who read the claim they typed, and their name
    goes on the approval here. Nothing goes live unreviewed still holds —
    the reviewer is the editor.

    What still clears it is the case the rule is actually for: the edited
    claim no longer stands up. If the passage does not ground it, or the
    fact now has a blocking error, it cannot be publishable and its
    approval goes with it.
  */
  const stillSound =
    !touchedClaim ||
    (verification?.ok === true && validate(after).every((p) => p.level !== 'error'));

  const resetApproval = touchedClaim && wasApproved && !stillSound;

  /** @type {import('../types/provenance.js').Review | null} */
  const cleared = resetApproval
    ? {
        status: 'draft',
        reviewer: '',
        reviewedAt: '',
        notes: `Approval cleared on ${today()}: the edited ${changed.filter((f) => CLAIM_FIELDS.includes(f)).join(' and ')} no longer stands up. ${verification?.ok === false ? verification.reason : 'It has a blocking error.'}`,
      }
    : null;

  // An approval names who last read the claim, so an edit that keeps a
  // fact live moves that name to the editor rather than leaving the
  // previous reviewer vouching for words they never saw.
  /** @type {import('../types/provenance.js').Review | null} */
  const restamped =
    touchedClaim && wasApproved && stillSound
      ? { status: 'approved', reviewer: by, reviewedAt: today(), notes: current?.notes ?? '' }
      : null;

  if (cleared) {
    after.provenance = { ...after.provenance, review: cleared };
  } else if (restamped) {
    after.provenance = { ...after.provenance, review: restamped };
  }

  const stamp = now();
  /** @type {EditNote} */
  const note = {
    at: stamp,
    by,
    what: changed.join(', '),
    ...(isNonEmptyString(options.reason) ? { reason: options.reason.trim() } : {}),
    ...(resetApproval ? { resetApproval: true } : {}),
  };

  store[factId] = {
    fact: after.fact,
    provenance: after.provenance,
    record: {
      ...before.record,
      updatedAt: stamp,
      updatedBy: by,
      revision: before.record.revision + 1,
      history: [...before.record.history, note],
    },
  };

  await saveFactStore(store);
  // Written after the store, so a crash between the two leaves a fact that
  // is still approved rather than an edit that was silently un-reviewed.
  if (cleared) await saveReview(factId, cleared);
  else if (restamped) await saveReview(factId, restamped);

  return { ok: true, entry: store[factId], resetApproval, verification, changed };
}

const today = () => new Date().toISOString().slice(0, 10);


export { FACTS_PATH };

/**
 * Hold a fact back, or let it go.
 *
 * Facts arrive live now, which is right for the common case and wrong
 * for the one you want to sit on — a fact tied to a date, or one you
 * want held until a batch of its kind is ready. Queueing takes it out of
 * the app without retiring it: retire says "this was wrong", queue says
 * "not yet", and conflating them would lose the difference in the
 * record.
 *
 * @param {string} factId
 * @param {boolean} queued
 * @param {{ by?: string, reason?: string }} options
 */
export async function setQueued(factId, queued, options = {}) {
  const store = await loadFactStore();
  const entry = store[factId];
  if (!entry) return { ok: false, error: `'${factId}' is not in the fact store.` };

  const by = typeof options.by === 'string' ? options.by.trim() : '';
  if (by.length === 0) return { ok: false, error: 'That needs your name.' };
  if ((entry.record.queued === true) === queued) {
    return { ok: false, error: queued ? 'Already queued.' : 'Not queued.' };
  }

  const stamp = now();
  store[factId] = {
    ...entry,
    record: {
      ...entry.record,
      queued,
      updatedAt: stamp,
      updatedBy: by,
      history: [
        ...entry.record.history,
        {
          at: stamp,
          by,
          what: queued ? 'queued' : 'released',
          ...(isNonEmptyString(options.reason) ? { note: options.reason.trim() } : {}),
        },
      ],
    },
  };
  await saveFactStore(store);
  return { ok: true };
}
