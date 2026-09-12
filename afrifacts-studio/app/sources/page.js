'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FindArticles } from './FindArticles.js';
import { SelectionBar } from '../SelectionBar.js';
import { useSelection } from '../useSelection.js';

/**
 * The front of the pipeline.
 *
 * This is the only stage with nothing upstream of it: every fact in the
 * corpus exists because somebody decided one article was worth reading.
 * CLAUDE.md §7 says never automate the choosing, and nothing here does —
 * a box you type your own choices into is the same judgment as a
 * hand-edited list, entered somewhere a button can reach.
 *
 * Which is what was missing. The board showed Sources as a card with a
 * count and no way in, so starting new work meant editing
 * `data/sources.json` in a text editor. Everything downstream had a
 * button; the one stage that begins the work did not.
 */
/*
  A source with a next action.

  `lib/status.js` runs the same test for the board's Sources count, so the
  card and this page cannot disagree about the size of the job. An
  extracted source is finished: every later run skips it.

  Hidden here, not deleted. The seed entry stays in `data/sources.json`
  and its cached text stays in `_cache/` — that text is the evidence the
  verifier string-matches passages against. Hiding a row costs nothing;
  deleting one costs the proof.
*/
const WANTS = (s) => !s.extracted || s.landedOn || s.duplicateOf?.length > 0;

