/**
 * The rules a decision has to pass before it is written.
 *
 * These came out of the old studio's request handlers, and they are the
 * reason that move mattered. They are not validation of an HTTP body —
 * they are the standard:
 *
 *   - an approval is attributable or it is not an approval
 *   - an accepted image must exist in the licence-checked pool
 *
 * Left in a route handler, a second caller (a bulk script, a future
 * hosted admin) would have to reimplement them, and the copy that drifts
 * is the one that ships an unattributed approval or an unlicensed photo.
 *
 * Each returns `{ ok: false, error }` rather than throwing, because every
 * one of these is a thing a person can legitimately get wrong and needs
 * told about, not an exception.
 */

import { readFile, writeFile } from 'node:fs/promises';

import { loadCorpus } from '../../corpus/index.js';
import { CANDIDATES_PATH, ENRICHED_PATH } from '../paths.js';
import { CATEGORIES } from '../types/fact.js';
import { REVIEW_STATUSES } from '../types/provenance.js';
import {
  IMAGE_STATUSES,
  findCandidate,
  loadImages,
  loadPool,
  saveImageDecision,
  saveImages,
} from './images.js';
import { SLUG_SHAPE, loadSources, saveSources, slugFrom, titleFrom } from '../pipeline/sources.js';
import { trustOf } from '../pipeline/source-trust.js';
import { loadCached } from '../pipeline/fetch.js';
import { cachedSlugs } from '../pipeline/extract.js';
import { keyOf } from '../pipeline/candidate-key.js';
import { editFact, loadFactStore, saveFactStore, setQueued } from './facts.js';
import { deleteReview, saveReview } from './reviews.js';
import { validate } from '../validate.js';

/** @param {string} path */
async function readJsonArray(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} factId
 * @returns {Promise<import('../types/provenance.js').SourcedFact | null>}
 */
async function findFact(factId) {
  const corpus = await loadCorpus();
  return corpus.find((e) => e.fact.id === factId) ?? null;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Record a review decision.
 *
 * @param {{ factId?: unknown, status?: unknown, reviewer?: unknown, notes?: unknown }} body
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function recordReview(body) {
  const { factId, status, reviewer, notes } = body ?? {};

  const entry = typeof factId === 'string' ? await findFact(factId) : null;
  if (!entry) {
    return { ok: false, error: 'Unknown fact id.' };
  }
  if (typeof status !== 'string' || !REVIEW_STATUSES.includes(status)) {
    return { ok: false, error: 'Unknown status.' };
  }

  // An approval is attributable or it is not an approval. The validator
  // says the same thing; saying it here too means the page cannot write a
  // record that `check` then rejects.
  const who = typeof reviewer === 'string' ? reviewer.trim() : '';
  if (status === 'approved' && who.length === 0) {
    return { ok: false, error: 'An approval needs a reviewer name.' };
  }

  /** @type {import('../types/provenance.js').Review} */
  const review = {
    status,
    reviewer: who,
    reviewedAt: today(),
    ...(typeof notes === 'string' && notes.trim().length > 0 ? { notes: notes.trim() } : {}),
  };

  /*
    An approval cannot be talked past the validator.

    The review page disables Approve while a fact has a blocking error,
    but a disabled button is a suggestion — the old studio's API accepted
    the request anyway, so one curl, or one bug in the page, could mark
    `nf_0087` approved with both its passages still unquoted. CLAUDE.md
    says the standard cannot be clicked past; this is what makes that
    true rather than aspirational.

    Only approval is gated. Rejecting or flagging a broken fact has to
    stay possible — that is what those statuses are for.
  */
  if (status === 'approved') {
    const errors = validate({ ...entry, provenance: { ...entry.provenance, review } }).filter(
      (p) => p.level === 'error',
    );
    if (errors.length > 0) {
      const first = errors[0];
      return {
        ok: false,
        error: `Cannot approve: ${errors.length} blocking error${errors.length === 1 ? '' : 's'}. ${first.field}: ${first.message}`,
      };
    }
  }

  await saveReview(factId, review);

  return { ok: true };
}

/**
 * Record an image decision.
 *
 * @param {{ factId?: unknown, status?: unknown, file?: unknown, decidedBy?: unknown, reasoning?: unknown }} body
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function recordImageDecision(body) {
  const { factId, status, file, decidedBy, reasoning } = body ?? {};

  if (typeof factId !== 'string' || !(await findFact(factId))) {
    return { ok: false, error: 'Unknown fact id.' };
  }
  if (typeof status !== 'string' || !IMAGE_STATUSES.includes(status)) {
    return { ok: false, error: 'Unknown status.' };
  }

  // Same rule as a fact approval: a decision that ships something is
  // attributable, or it is not a decision.
  const who = typeof decidedBy === 'string' ? decidedBy.trim() : '';
  if (status === 'accepted' && who.length === 0) {
    return { ok: false, error: 'Accepting an image needs a reviewer name.' };
  }

  const chosen = typeof file === 'string' ? file : '';
  if (status === 'accepted') {
    const pool = await loadPool();
    // An accepted image must exist in the pool, because that is the only
    // place a licence-checked record for it lives. Without this, a typed
    // filename would ship a photograph with no licence behind it.
    if (findCandidate(pool, chosen) === null) {
      return { ok: false, error: 'That file is not in the licence-checked pool.' };
    }
  }

  /*
    What this fact has been refused, kept across the decision.

    The next images run refills any fact without a picture, so a
    rejection has to carry which picture was rejected or the run would
    hand back the one you just turned down. Removing an image records it
    here; the earlier list is carried forward either way.
  */
  const current = (await loadImages())[factId];
  const refused = [
    ...new Set([
      ...(Array.isArray(current?.refused) ? current.refused : []),
      ...(status === 'rejected' && current?.file ? [current.file] : []),
    ]),
  ];

  await saveImageDecision(factId, {
    status,
    file: chosen,
    reasoning: typeof reasoning === 'string' ? reasoning : '',
    decidedBy: who,
    decidedAt: today(),
    // The date is what the page shows; this is what it sorts by. A date
    // alone cannot say which of two pictures changed this morning was
    // the second, and the review list is ordered by what you did last.
    at: new Date().toISOString(),
    refused,
  });

  return { ok: true };
}

