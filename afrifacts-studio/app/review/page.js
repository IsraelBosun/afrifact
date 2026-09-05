'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CATEGORIES } from '@/lib/types/fact.js';

import { ImagePanel, Pic } from './ImagePanel.js';
import { SelectionBar } from '../SelectionBar.js';
import { useSelection } from '../useSelection.js';

/**
 * The fact gate, and the one place a fact is edited.
 *
 * Approve is disabled while the validator reports an error, so the
 * standard cannot be clicked past. That is not a UI nicety: the server
 * enforces the same rule, and `npm run check` reads the same decisions
 * file, so the page, the CLI and the export cannot disagree about whether
 * something is publishable.
 *
 * Editing lives here because this is where finished work ends up. The
 * queues before it — sources, triage, images — now show only what is
 * still waiting, which leaves exactly one page holding the facts that are
 * done, and the only thing left to do to a done fact is change it.
 *
 * Editing opens inside the evidence panel rather than beside it. What you
 * are about to change is the claim and the passage under it, and those
 * two have to agree — the form was one click away from the quote it is
 * checked against, in a row that had three buttons where the picture is
 * the one that gets used.
 *
 * Three things the edit form is careful about:
 *
 *   - It offers the claim, the passage and the deep dive, and nothing
 *     else. Citations, locators and source tiers are what a fact rests
 *     ON; changing those is re-sourcing it, not editing it.
 *   - Editing the claim or a passage re-runs the grounding check and
 *     clears an existing approval, so an approved fact cannot be quietly
 *     rewritten into something nobody read. The page says so out loud
 *     before the save and again after it.
 *   - Every save reaches the app. Export runs behind each write, so a
 *     corrected fact is corrected on the phone, and a fact whose approval
 *     an edit just cleared leaves the app in the same movement.
 */
/*
  Three lanes, not seven.

  The old bar had a tab per stored status, which is a listing of the data
  model rather than a way through the work: seven buttons of which two
  were normally empty, and the one you wanted — the queue — sat beside
  six that were not queues at all.

  These three answer the only questions asked daily: what needs me, what
  is live, and everything. "Needs work" belongs in the first because that
  is exactly what it means; a blocked fact is already there too, since a
  fact with errors cannot have been approved.

  The rarer cuts are not lost, they are just not tabs. Held back
  and blocked go in the dropdown beside them — reachable in one click,
  costing no width when nobody is looking for them.
*/
const FILTERS = [
  { key: 'live', label: 'Live' },
  { key: 'off', label: 'Not live' },
  { key: 'all', label: 'All' },
];

/** The cross-cutting cuts. Not statuses in a row, so not tabs. */
const NARROW = [
  { key: 'withImage', label: 'With an image' },
  { key: 'noImage', label: 'Without an image' },
];