export default function SourcesPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [input, setInput] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [group, setGroup] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [busy, setBusy] = useState(false);
  /*
    The slug and the country, folded away.

    Adding a source needs one thing: which article. The slug derives from
    the title and is only typed when you want a shorter one; the country
    is the same value on every one of the 37 entries and already reuses
    the last. Three boxes of which two are almost never touched turns one
    decision into a form.
  */
  const [details, setDetails] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/sources', { cache: 'no-store' });
    setData(await res.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sources = useMemo(() => data?.sources ?? [], [data]);

  // The groups already in use, offered as suggestions. They are the notes
  // explaining why a block of pages was picked, and they are only useful
  // if new entries land in the same handful rather than inventing a
  // fifth spelling of "People".
  const groups = useMemo(
    () => [...new Set(sources.map((s) => s.group).filter(Boolean))].sort(),
    [sources],
  );

  /*
    One add, two doors.

    The form passes what you typed; a search result passes its exact
    title. Everything after that — the slug rules, the clash checks, the
    cache check — is the server's, so a source added by searching cannot
    end up under different rules from one added by pasting a link.
  */
  const submit = useCallback(
    async (title, extra = {}) => {
      setError('');
      setNote('');
      setBusy(true);
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: title, country, group, ...extra }),
      });
      const body = await res.json().catch(() => ({}));
      setBusy(false);
      if (!res.ok) {
        setError(body.error ?? 'Could not add that.');
        return false;
      }
      setNote(
        body.note
          ? `Added '${body.source.title}' as ${body.source.slug}. ${body.note}`
          : `Added '${body.source.title}' as ${body.source.slug}. Run fetch to pull its text.`,
      );
      await refresh();
      return true;
    },
    [country, group, refresh],
  );

  const add = useCallback(
    async (event) => {
      event.preventDefault();
      const ok = await submit(input, { slug });
      if (!ok) return;
      setInput('');
      setSlug('');
      setGroup('');
    },
    [input, slug, submit],
  );

  const remove = useCallback(
    async (entry) => {
      // Removal is only removal from the list — the cached text, the
      // candidates and any published facts all stay. Said plainly here
      // because the opposite is the reasonable assumption.
      const consequence = entry.extracted
        ? '\n\nIt has already been extracted. Its candidates and facts stay; so does the cached text the verifier needs.'
        : entry.cached
          ? '\n\nIts cached text stays on disk.'
          : '';
      if (!window.confirm(`Take '${entry.title}' off the seed list?${consequence}`)) return;

      setError('');
      setNote('');
      const res = await fetch('/api/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: entry.slug }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Could not remove that.');
        return;
      }
      const kept = body.kept ?? {};
      const parts = [
        kept.cached ? 'cached text' : null,
        kept.candidates > 0 ? `${kept.candidates} candidate(s)` : null,
        kept.facts > 0 ? `${kept.facts} fact(s)` : null,
      ].filter(Boolean);
      setNote(
        parts.length > 0
          ? `Removed ${entry.slug} from the list. Kept: ${parts.join(', ')}.`
          : `Removed ${entry.slug}. Nothing else referenced it.`,
      );
      await refresh();
    },
    [refresh],
  );

  /*
    Several off the list at once.

    Same removal, and the same thing it does not do: the cached text, the
    candidates and the published facts all stay. The confirmation names
    every article rather than counting them, because 'remove 9 sources' is
    not something anyone can check before clicking it.
  */
  const removeMany = useCallback(
    async (entries) => {
      const names = entries.map((e) => `  · ${e.title}`).join('\n');
      if (
        !window.confirm(
          `Take these ${entries.length} off the seed list?\n\n${names}\n\nTheir cached text, candidates and facts all stay.`,
        )
      ) {
        return;
      }

      setError('');
      setNote('');
      const res = await fetch('/api/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: entries.map((e) => e.slug) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Could not remove those.');
        return;
      }
      const kept = body.kept ?? {};
      setNote(
        `Removed ${body.done} from the list. Kept: ${kept.cached} cached document(s), ${kept.candidates} candidate(s), ${kept.facts} fact(s).` +
          (body.failed?.length > 0
            ? ` ${body.failed.length} could not be removed: ${body.failed
                .map((f) => f.slug)
                .join(', ')}`
            : ''),
      );
      await refresh();
    },
    [refresh],
  );

  /*
    Start the run from here, having just added to the list.

    It used to start fetch alone, which left you on the board with three
    more buttons to press in the only order they go in. The whole chain
    is the same one click, and what comes out of it is live.
  */
  const runThrough = useCallback(async (slugs) => {
    setError('');
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      /*
        One article, when one was named.

        Fetch, extract and enrich all narrow to the slugs they are given,
        so this is the same chain the whole-list button runs, over a list
        of one. It is the unit the work actually arrives in: you find an
        article, you want to know what is in it, and you should not have
        to re-walk the other forty to find out.
      */
      body: JSON.stringify(slugs?.length ? { stage: 'all', slugs } : { stage: 'all' }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Could not start the run.');
      return;
    }
    // The board owns the log. The run keeps going either way — it is a
    // job on the server, not a request this page is holding open, so
    // leaving this page does not cancel it.
    router.push('/');
  }, [router]);

  /*
    Search reaches the hidden ones too.

    A finished source is hidden because it has no next action, not because
    it is gone — and the moment you go looking for one by name, "nothing
    here" would be a lie. Typing anything searches the whole list; the
    toggle is for browsing it without a query.
  */
  const active = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sources.filter((entry) => {
      if (needle.length > 0) {
        const haystack =
          `${entry.title} ${entry.slug} ${entry.country} ${entry.group ?? ''}`.toLowerCase();
        return haystack.includes(needle);
      }
      return showDone || WANTS(entry);
    });
  }, [sources, query, showDone]);

  const picked = useSelection(useMemo(() => active.map((e) => e.slug), [active]));

  if (!data) return <p className="empty">Reading the seed list…</p>;

  const done = sources.length - sources.filter(WANTS).length;

  const uncached = sources.filter((s) => !s.cached);

  return (
    <>
      <p className="lede">
        Which documents the pipeline reads. Picked on one criterion: subjects whose <em>name</em> is
        widely known but whose <em>detail</em> is not. That gap is where facts an educated reader
        does not already know actually live.
      </p>

      {error && <div className="problem error">{error}</div>}
      {note && <div className="problem warning">{note}</div>}

      <form className="card" onSubmit={add}>
        <label className="tiny faint" htmlFor="src-input">
          Any article URL, or a Wikipedia title
        </label>
        <input
          id="src-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://www.premiumtimesng.com/… or Nok culture"
          autoComplete="off"
          style={{ width: '100%', marginTop: 4 }}
        />

        <div className="sourceFields">
          <div>
            <label className="tiny faint" htmlFor="src-group">
              Why this one
            </label>
            <input
              id="src-group"
              type="text"
              list="src-groups"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="People"
              autoComplete="off"
            />
            <datalist id="src-groups">
              {groups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          {details && (
            <>
              <div>
                <label className="tiny faint" htmlFor="src-slug">
                  Slug — blank to derive
                </label>
                <input
                  id="src-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nok-culture"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="tiny faint" htmlFor="src-country">
                  Country — blank to reuse the last
                </label>
                <input
                  id="src-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="NG, GH, AFR…"
                  autoComplete="off"
                />
              </div>
            </>
          )}
        </div>

        <div className="spread" style={{ marginTop: 14 }}>
          <div className="row">
            <button type="submit" className="primary" disabled={busy || input.trim().length === 0}>
              {busy ? 'Adding…' : 'Add source'}
            </button>
            {uncached.length > 0 && (
              <button type="button" onClick={() => void runThrough()}>
                Run it through · {uncached.length} new
              </button>
            )}
          </div>
          <button type="button" className="tiny" onClick={() => setDetails(!details)}>
            {details ? 'Hide slug and country' : 'Set the slug or country'}
          </button>
        </div>
      </form>

      <FindArticles onAdd={(title, wanted) => submit(title, { wanted })} busy={busy} />

      {/*
        The count is the toggle.

        There used to be a "Show the 34 done" button beside a line that
        already said 34 done — two controls for one idea, when typing in
        the search box reaches the hidden ones anyway. The number itself
        opens them now.
      */}
      <div className="filters" style={{ margin: '18px 0 10px' }}>
        <span className="small muted">
          {query.trim().length > 0 ? (
            `${active.length} matching, searched across all ${sources.length}`
          ) : (
            <>
              {active.length} with something to do
              {done > 0 && (
                <>
                  {' · '}
                  <button className="asText" data-on={showDone} onClick={() => setShowDone(!showDone)}>
                    {showDone ? `hide the ${done} done` : `${done} done`}
                  </button>
                </>
              )}
            </>
          )}
        </span>
        <input
          type="search"
          className="searchBox"
          placeholder="Find a source"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
        <Link href="/" className="tiny">
          Back to the board
        </Link>
      </div>

      <SelectionBar
        count={picked.count}
        hidden={picked.hidden}
        allShown={picked.allShown}
        onToggleAll={picked.toggleAll}
        onClear={picked.clear}>
        <button
          className="bad"
          disabled={picked.count === 0}
          onClick={() => void removeMany(active.filter((e) => picked.has(e.slug)))}>
          Remove {picked.count || ''} from the list
        </button>
      </SelectionBar>

      {sources.length === 0 && <p className="empty">Nothing on the list yet. Add the first article.</p>}

      {sources.length > 0 && active.length === 0 && query.trim().length > 0 && (
        <p className="empty">Nothing on the seed list matches that.</p>
      )}

      {sources.length > 0 && active.length === 0 && query.trim().length === 0 && (
        <p className="empty">
          Nothing left to run. All {sources.length} sources are fetched and extracted — their facts
          are on <Link href="/review">review</Link>. Add another article to start new work.
        </p>
      )}

      {active.map((entry) => (
        <SourceRow
          key={entry.slug}
          entry={entry}
          picked={picked.has(entry.slug)}
          onPick={() => picked.toggle(entry.slug)}
          onRemove={remove}
          onRun={() => void runThrough([entry.slug])}
        />
      ))}

      {data.orphaned?.length > 0 && (
        <p className="tiny faint" style={{ marginTop: 16 }}>
          {data.orphaned.length} cached document(s) are not on this list — fetched under an earlier
          seed list. They still extract, which is why the cached count runs ahead of the source
          count: {data.orphaned.join(', ')}
        </p>
      )}
    </>
  );
}