/* ---- the seed list -------------------------------------------------- */

/**
 * Parts of a hostname that identify nobody.
 *
 * Stripped so `www.thisdaylive.com` and `premiumtimesng.com` both reduce
 * to the word a person would actually use for the site. Country codes are
 * in here too: '.com.ng' and '.co.uk' would otherwise contribute 'com'
 * and 'co', which name every site equally.
 */
const HOST_NOISE = new Set([
  'www', 'com', 'org', 'net', 'int', 'edu', 'gov', 'mil', 'info', 'co',
  'ng', 'uk', 'za', 'us', 'au', 'ca', 'fr', 'de', 'africa', 'news', 'web',
]);

/**
 * Slugs to try when the obvious one is taken, best first.
 *
 * @param {string} slug
 * @param {string} url
 * @returns {string[]}
 */
function slugAlternatives(slug, url) {
  /** @type {string[]} */
  const out = [];

  if (url.length > 0) {
    let host = '';
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      /* an unparseable url just means no site suffix to offer */
    }
    const label = host
      .split('.')
      .map((part) => part.replace(/[^a-z0-9]/g, ''))
      .find((part) => part.length > 1 && !HOST_NOISE.has(part));
    if (label) out.push(`${slug}-${label}`);
  }

  // Numbers as the last resort: a Wikipedia title can collide with
  // nothing to distinguish it by, and an entry that cannot be added at
  // all is worse than one with a dull name.
  for (let n = 2; n <= 9; n += 1) out.push(`${slug}-${n}`);

  return out.filter((candidate) => SLUG_SHAPE.test(candidate));
}

/**
 * Is this document already in the cache under some other slug?
 *
 * IDENTITY IS PER KIND, and getting this wrong is not a tidiness bug.
 * Matching on title alone across kinds was tested and it did real damage:
 * adding worldhistory.org's 'Kingdom of Benin' adopted the slug of the
 * cached WIKIPEDIA article of the same name. The seed entry then said
 * kind 'web' and url worldhistory.org while the cache under that slug
 * held Wikipedia's text at a revision id — so every fact mined from it
 * would have quoted Wikipedia and cited World History Encyclopedia. A
 * fact whose citation points at a document that does not contain it is
 * exactly the failure the whole provenance schema exists to prevent, and
 * nothing downstream would have caught it: the passage really is in the
 * document the verifier was handed.
 *
 * So a web page is identified by its URL and by nothing else, and a
 * Wikipedia article by its title among Wikipedia documents only. Two
 * different documents that share a name are two documents.
 *
 * @param {import('../pipeline/sources.js').SourceKind} kind
 * @param {string} title
 * @param {string} url
 * @returns {Promise<string | null>} the slug it is cached as
 */
