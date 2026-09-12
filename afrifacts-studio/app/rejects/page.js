'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CATEGORIES } from '@/lib/types/fact.js';

/**
 * What the verifier threw out, and why.
 *
 * The file behind this page has been written since the pipeline's first
 * run and shown nowhere. Keeping rejects was deliberate — an over-harsh
 * filter and a country short of surprising facts produce the identical
 * empty screen, and only the reasons tell them apart — but a record
 * nobody can read does not settle that argument either.
 *
 * The editor is the other half. Most rejects fail on a detail the passage
 * does not carry, which is a rewrite rather than a rerun, and the rewrite
 * is checked by the same function that did the rejecting. There is no
 * override button anywhere on this page, on purpose.
 */
export default function RejectsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openKey, setOpenKey] = useState('');

  const load = useCallback(() => {
    fetch('/api/rejects')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('Could not read the rejects file.'));
  }, []);

  // Wrapped rather than passed straight in: `load` returns the fetch
  // promise, and an effect that returns anything but a cleanup function
  // is a React warning.
  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="problem">{error}</p>;
  if (!data) return <p className="muted">Reading…</p>;

  if (data.total === 0) {
    return (
      <div className="empty">
        <p>Nothing has been rejected.</p>
        <p className="muted small">
          Either the extractor is behaving or nothing has been run. Both look like this.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="lede">
        <strong>{data.total}</strong> claims the verifier refused, across {data.articles.length}{' '}
        articles. Each was written by the model and thrown out because the quoted passage did not
        support it. Fix the wording and it can go back in the queue.
      </p>

      {data.articles.map((article) => (
        <section key={article.slug} className="card">
          <h2>
            {article.title} <span className="faint small">· {article.rows.length}</span>
          </h2>
          {article.rows.map((row) => (
            <Reject
              key={row.key}
              row={row}
              open={openKey === row.key}
              onToggle={() => setOpenKey(openKey === row.key ? '' : row.key)}
              onKept={load}
            />
          ))}
        </section>
      ))}
    </>
  );
}

function Reject({ row, open, onToggle, onKept }) {
  const [text, setText] = useState(row.fact);
  const [category, setCategory] = useState(row.category ?? 'History');
  const [verdict, setVerdict] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');

  const dirty = text.trim() !== row.fact.trim();

  /*
    The words the passage does not contain, highlighted as you type.

    The same comparison the verifier makes, done in the browser so the
    writer can see the offending word rather than read a sentence about
    it. It is a hint and never the verdict — the server re-runs the real
    check, because a rule enforced only in a text box is not a rule.
  */
  const marked = useMemo(() => {
    const inPassage = new Set(
      row.passage
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean),
    );
    return text.split(/(\s+)/).map((word) => {
      const bare = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
      return { word, ok: bare.length < 3 || inPassage.has(bare) };
    });
  }, [text, row.passage]);

  const send = async (keep) => {
    setBusy(true);
    setFailed('');
    try {
      const res = await fetch('/api/rejects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: row.key, fact: text, category, keep }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFailed(json.error ?? 'That did not work.');
      } else if (json.kept) {
        onKept();
      } else {
        setVerdict(json);
      }
    } catch {
      setFailed('The studio did not answer.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="row">
      <button type="button" className="pick" onClick={onToggle}>
        <span className="factText">{row.fact}</span>
      </button>

      <ul className="small problem">
        {(row.reasons ?? []).map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>

      {open && (
        <>
          <p className="passage">{row.passage}</p>

          <p className="tiny muted">
            Highlighted words are not in the passage. Short words are ignored, as the verifier
            ignores them.
          </p>
          <p className="factText">
            {marked.map((part, i) =>
              part.ok ? <span key={i}>{part.word}</span> : <mark key={i}>{part.word}</mark>,
            )}
          </p>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setVerdict(null);
            }}
            rows={3}
          />

          <div className="spread">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <span>
              <button type="button" disabled={busy} onClick={() => send(false)}>
                Check again
              </button>{' '}
              <button
                type="button"
                disabled={busy || !verdict?.ok}
                title={verdict?.ok ? '' : 'Check it first, and it has to pass.'}
                onClick={() => send(true)}>
                Keep it
              </button>
            </span>
          </div>

          {failed && <p className="problem small">{failed}</p>}

          {verdict && !failed && (
            <div className="small">
              {verdict.ok ? (
                <p className="chosen">
                  Passes.{' '}
                  {dirty
                    ? 'Keep it and it joins the candidates.'
                    : 'Unchanged, which is odd — it failed before.'}
                </p>
              ) : (
                <ul className="problem">
                  {verdict.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