export default function ReviewPage() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('live');
  const [query, setQuery] = useState('');
  const [who, setWho] = useState('');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [notes, setNotes] = useState({});
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [picture, setPicture] = useState(null);
  /*
    Which row is being held back, if any.

    The reason used to be a text box on all 150 rows at once. Measured on
    the real file: not one was ever typed in — of 150 stored notes, 130
    say "Bulk approved without individual review", 14 came from the
    pipeline, and the rest are empty. It appears at the one moment a
    reason is worth having, which is the moment you take something out of
    the app.
  */
  const [holding, setHolding] = useState(null);

  useEffect(() => {
    try {
      setWho(localStorage.getItem('afrifacts.reviewer') ?? '');
    } catch {
      /* not fatal */
    }
  }, []);

  const load = useCallback(async () => {
    const res = await fetch('/api/facts', { cache: 'no-store' });
    setData(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** What the export did, said in one line, so a save is visibly a publish. */
  const exportNote = useCallback((body) => {
    const done = body?.exported;
    if (!done) return '';
    if (!done.ok) return ` The app file was not written: ${done.error}`;
    return ` ${done.facts} approved fact${done.facts === 1 ? '' : 's'} now in the app.`;
  }, []);

  const decide = useCallback(
    async (factId, status) => {
      setError('');
      setFlash('');
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId, status, reviewer: who, notes: '' }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'That did not save.');
        return;
      }
      setData(body);
      setFlash(`${factId} ${status}.${exportNote(body)}`);
    },
    [who, exportNote],
  );

  /*
    The same decision for a selection.

    Each fact still goes through the rule that guards the single button —
    a name, and the validator gate on approval — so a bulk approve cannot
    wave through a fact whose Approve button is disabled. It comes back
    saying which ones it refused and why, because forty selected and
    thirty-nine approved is information, not an error.
  */
  const decideMany = useCallback(
    async (factIds, status) => {
      setError('');
      setFlash('');
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: factIds.map((factId) => ({ factId, status, notes: '' })),
          reviewer: who,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'That did not save.');
        return;
      }
      setData(body);
      const failed = body.bulk?.failed ?? [];
      setFlash(
        `${body.bulk?.done ?? 0} ${status}.${exportNote(body)}` +
          (failed.length > 0
            ? ` ${failed.length} refused: ${failed.map((f) => `${f.factId} — ${f.error}`).join('; ')}`
            : ''),
      );
    },
    [who, exportNote],
  );

  const save = useCallback(
    async (factId, patch) => {
      setError('');
      setFlash('');
      const res = await fetch('/api/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'edit', factId, by: who, ...patch }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'That did not save.');
        return;
      }
      setData(body);
      setEditing(null);

      const parts = [`Saved ${factId} — ${body.changed.join(', ')}.`];
      if (body.resetApproval) {
        parts.push(
          'That touched the claim, so the approval is cleared and it needs reviewing again.',
        );
      }
      if (body.verification && !body.verification.ok) {
        parts.push(`The claim no longer checks out against its passage: ${body.verification.reason}`);
      }
      setFlash(`${parts.join(' ')}${exportNote(body)}`);
    },
    [who, exportNote],
  );



  /*
    Hold a fact back, or let it go.

    The one way a fact leaves the app. Whether it left because it was
    wrong or merely early is what the note is for — the history records
    what you typed, which carries the distinction without needing two
    buttons that did the same thing.
  */
  const queue = useCallback(
    async (factId, queued, reason) => {
      setError('');
      const res = await fetch('/api/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'queue', factId, queued, by: who, reason }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'That did not save.');
        return;
      }
      setData(body);
      setFlash(queued ? 'Held back. It is out of the app until you release it.' : 'Released.');
    },
    [who],
  );

  /*
    Delete, from a selection.

    The only irreversible thing on this page, so it names what it is
    about to do rather than counting it — "delete 12 facts" is not
    something anybody can check before clicking it. The server removes
    the record, its review, its picture, its row in the enriched file and
    the candidate it was made from, because anything less grows the fact
    back on the next run.
  */
  const removeMany = useCallback(
    async (chosen) => {
      const names = chosen
        .slice(0, 12)
        .map((f) => `  · ${f.id} — ${f.fact.slice(0, 70)}`)
        .join('\n');
      const more = chosen.length > 12 ? `\n  … and ${chosen.length - 12} more` : '';
      if (
        !window.confirm(
          `Delete ${chosen.length} fact${chosen.length === 1 ? '' : 's'}?\n\n${names}${more}\n\n` +
            'This cannot be undone. They leave the app, and the pipeline will not make them again.',
        )
      ) {
        return;
      }

      setError('');
      setFlash('');
      const res = await fetch('/api/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'deleteMany', factIds: chosen.map((f) => f.id), by: who }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'That did not delete.');
        return;
      }
      setData(body);
      const failed = body.bulk?.failed ?? [];
      setFlash(
        `Deleted ${body.bulk?.done ?? 0}.${exportNote(body)}` +
          (failed.length > 0
            ? ` ${failed.length} refused: ${failed.map((f) => `${f.factId} — ${f.error}`).join('; ')}`
            : ''),
      );
      return true;
    },
    [who, exportNote],
  );

  const decideImage = useCallback(
    async (factId, status, file, reasoning) => {
      setError('');
      setFlash('');
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId, status, file, decidedBy: who, reasoning }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'That did not save.');
        return;
      }
      // The image route answers with the image queue, not this one.
      await load();
      setFlash(`Image ${status} for ${factId}.${exportNote(body)}`);
    },
    [who, load, exportNote],
  );

  const rememberName = useCallback((value) => {
    setWho(value);
    try {
      localStorage.setItem('afrifacts.reviewer', value);
    } catch {
      /* not fatal */
    }
  }, []);

  const facts = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.facts.filter((f) => {
      if (needle.length > 0) {
        const haystack = `${f.id} ${f.fact} ${f.category} ${f.country}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (filter === 'all') return true;
      if (filter === 'withImage') return Boolean(f.image?.chosen);
      if (filter === 'noImage') return !f.image?.chosen;
      /*
        Live, or not live, and nothing in between.

        Facts arrive approved now, so 'waiting on you' has no members and
        a tab for it was a tab that was always empty. The question worth
        asking a corpus of 135 is which of them a reader can actually
        see, and the two reasons one cannot — blocked, or held back —
        share the one lane because the answer to both is the same:
        it is not out there and you may want it to be.
      */
      if (filter === 'live') return f.live;
      return !f.live;
    });
  }, [data, filter, query]);

  const picked = useSelection(useMemo(() => facts.map((f) => f.id), [facts]));

  if (!data) return <p className="empty">Loading the corpus…</p>;

  // Approve runs the validator server-side and refuses a blocked fact, so
  // the button counts only the ones it can actually take.
  const approvable = facts.filter((f) => picked.has(f.id) && f.clean && !f.live);

  const counts = data.facts.reduce((acc, f) => {
    if (f.live) acc.live = (acc.live ?? 0) + 1;
    else acc.off = (acc.off ?? 0) + 1;
    if (f.image?.chosen) acc.withImage = (acc.withImage ?? 0) + 1;
    else acc.noImage = (acc.noImage ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <p className="lede">
        Facts arrive here live. This is where you correct one, hold it back, or pull it — and
        where its picture is chosen. A fact with a blocking error cannot ship whatever you click:
        fix the fact, not the button. Every edit is exported to the app as you make it. Newest
        first: whatever you last edited, held back or gave a picture to is at the top.
      </p>

      {/*
        The controls stay put.

        Filters, search, your name and the selection bar are all things
        you reach for partway down a list of 150 — and every one of them
        used to mean scrolling back to the top first. They are one sticky
        block rather than two so they cannot overlap each other, and the
        messages sit below it so a long one cannot grow the header.
      */}
      <div className="stickyTop">
      <div className="filters">
        {FILTERS.map((f) => (
          <button key={f.key} data-on={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
            {f.key !== 'all' && counts[f.key] ? ` (${counts[f.key]})` : ''}
          </button>
        ))}
        <select
          value={NARROW.some((n) => n.key === filter) ? filter : ''}
          onChange={(e) => setFilter(e.target.value === '' ? 'live' : e.target.value)}>
          <option value="">Narrow to…</option>
          {NARROW.map((n) => (
            <option key={n.key} value={n.key}>
              {n.label} ({counts[n.key] ?? 0})
            </option>
          ))}
        </select>
        <input
          type="search"
          className="searchBox"
          placeholder="Find a fact"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
        <input
          type="text"
          placeholder="Your name"
          value={who}
          onChange={(e) => rememberName(e.target.value)}
          style={{ minWidth: 140 }}
        />
      </div>

      <SelectionBar
        count={picked.count}
        hidden={picked.hidden}
        allShown={picked.allShown}
        onToggleAll={picked.toggleAll}
        onClear={picked.clear}>
        <button
          className="good"
          disabled={approvable.length === 0 || who.trim().length === 0}
          title={
            who.trim().length === 0
              ? 'Type your name first — an approval is attributable'
              : approvable.length < picked.count
                ? `${picked.count - approvable.length} of these are blocked or already live`
                : undefined
          }
          onClick={() => void decideMany(approvable.map((f) => f.id), 'approved')}>
          Publish {approvable.length || ''}
        </button>
        <button
          className="bad"
          disabled={picked.count === 0}
          title="Removes them for good — the fact, its picture, its review and the candidate behind it"
          onClick={async () => {
            const chosen = facts.filter((f) => picked.has(f.id));
            if (await removeMany(chosen)) picked.clear();
          }}>
          Delete {picked.count || ''}
        </button>
      </SelectionBar>
      </div>

      {error && (
        <div className="problem error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}
      {flash && (
        <div className="problem warning" style={{ marginBottom: 14 }}>
          {flash}
        </div>
      )}

      {facts.length === 0 && <p className="empty">Nothing here.</p>}

      {facts.map((fact) => (
        <div className="card" key={fact.id} data-picked={picked.has(fact.id)}>
          <div className="spread" style={{ marginBottom: 10 }}>
            <label className="pick">
              <input
                type="checkbox"
                checked={picked.has(fact.id)}
                onChange={() => picked.toggle(fact.id)}
              />
            </label>
            <span className={`pill cat-${fact.category}`}>{fact.category}</span>
            <span className="mono faint">
              {fact.id} · #{fact.factNumber} · {fact.country}
            </span>
            <LivePill fact={fact} />
            {fact.revision > 1 && (
              <span className="pill" title={`Last edited by ${fact.updatedBy} on ${fact.updatedAt}`}>
                rev {fact.revision}
              </span>
            )}
            <span className="tiny faint" style={{ marginLeft: 'auto' }}>
              {fact.surprise.priorProbability}/{fact.surprise.specificity}/
              {fact.surprise.explicability} · {fact.decay.kind}
            </span>
          </div>

          {/*
            The picture, on the row.

            It used to be buried inside 'Evidence & deep dive', so the
            one question you can answer at a glance — does this image
            belong to this claim — was three clicks from the claim. A
            wrong picture is the kind of mistake that is obvious in a
            thumbnail and invisible in a filename.
          */}
          <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
            {fact.image?.chosen && (
              <Pic
                key={fact.image.chosen.url}
                src={fact.image.chosen.url}
                thumbnail={fact.image.chosen.thumbnail}
                className="rowThumb"
                title={fact.image.chosen.credit}
              />
            )}
            <p className="factText" style={{ flex: 1, margin: 0 }}>
              {fact.fact}
            </p>
          </div>

          {fact.errors.map((p, i) => (
            <div className="problem error" key={`e${i}`}>
              {p.field}: {p.message}
            </div>
          ))}
          {fact.warnings.map((p, i) => (
            <div className="problem warning" key={`w${i}`}>
              {p.field}: {p.message}
            </div>
          ))}

          {/*
            Two buttons, not three. Edit moved inside the evidence panel:
            what an edit changes is the claim and the passage under it,
            and those two have to agree, so the form belongs next to the
            quote rather than one row above it.
          */}
          <div className="row" style={{ marginTop: 8 }}>
            <button
              className="tiny"
              onClick={() => {
                const next = open === fact.id ? null : fact.id;
                setOpen(next);
                if (next === null) setEditing(null);
              }}>
              {open === fact.id ? 'Hide evidence' : 'Evidence, deep dive & edit'}
            </button>
            <button
              className="tiny"
              onClick={() => setPicture(picture === fact.id ? null : fact.id)}>
              {picture === fact.id
                ? 'Close picture'
                : fact.image?.chosen
                  ? 'Change the picture'
                  : 'Add a picture'}
            </button>
          </div>

          {picture === fact.id && (
            <ImagePanel
              image={fact.image}
              who={who}
              onDecide={(status, file, reasoning) => decideImage(fact.id, status, file, reasoning)}
            />
          )}

          {open === fact.id && editing === fact.id && (
            <EditForm
              fact={fact}
              who={who}
              onCancel={() => setEditing(null)}
              onSave={(patch) => save(fact.id, patch)}
            />
          )}

          {open === fact.id && editing !== fact.id && (
            <div style={{ marginTop: 12 }}>
              <div className="spread" style={{ marginBottom: 10 }}>
                <span className="tiny faint">What it rests on</span>
                <button
                  className="tiny"
                  disabled={!fact.editable}
                  title={
                    fact.editable
                      ? 'Change the claim, the passage or the deep dive'
                      : 'Hand-authored in corpus/*.js — edit it in the file, not here.'
                  }
                  onClick={() => setEditing(fact.id)}>
                  Edit this fact
                </button>
              </div>
              {fact.sources.map((source, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <p className="small">
                    <strong>{source.shortName}</strong> <span className="pill">{source.tier}</span>
                  </p>
                  <p className="tiny muted">{source.citation}</p>
                  {source.passageMissing ? (
                    <div className="problem error">
                      No usable passage. The fact must be quoted from the source.
                    </div>
                  ) : (
                    <blockquote className="passage">{source.passage}</blockquote>
                  )}
                  {source.note && <p className="tiny faint">Note: {source.note}</p>}
                  <p className="tiny mono faint">
                    {Object.entries(source.locator)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('  ·  ')}
                  </p>
                </div>
              ))}

              <p className="tiny faint">Deep dive · {fact.deepDive.readTime} min</p>
              {fact.deepDive.body.map((para, i) => (
                <p className="small muted" key={i}>
                  {para}
                </p>
              ))}
              <p className="small">
                <strong>Why it matters.</strong> {fact.deepDive.whyItMatters}
              </p>
            </div>
          )}

          {fact.reviewer && (
            <p className="tiny faint">
              {fact.status} by {fact.reviewer} on {fact.reviewedAt}
              {fact.notes ? ` — ${fact.notes}` : ''}
            </p>
          )}

          {/*
            One verb, whichever applies.

            A row used to carry Approve, Reject and Needs work whatever
            state it was in, so a fact already on people's phones offered
            an Approve that only re-stamped the record and two buttons
            that quietly unpublished it. A fact is either live or it is
            not, and there is exactly one thing to do about that.

            Retire used to sit beside Hold back. They differed in the
            words on the button and in nothing else: both took a fact out
            of the app, both came back with one click. Two names for one
            state is a question the reviewer answers before every click,
            and the answer never changed what happened.

            The reason comes with the click that needs one. Publish and
            Release explain themselves; taking a fact away from readers
            is the only one where next month's you will want to know why.
          */}
          <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
            {fact.queued ? (
              <button
                className="good"
                disabled={who.trim().length === 0}
                title={who.trim().length === 0 ? 'Type your name first' : 'Puts it back in the app'}
                onClick={() => void queue(fact.id, false, '')}>
                Release
              </button>
            ) : fact.live ? (
              holding === fact.id ? (
                <>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Why hold it back?"
                    value={notes[fact.id] ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [fact.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setHolding(null);
                      if (e.key === 'Enter' && who.trim().length > 0) {
                        setHolding(null);
                        void queue(fact.id, true, notes[fact.id] ?? '');
                      }
                    }}
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <button
                    className="bad"
                    disabled={who.trim().length === 0}
                    title={
                      who.trim().length === 0
                        ? 'Type your name first'
                        : 'Takes it out of the app. Its number stays reserved. Release brings it back.'
                    }
                    onClick={() => {
                      setHolding(null);
                      void queue(fact.id, true, notes[fact.id] ?? '');
                    }}>
                    Hold it back
                  </button>
                  <button onClick={() => setHolding(null)}>Cancel</button>
                </>
              ) : (
                <button className="bad" onClick={() => setHolding(fact.id)}>
                  Hold back
                </button>
              )
            ) : (
              <button
                className="good"
                disabled={!fact.clean || who.trim().length === 0}
                title={
                  !fact.clean
                    ? 'Fix the blocking errors first'
                    : who.trim().length === 0
                      ? 'Type your name first'
                      : 'Puts it in the app now'
                }
                onClick={() => void decide(fact.id, 'approved')}>
                Publish
              </button>
            )}
          </div>
        </div>
      ))}

      <p className="tiny faint">
        Decisions are written to <span className="mono">{data.reviewsPath}</span>, never back into
        the corpus files. Edits go to the fact store, which is the only copy that survives the next
        enrich run.
      </p>
    </>
  );
}

/**
 * The edit form.
 *
 * Paragraphs are one textarea split on blank lines rather than a list of
 * inputs, because that is how the body is written and read, and because a
 * per-paragraph UI turns moving one into a chore. Empty paragraphs are
 * dropped on the server, so a stray blank line stays a formatting habit
 * rather than becoming an empty paragraph in the app.
 *
 * The whole form posts every time. Working out a minimal diff in the
 * browser would only move the comparison somewhere less able to make it —
 * the server holds what is stored, compares against that, and refuses a
 * no-op.
 */
function EditForm({ fact, who, onCancel, onSave }) {
  const [claim, setClaim] = useState(fact.fact);
  const [category, setCategory] = useState(fact.category);
  const [country, setCountry] = useState(fact.country);
  const [why, setWhy] = useState(fact.deepDive.whyItMatters);
  const [body, setBody] = useState(fact.deepDive.body.join('\n\n'));
  const [question, setQuestion] = useState(fact.deepDive.suggestedQuestion);
  const [passages, setPassages] = useState(fact.sources.map((s) => s.passage));
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const claimTouched = claim.trim() !== fact.fact.trim();
  const passageTouched = passages.some((p, i) => p !== fact.sources[i].passage);
  const willReset = (claimTouched || passageTouched) && fact.status === 'approved';

  const submit = useCallback(async () => {
    setBusy(true);
    await onSave({
      fact: { fact: claim, category, country },
      deepDive: {
        whyItMatters: why,
        suggestedQuestion: question,
        body: body.split(/\n\s*\n/),
      },
      passages,
      reason,
    });
    setBusy(false);
  }, [onSave, claim, category, country, why, question, body, passages, reason]);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <label className="tiny faint" htmlFor={`claim-${fact.id}`}>
        The fact — what the card says
      </label>
      <textarea
        id={`claim-${fact.id}`}
        value={claim}
        rows={3}
        onChange={(e) => setClaim(e.target.value)}
        style={{ width: '100%', marginTop: 4 }}
      />

      <div className="sourceFields">
        <div>
          <label className="tiny faint" htmlFor={`cat-${fact.id}`}>
            Category
          </label>
          <select id={`cat-${fact.id}`} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="tiny faint" htmlFor={`country-${fact.id}`}>
            Country
          </label>
          <input
            id={`country-${fact.id}`}
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
      </div>

      {fact.sources.map((source, i) => (
        <div key={i} style={{ marginTop: 12 }}>
          <label className="tiny faint" htmlFor={`passage-${fact.id}-${i}`}>
            Passage from {source.shortName} — quoted verbatim. No passage, no fact.
          </label>
          <textarea
            id={`passage-${fact.id}-${i}`}
            value={passages[i]}
            rows={4}
            onChange={(e) =>
              setPassages((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
            }
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      ))}

      <label className="tiny faint" style={{ display: 'block', marginTop: 12 }}>
        Deep dive — a blank line starts a new paragraph
      </label>
      <textarea
        value={body}
        rows={8}
        onChange={(e) => setBody(e.target.value)}
        style={{ width: '100%', marginTop: 4 }}
      />

      <label className="tiny faint" style={{ display: 'block', marginTop: 12 }}>
        Why it matters
      </label>
      <textarea
        value={why}
        rows={3}
        onChange={(e) => setWhy(e.target.value)}
        style={{ width: '100%', marginTop: 4 }}
      />

      <label className="tiny faint" style={{ display: 'block', marginTop: 12 }}>
        Suggested question — the placeholder in the app&apos;s ask box
      </label>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: '100%', marginTop: 4 }}
      />

      {willReset && (
        <div className="problem warning" style={{ marginTop: 12 }}>
          This fact is approved and you have changed the {claimTouched ? 'claim' : 'passage'}.
          Saving clears the approval and takes it out of the app until someone reviews it again.
        </div>
      )}

      <div className="spread" style={{ marginTop: 14 }}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button
            className="primary"
            disabled={busy || who.trim().length === 0}
            title={who.trim().length === 0 ? 'Type your name first' : undefined}
            onClick={() => void submit()}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onCancel}>Cancel</button>
          <input
            type="text"
            placeholder="Why this edit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
        </div>
        <span className="tiny faint">Saves as revision {fact.revision + 1}.</span>
      </div>
    </div>
  );
}


/**
 * Is it in the app, and if not, why not.
 *
 * One pill where there were three. A row used to carry a status pill
 * (draft / approved / needs-work) beside a `blocked` pill beside a `held
 * back` pill, under a Live / Not live filter — four vocabularies for one
 * question, three of them the inputs to the fourth. On the real corpus
 * they said almost nothing: 149 approved, one draft, `needs-work` never
 * used once, and no fact ever held back.
 *
 * Blocked outranks held back deliberately. A fact that is both is one
 * you have to fix before the hold is even a decision you get to make.
 */
function LivePill({ fact }) {
  if (fact.live) return <span className="pill ok">live</span>;
  if (!fact.clean) return <span className="pill error">blocked</span>;
  if (fact.queued) return <span className="pill warn">held back</span>;
  return <span className="pill">not live</span>;
}