async function cachedTwin(kind, title, url) {
  const bare = (value) => String(value ?? '').replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();
  const wantedUrl = bare(url);
  const wantedTitle = title.toLowerCase();

  for (const slug of await cachedSlugs()) {
    const doc = await loadCached(slug);
    if (!doc) continue;

    // Documents cached before `kind` existed are all Wikipedia.
    const docKind = doc.kind ?? 'wikipedia';
    if (docKind !== kind) continue;

    if (kind === 'web') {
      if (wantedUrl.length > 0 && bare(doc.url) === wantedUrl) return slug;
      continue;
    }
    if (String(doc.title).toLowerCase() === wantedTitle) return slug;
  }
  return null;
}

/**
 * Add an article to the seed list.
 *
 * This is the one stage with no upstream: everything the pipeline ever
 * does starts with a person deciding this page is worth reading.
 * CLAUDE.md §7 says never automate the choosing, and this does not — a
 * text box you type your own choices into is the same judgment, entered
 * somewhere a button can reach.
 *
 * The rules here are all about the slug, because the slug is not a label.
 * It is the cache filename and the prefix on every fact id the document
 * produces, so a duplicate silently overwrites another article's evidence
 * and a wrong shape writes outside the cache directory entirely.
 *
 * @param {{ input?: unknown, slug?: unknown, country?: unknown, group?: unknown }} body
 */