function SourceRow({ entry, picked, onPick, onRemove, onRun }) {
  return (
    <div className="card sourceRow" data-picked={picked}>
      <div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <label className="pick">
            <input type="checkbox" checked={picked} onChange={onPick} />
          </label>
          {/*
            The title the document turned out to have, once it has been
            fetched. A web entry's stored title is only ever guessed from
            the URL slug — 'yemi osinbajo' for a piece actually headlined
            'Yemi Osinbajo | Profile | Africa Confidential' — and showing
            the guess after the real one is known helps nobody find it.
          */}
          <strong>{entry.resolvedTitle || entry.title}</strong>
          <span className="mono faint">{entry.slug}</span>
          <span className="pill">{entry.country}</span>
          {/*
            What kind of evidence this is, and therefore whether facts
            from it will trip the corroboration warning. Only shown when
            it is not the default — 'reference' is on most of the list and
            a pill on every row says nothing.
          */}
          {entry.tier && entry.tier !== 'reference' && (
            <span className="pill" title="Strong enough to carry a fact without a second source.">
              {entry.tier}
            </span>
          )}
          {entry.kind === 'web' && (
            <span
              className="pill"
              title="Fetched as HTML and reduced to text. Its locator is a content hash, not a revision id.">
              web
            </span>
          )}
          {entry.duplicateOf?.length > 0 && <span className="pill error">duplicate</span>}
          {entry.extracted ? (
            <span className="pill ok">done</span>
          ) : entry.cached ? (
            <span className="pill warn">ready to extract</span>
          ) : (
            <span className="pill warn">needs fetch</span>
          )}
        </div>
        {entry.landedOn && (
          <p className="tiny" style={{ margin: '6px 0 0', color: 'var(--warn)' }}>
            {entry.kind === 'web' ? (
              <>
                This redirected to <strong>{entry.landedOn}</strong>. Check it is the page you
                meant, not a section front or a sign-in wall.
              </>
            ) : (
              <>
                Wikipedia served <strong>{entry.landedOn}</strong> for this title. Check it is the
                article you meant, not a redirect or a disambiguation page.
              </>
            )}
          </p>
        )}
        {entry.duplicateOf?.length > 0 && (
          <p className="tiny" style={{ margin: '6px 0 0' }}>
            Same article as <span className="mono">{entry.duplicateOf.join(', ')}</span> — extract
            would read it twice. Remove one.
          </p>
        )}
        {/*
          What this document is being mined FOR, when it was added from a
          search. It reaches the extraction prompt, so it is not a note —
          it changes what comes back, and anything that changes the output
          has to be visible on the row that produces it.
        */}
        {entry.wanted && (
          <p className="tiny" style={{ margin: '6px 0 0' }}>
            Looking for: <em>{entry.wanted}</em>
          </p>
        )}
        {entry.group && <p className="tiny faint" style={{ margin: '6px 0 0' }}>{entry.group}</p>}
      </div>
      <div className="row" style={{ gap: 8 }}>
        {/*
          The whole chain for this one article. Named for what it gives
          you rather than for the stages it runs: which of fetch, extract
          and enrich still have work is the board's business, not a
          decision to put on the person who just added a link.
        */}
        <button onClick={onRun} title="Fetch, extract, enrich and publish just this article.">
          {entry.extracted ? 'Run again' : 'Run this one'}
        </button>
        <button className="bad" onClick={() => void onRemove(entry)}>
          Remove
        </button>
      </div>
    </div>
  );
}