export async function addSource(body) {
  const raw = typeof body?.input === 'string' ? body.input.trim() : '';
  if (raw.length === 0) {
    return { ok: false, error: 'Paste a Wikipedia URL, or type the article title.' };
  }

  /*
    Which fetcher will read this, decided once and stored.

    A bare title with no URL can only be Wikipedia — it is the one source
    you can ask for by name. Everything else is decided from the
    hostname, and the decision is written onto the entry rather than
    re-derived at fetch time, so a source cannot silently change how it
    is read and cited after it has been added.

    The old rule here refused every host but en.wikipedia.org. That was
    right while the fetcher spoke only the Wikipedia API; now it speaks
    HTML too, and the refusal that remains is narrower and about the same
    thing — a page with nothing quotable on it.
  */
  const isUrl = /^https?:\/\//i.test(raw);
  /** @type {import('../pipeline/sources.js').SourceKind} */
  let kind = 'wikipedia';
  /** @type {import('../types/provenance.js').SourceTier} */
  let tier = 'reference';
  let url = '';

  if (isUrl) {
    let host = '';
    try {
      host = new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return { ok: false, error: 'That is not a URL I can read.' };
    }

    if (host === 'en.wikipedia.org' || host === 'en.m.wikipedia.org') {
      kind = 'wikipedia';
    } else {
      const trust = trustOf(raw);
      if (!trust.usable) {
        return {
          ok: false,
          error: `${host} cannot be a source: ${trust.why ?? 'nothing quotable on it.'}`,
        };
      }
      kind = 'web';
      tier = trust.tier;
      url = raw;
    }
  }

  const title = titleFrom(raw);
  if (title.length === 0) {
    return { ok: false, error: 'That URL has no article title in it.' };
  }

  const typed = typeof body?.slug === 'string' ? body.slug.trim() : '';
  let slug = typed.length > 0 ? typed : slugFrom(title);
  if (!SLUG_SHAPE.test(slug)) {
    return {
      ok: false,
      error: `'${slug}' is not a usable slug. Lowercase letters, digits and single hyphens only — it is a filename.`,
    };
  }

  const sources = await loadSources();

  /*
    A clash is now normal, so it is resolved rather than reported.

    While every source was Wikipedia, two entries deriving one slug meant
    somebody had added the same article twice and refusing was right. It
    stopped being right the moment the search reached the open web: the
    Wikipedia article on Yemi Osinbajo and a ThisDay piece about him are
    two different documents that both belong on the list, and both derive
    'yemi-osinbajo'. The refusal handed the problem back — "give this one
    a different slug" — for a filename the person adding a source has no
    reason to care about and no basis to choose.

    The site is what actually distinguishes them, so the site is the
    suffix: 'yemi-osinbajo-thisdaylive'. It stays legible in a fact id and
    in the cache directory, which a numeric suffix would not.

    A slug typed by hand is never rewritten. If you named it, you meant
    it, and silently using a different one would be worse than the error.
  */
  const taken = new Set(sources.map((s) => s.slug));
  let renamed = '';
  if (typed.length === 0 && taken.has(slug)) {
    for (const candidate of slugAlternatives(slug, url)) {
      if (!taken.has(candidate)) {
        // Said out loud rather than done quietly. The slug is the cache
        // filename and the prefix on every fact id this document
        // produces, so a person looking at /review later needs to have
        // been told which name their document went in under.
        renamed = `'${slug}' was taken by another document, so this one is '${candidate}'.`;
        slug = candidate;
        break;
      }
    }
  }

  const clash = sources.find((s) => s.slug === slug);
  if (clash) {
    return { ok: false, error: `Slug '${slug}' is already '${clash.title}'. Give this one a different slug.` };
  }
  /*
    Already on the list — identified the same way the cache identifies it.

    A title was the whole identity of a source while every source was
    Wikipedia, where a title IS a page. It is not that for the rest of the
    web: a title is guessed from the URL slug until a fetch replaces it,
    and two documents on the same subject legitimately share a name. The
    Wikipedia article 'Kingdom of Benin' and World History Encyclopedia's
    'Kingdom of Benin' are two different documents and both belong on the
    list — refusing the second because the first is there would make the
    whole point of searching the open web unreachable for any subject
    Wikipedia already covers, which is most of them.
  */
  const bare = (value) => String(value ?? '').replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase();
  const same = sources.find((s) =>
    kind === 'web'
      ? s.kind === 'web' && url.length > 0 && bare(s.url) === bare(url)
      : s.kind !== 'web' && s.title.toLowerCase() === title.toLowerCase(),
  );
  if (same) {
    return { ok: false, error: `'${same.title}' is already on the list as '${same.slug}'.` };
  }

  /*
    And check the cache, not just the list.

    The seed list has been rewritten before, so ten articles sit in
    _cache/ with no entry pointing at them. Adding one of those under a
    new slug would fetch the same text a second time and pay the model to
    extract it again — the exact duplicate spend the ledger exists to
    stop, walked around by giving the document a new name.

    So the entry adopts the slug the cache already uses, rather than being
    refused. Refusing would also make removal a one-way door: take an
    article off the list by mistake and the cache would block putting it
    back. Adopting costs nothing and loses nothing.
  */
  let adopted = '';
  const twin = await cachedTwin(kind, title, url);
  if (twin) {
    if (sources.some((s) => s.slug === twin)) {
      return { ok: false, error: `'${title}' is already on the list as '${twin}'.` };
    }
    if (twin !== slug) {
      adopted = `Already cached as '${twin}', so it keeps that slug — nothing to refetch.`;
      slug = twin;
    }
  }

  /*
    Country is never defaulted in code.

    CLAUDE.md §10: country is always a data value, and no line may encode
    the launch market. So a blank field inherits from the list you have
    already built rather than from a constant, and an empty list has to be
    told.
  */
  const typedCountry = typeof body?.country === 'string' ? body.country.trim().toUpperCase() : '';
  const country = typedCountry.length > 0 ? typedCountry : (sources.at(-1)?.country ?? '');
  if (country.length === 0) {
    return { ok: false, error: 'Which country is this article about? (ISO code, or AFR for pan-African.)' };
  }

  /** @type {import('../pipeline/sources.js').SourceDoc} */
  const entry = {
    slug,
    title,
    country,
    kind,
    url,
    tier,
    group: typeof body?.group === 'string' ? body.group.trim() : '',
    // What was in the search box when this result was chosen. Reaches the
    // extraction prompt so the model looks for the thing that was being
    // looked for. Empty for a pasted link, which is the unguided case.
    wanted: typeof body?.wanted === 'string' ? body.wanted.trim().slice(0, 400) : '',
  };

  try {
    await saveSources([...sources, entry]);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  // Adoption wins the sentence when both happened: it explains the final
  // slug, and the rename it overrode never took effect.
  return { ok: true, source: entry, note: adopted || renamed };
}

/**
 * Take an article off the seed list.
 *
 * Removal is only ever removal from the list. The cached text stays,
 * because the verifier needs the exact bytes the model saw and facts
 * already published point at them; the candidates stay, because a triage
 * verdict is a decision; the facts obviously stay. What this changes is
 * one thing — fetch will not pull it again, and extract will not offer
 * it. The counts come back so that is visible rather than assumed.
 *
 * @param {{ slug?: unknown }} body
 */
export async function removeSource(body) {
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  const sources = await loadSources();
  if (!sources.some((s) => s.slug === slug)) {
    return { ok: false, error: `'${slug}' is not on the list.` };
  }

  await saveSources(sources.filter((s) => s.slug !== slug));

  const [cached, candidates, store] = await Promise.all([
    loadCached(slug),
    readJsonArray(CANDIDATES_PATH),
    loadFactStore(),
  ]);
  const prefix = `${slug}::`;

  return {
    ok: true,
    kept: {
      cached: cached !== null,
      candidates: candidates.filter((c) => c?.slug === slug).length,
      facts: Object.values(store).filter((r) => String(r?.record?.candidateKey ?? '').startsWith(prefix))
        .length,
    },
  };
}

/* ---- editing a fact that is already in the corpus ---- */

/**
 * The fields an editor may change, and nothing else.
 *
 * `editFact` shallow-merges whatever it is given, so without this list a
 * browser could post `provenance.sources[0].tier: 'primary'` and promote a
 * Wikipedia article to a primary source by typing. The claim and the
 * passage are editable because those are the two things a reviewer
 * actually needs to fix; the citation, the locator and the tier are what
 * the fact rests ON, and changing those is re-sourcing it, not editing it.
 */
const EDITABLE_FACT_FIELDS = ['fact', 'category', 'country', 'relatedIds'];
const EDITABLE_DEEP_DIVE_FIELDS = ['body', 'whyItMatters', 'readTime', 'suggestedQuestion'];

/** @param {unknown} value */
const isStringArray = (value) => Array.isArray(value) && value.every((v) => typeof v === 'string');

/**
 * Edit a stored fact from the review page.
 *
 * Passages arrive as a plain list aligned with the fact's own sources
 * rather than as a provenance object, so the shape a browser sends cannot
 * express "replace the sources" at all. A length mismatch is refused
 * instead of being padded, because the alignment is the only thing tying
 * a typed passage to the source it belongs to.
 *
 * Everything downstream of the write — re-verification, clearing an
 * approval the edit invalidated, the revision and history — is
 * `editFact`'s job and is not duplicated here.
 *
 * @param {{ factId?: unknown, fact?: unknown, deepDive?: unknown, passages?: unknown, by?: unknown, reason?: unknown }} body
 */
/**
 * Delete a fact, and make it stay deleted.
 *
 * Five files, because removing the record alone would not work and the
 * failure would look like the button being broken:
 *
 *   1. `data/facts.json`      the record itself.
 *   2. `_generated/enriched.json`  or `loadCorpus` reads it straight back
 *      in as an unpromoted fact — the store's absence is exactly what
 *      makes it "unpromoted".
 *   3. `_generated/candidates.json`  or the next enrich run mints it
 *      again under a new id, because lineage is recorded on the promoted
 *      fact and deleting the fact deletes the lineage.
 *   4. `data/reviews.json`    its decision, which would otherwise sit
 *      keyed to a fact that no longer exists.
 *   5. `data/images.json`     the same for its picture.
 *
 * Hand-authored facts are refused, on the same argument as editing: they
 * are defined in `corpus/*.js` and deleting one is deleting source.
 *
 * This is the one genuinely destructive action in the studio. There is
 * no undo, and no attempt at one — a restore would need somewhere to put
 * the fact back that is not just this file again. What it does instead
 * is tell you exactly what it removed.
 *
 * @param {{ factId?: unknown, by?: unknown }} body
 */
export async function deleteFact(body) {
  const { factId } = body ?? {};

  if (typeof factId !== 'string' || factId.length === 0) {
    return { ok: false, error: 'Unknown fact id.' };
  }

  const store = await loadFactStore();
  const record = store[factId];
  if (!record) {
    return {
      ok: false,
      error: `'${factId}' is hand-authored in corpus/*.js, so it is deleted in that file, not here.`,
    };
  }

  const key = String(record?.record?.candidateKey ?? '');
  delete store[factId];
  await saveFactStore(store);

  /** @param {string} path */
  const dropFrom = async (path, predicate) => {
    try {
      const rows = JSON.parse(await readFile(path, 'utf8'));
      if (!Array.isArray(rows)) return 0;
      const kept = rows.filter((row) => !predicate(row));
      if (kept.length === rows.length) return 0;
      await writeFile(path, `${JSON.stringify(kept, null, 2)}\n`, 'utf8');
      return rows.length - kept.length;
    } catch {
      // A file that is not there yet is not an error: the enriched and
      // candidate files are both regenerable and both legitimately absent
      // on a fresh checkout.
      return 0;
    }
  };

  const fromEnriched = await dropFrom(ENRICHED_PATH, (row) => row?.fact?.id === factId);
  const fromCandidates =
    key.length > 0 ? await dropFrom(CANDIDATES_PATH, (row) => keyOf(row) === key) : 0;

  const hadReview = await deleteReview(factId);

  const images = await loadImages();
  const hadImage = Object.hasOwn(images, factId);
  if (hadImage) {
    delete images[factId];
    await saveImages(images);
  }

  return {
    ok: true,
    factId,
    removed: {
      enriched: fromEnriched,
      candidates: fromCandidates,
      review: hadReview,
      image: hadImage,
    },
  };
}

/**
 * Several at once, from a selection.
 *
 * @param {{ factIds?: unknown, by?: unknown }} body
 */
export async function deleteFacts(body) {
  return applyEach(
    Array.isArray(body?.factIds) ? body.factIds.map((factId) => ({ factId })) : undefined,
    (item) => deleteFact({ factId: item?.factId, by: body?.by }),
  );
}

export async function saveFactEdit(body) {
  const { factId, fact, deepDive, passages, by, reason } = body ?? {};

  if (typeof factId !== 'string' || factId.length === 0) {
    return { ok: false, error: 'Unknown fact id.' };
  }

  const store = await loadFactStore();
  const before = store[factId];
  if (!before) {
    // Not a bug and not a missing fact: the hand-authored ones live in
    // `corpus/*.js` and an editor writing over them would be a program
    // rewriting source. Say which door this fact came in by.
    return {
      ok: false,
      error: `'${factId}' is hand-authored in corpus/*.js, so it is edited in that file, not here.`,
    };
  }

  /** @type {Record<string, unknown>} */
  const factPatch = {};
  if (fact && typeof fact === 'object') {
    for (const key of EDITABLE_FACT_FIELDS) {
      if (!Object.hasOwn(fact, key)) continue;
      const value = fact[key];
      if (key === 'relatedIds') {
        if (!isStringArray(value)) return { ok: false, error: 'Related ids must be a list of ids.' };
      } else if (typeof value !== 'string') {
        return { ok: false, error: `'${key}' must be text.` };
      }
      factPatch[key] = key === 'relatedIds' ? value : value.trim();
    }
  }

  if (typeof factPatch.fact === 'string' && factPatch.fact.length === 0) {
    return { ok: false, error: 'A fact cannot be empty.' };
  }
  if (typeof factPatch.category === 'string' && !CATEGORIES.includes(factPatch.category)) {
    return { ok: false, error: `Category must be one of ${CATEGORIES.join(', ')}.` };
  }

  if (deepDive && typeof deepDive === 'object') {
    const dive = { ...before.fact.deepDive };
    for (const key of EDITABLE_DEEP_DIVE_FIELDS) {
      if (!Object.hasOwn(deepDive, key)) continue;
      const value = deepDive[key];
      if (key === 'body') {
        if (!isStringArray(value)) return { ok: false, error: 'The deep dive body must be paragraphs.' };
        // A blank line in the editor is a paragraph break, not a paragraph.
        dive.body = value.map((p) => p.trim()).filter((p) => p.length > 0);
      } else if (key === 'readTime') {
        if (!Number.isFinite(value) || value <= 0) {
          return { ok: false, error: 'Read time must be a number of minutes.' };
        }
        dive.readTime = Math.round(value);
      } else {
        if (typeof value !== 'string') return { ok: false, error: `'${key}' must be text.` };
        dive[key] = value.trim();
      }
    }
    factPatch.deepDive = dive;
  }

  /** @type {{ sources: object[] } | undefined} */
  let provenancePatch;
  if (passages !== undefined) {
    const sources = before.provenance.sources ?? [];
    if (!isStringArray(passages) || passages.length !== sources.length) {
      return {
        ok: false,
        error: `This fact has ${sources.length} source(s); send one passage for each.`,
      };
    }
    provenancePatch = { sources: sources.map((source, i) => ({ ...source, passage: passages[i] })) };
  }

  if (Object.keys(factPatch).length === 0 && !provenancePatch) {
    return { ok: false, error: 'Nothing to save.' };
  }

  return editFact(
    factId,
    { fact: factPatch, ...(provenancePatch ? { provenance: provenancePatch } : {}) },
    { by: typeof by === 'string' ? by : '', reason: typeof reason === 'string' ? reason : '' },
  );
}


/**
 * Hold a fact back, or release it.
 *
 * Same shape as retirement because it is the same kind of decision — a
 * reviewer saying this should not be in front of readers — with a
 * different reason behind it. Queue is "not yet", retire is "not this".
 *
 * @param {unknown} body
 */
export async function changeQueued(body) {
  const { factId, queued, by, reason } = body ?? {};

  if (typeof factId !== 'string' || factId.length === 0) {
    return { ok: false, error: 'Unknown fact id.' };
  }
  if (typeof queued !== 'boolean') {
    return { ok: false, error: 'Say whether to queue or release.' };
  }

  return setQueued(factId, queued, {
    by: typeof by === 'string' ? by : '',
    reason: typeof reason === 'string' ? reason : '',
  });
}

/* ---- the same decisions, applied to a list -------------------------- */

/**
 * Why bulk goes through the singular every time.
 *
 * A list of 60 approvals is 60 approvals, not a different kind of act, so
 * each one runs the same function a single click runs — same name check,
 * same validator gate, same refusal to accept an image that is not in the
 * licence-checked pool. Nothing here can be looser than the button.
 *
 * Sequential on purpose. Each write loads the store, changes one key and
 * writes it back; run in parallel they would overwrite each other and the
 * last one home would win.
 *
 * A failure does not abandon the rest. Selecting 40 facts of which one is
 * blocked should approve 39 and tell you which one it could not, because
 * the alternative is a bulk action that silently does nothing.
 *
 * @param {unknown} items
 * @param {(item: any) => Promise<{ ok: true } | { ok: false, error: string }>} apply
 * @returns {Promise<{ ok: true, done: number, failed: { factId: string, error: string }[] } | { ok: false, error: string }>}
 */
async function applyEach(items, apply) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Nothing selected.' };
  }

  let done = 0;
  /** @type {{ factId: string, error: string }[]} */
  const failed = [];
  for (const item of items) {
    const result = await apply(item);
    if (result.ok) done += 1;
    else failed.push({ factId: String(item?.factId ?? '?'), error: result.error });
  }
  return { ok: true, done, failed };
}

/**
 * Review a list of facts at once.
 *
 * @param {{ items?: unknown, reviewer?: unknown }} body
 */
export async function recordReviews(body) {
  return applyEach(body?.items, (item) =>
    recordReview({
      factId: item?.factId,
      status: item?.status,
      reviewer: body?.reviewer,
      notes: item?.notes,
    }),
  );
}

/**
 * Decide a list of images at once.
 *
 * `file` travels per item rather than being shared, because accepting in
 * bulk means accepting each fact's own proposal — there is no single
 * image the selection has in common.
 *
 * @param {{ items?: unknown, decidedBy?: unknown }} body
 */
export async function recordImageDecisions(body) {
  return applyEach(body?.items, (item) =>
    recordImageDecision({
      factId: item?.factId,
      status: item?.status,
      file: item?.file,
      reasoning: item?.reasoning,
      decidedBy: body?.decidedBy,
    }),
  );
}

/**
 * Take several articles off the seed list.
 *
 * @param {{ slugs?: unknown }} body
 */
export async function removeSources(body) {
  const slugs = body?.slugs;
  if (!Array.isArray(slugs) || slugs.length === 0) {
    return { ok: false, error: 'Nothing selected.' };
  }

  let done = 0;
  /** @type {{ slug: string, error: string }[]} */
  const failed = [];
  const kept = { cached: 0, candidates: 0, facts: 0 };
  for (const slug of slugs) {
    const result = await removeSource({ slug });
    if (!result.ok) {
      failed.push({ slug: String(slug), error: result.error });
      continue;
    }
    done += 1;
    kept.cached += result.kept.cached ? 1 : 0;
    kept.candidates += result.kept.candidates;
    kept.facts += result.kept.facts;
  }
  return { ok: true, done, failed, kept };
}
