'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * The research agent.
 *
 * One question per run, by design. You press Run (with or without a
 * brief), the agent researches on its own, and it stops with a shortlist.
 * That shortlist is the only thing it ever asks you about: tick what to
 * keep, swap in an alternate if you like, press Develop. Everything after
 * that answer (deep dive, image, further reading, publishing) runs on its
 * own too.
 *
 * The shortlist is read from disk, not from the job, so a run waiting for
 * you survives a server restart and a closed tab.
 */

/** Briefs worth a click. The thinnest categories are added in front. */
const IDEAS = (name) => [
  `Inventors and firsts from ${name}`,
  `Founders of big companies in ${name}`,
  `Surprising stories from sport in ${name}`,
  `Women who changed the history of ${name}`,
];

/** A flag from the two letters of an ISO code, as the app does it. */
function flagFor(code) {
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const COUNTRY_KEY = 'agent.country';
const MODE_KEY = 'agent.mode';

const AGENT_STAGES = ['agent', 'agent-paste', 'agent-develop'];

export default function AgentPage() {
  const [data, setData] = useState(null);
  const [lines, setLines] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [brief, setBrief] = useState('');
  const [target, setTarget] = useState(5);
  const [country, setCountryState] = useState('NG');
  const [stopping, setStopping] = useState(false);
  const [mode, setModeState] = useState('research');
  const [pasteText, setPasteText] = useState('');

  const setMode = useCallback((next) => {
    setModeState(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still holds for this visit.
    }
  }, []);

  // Remembered per browser, so the studio reopens on the country you
  // were working through.
  const setCountry = useCallback((code) => {
    setCountryState(code);
    try {
      localStorage.setItem(COUNTRY_KEY, code);
    } catch {
      // Storage can be blocked; the choice still holds for this visit.
    }
  }, []);

  const apply = useCallback((next) => {
    setData(next);
    setBusy(next.busy ?? null);
    let saved = null;
    try {
      saved = localStorage.getItem(COUNTRY_KEY);
    } catch {
      // No storage: start on Nigeria.
    }
    if (saved && next.countries?.some((c) => c.code === saved)) setCountryState(saved);
    try {
      const savedMode = localStorage.getItem(MODE_KEY);
      if (savedMode === 'paste' || savedMode === 'research') setModeState(savedMode);
    } catch {
      // No storage: start on research.
    }
  }, []);

  const refresh = useCallback(
    () => fetch('/api/agent', { cache: 'no-store' }).then((r) => r.json()).then(apply),
    [apply],
  );

  useEffect(() => {
    let alive = true;
    fetch('/api/agent', { cache: 'no-store' })
      .then((r) => r.json())
      .then((next) => {
        if (alive) apply(next);
      });
    return () => {
      alive = false;
    };
  }, [apply]);

  // The shared job log. It replays the backlog on connect, so a reload
  // mid-run still shows what the agent has been doing.
  useEffect(() => {
    const source = new EventSource('/api/run/stream');
    source.addEventListener('start', (e) => {
      setBusy(JSON.parse(e.data).stage);
      setStopping(false);
      setLines([]);
    });
    source.addEventListener('line', (e) => setLines((prev) => [...prev, JSON.parse(e.data).line]));
    source.addEventListener('end', (e) => {
      const end = JSON.parse(e.data);
      setBusy(null);
      setStopping(false);
      if (end.state === 'failed') setError(end.error ?? `${end.stage} failed.`);
      void refresh();
    });
    return () => source.close();
  }, [refresh]);

  const post = useCallback(async (body) => {
    setError('');
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'That did not start.');
      return false;
    }
    setLines([]);
    return true;
  }, []);

  const stop = useCallback(async () => {
    setStopping(true);
    await fetch('/api/run/cancel', { method: 'POST' });
  }, []);

  if (!data) return <p className="empty">Reading the agent&apos;s runs…</p>;

  const runs = data.runs ?? [];
  const agentBusy = AGENT_STAGES.includes(busy);
  const otherBusy = Boolean(busy) && !agentBusy;
  const waiting = runs.find((r) => r.status === 'awaiting');
  const past = runs.filter((r) => r !== waiting && r.status !== 'developing');
  const published = runs.reduce((n, r) => n + (r.published?.length ?? 0), 0);
  const countryName = (code) => data.countries.find((c) => c.code === code)?.name ?? code;
  const liveHere = data.live.byCountry[country] ?? { total: 0, byCategory: {} };

  return (
    <>
      <p className="lede">
        The agent picks subjects, reads documents and keeps only what the judge rates strong, one
        fact per subject and nothing the app already has. It asks you one thing: which facts to
        publish.
      </p>

      {data.hasApiKey === false && (
        <div className="problem error" style={{ marginBottom: 18 }}>
          No DEEPSEEK_API_KEY in <span className="mono">afrifacts-studio/.env</span>. The agent
          cannot run without it.
        </div>
      )}
      {error && (
        <div className="problem error" style={{ marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div className="board agentBoard">
        <LiveTile live={liveHere} country={country} name={countryName(country)} all={data.live.total} />
        <div className="stage">
          <h3>Reserve</h3>
          <div>
            <span className="count">{data.reserve.length}</span>{' '}
            <span className="unit">strong facts set aside</span>
          </div>
          <div className="detail">
            Facts the judge liked but a run could not keep, usually for variety. They come back as
            alternates.
          </div>
        </div>
        <div className="stage">
          <h3>The agent so far</h3>
          <div>
            <span className="count">{published}</span> <span className="unit">facts published</span>
          </div>
          <div className="detail">
            From {runs.length} run{runs.length === 1 ? '' : 's'}. Each run costs up to{' '}
            {data.budget.docs} documents and {data.budget.webQueries} paid web searches.
          </div>
        </div>
      </div>

      {agentBusy ? (
        <Progress
          lines={lines}
          stage={busy}
          target={target}
          budget={data.budget}
          stopping={stopping}
          onStop={() => void stop()}
        />
      ) : waiting ? (
        <Shortlist
          run={waiting}
          name={countryName(waiting.country ?? 'NG')}
          busy={Boolean(busy)}
          onDevelop={(keys) => post({ action: 'develop', runId: waiting.runId, keys })}
        />
      ) : (
        <>
          <div className="modeTabs" role="tablist">
            {[
              ['research', 'Research', 'The agent finds facts itself'],
              ['paste', 'Paste facts', 'Check facts you found'],
            ].map(([key, label, hint]) => (
              <button key={key} role="tab" aria-selected={mode === key} data-on={mode === key} onClick={() => setMode(key)}>
                {label}
                <span className="tiny faint">{hint}</span>
              </button>
            ))}
          </div>
          {mode === 'paste' ? (
            <PasteBox
              text={pasteText}
              setText={setPasteText}
              max={data.maxPaste}
              country={country}
              setCountry={setCountry}
              countries={data.countries}
              disabled={Boolean(busy) || data.hasApiKey === false}
              busyNote={otherBusy ? `'${busy}' is running. One job at a time.` : ''}
              onRun={async () => {
                if (await post({ action: 'paste', text: pasteText, country })) setPasteText('');
              }}
            />
          ) : (
        <Composer
          brief={brief}
          setBrief={setBrief}
          target={target}
          setTarget={setTarget}
          live={liveHere}
          country={country}
          setCountry={setCountry}
          countries={data.countries}
          disabled={Boolean(busy) || data.hasApiKey === false}
          busyNote={otherBusy ? `'${busy}' is running. One job at a time.` : ''}
          onRun={() => void post({ action: 'find', brief, country, target })}
        />
          )}
        </>
      )}

      {data.reserve.length > 0 && (
        <details className="card fold">
          <summary>
            <strong>Reserve</strong>{' '}
            <span className="small muted">({data.reserve.length}) strong facts waiting for a later run</span>
          </summary>
          <div className="foldBody">
            {data.reserve.map((r, i) => (
              <div key={i} className="miniFact">
                <span className={`pill cat-${r.category}`}>{r.category}</span>
                <span className="serif">{r.fact}</span>
                {r.why && <span className="tiny faint">{r.why}</span>}
              </div>
            ))}
          </div>
        </details>
      )}

      {past.length > 0 && (
        <>
          <h3 className="sectionHead">Past runs</h3>
          {past.slice(0, 15).map((r) => (
            <PastRun key={r.runId} run={r} name={countryName(r.country ?? 'NG')} />
          ))}
        </>
      )}
    </>
  );
}

/** Facts in the app per category, thinnest marked, so a brief can aim at the gap. */
function LiveTile({ live, country, name, all }) {
  const entries = Object.entries(live.byCategory).sort((a, b) => b[1] - a[1]);
  const most = Math.max(1, ...entries.map(([, n]) => n));
  const thinnest = Math.min(...entries.map(([, n]) => n));
  return (
    <div className="stage">
      <h3>
        {flagFor(country)} {name} in the app
      </h3>
      <div>
        <span className="count">{live.total}</span>{' '}
        <span className="unit">
          live facts, of {all} across the app
        </span>
      </div>
      <div className="bars">
        {entries.map(([cat, n]) => (
          <div key={cat} className="bar" title={`${cat}: ${n}`}>
            <span className={`tiny cat-${cat}`}>{cat}</span>
            <span className="track">
              <span className="fill" style={{ width: `${(n / most) * 100}%` }} />
            </span>
            <span className={`tiny ${n === thinnest ? 'warnText' : 'faint'}`}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Composer({ brief, setBrief, target, setTarget, live, country, setCountry, countries, disabled, busyNote, onRun }) {
  const name = countries.find((c) => c.code === country)?.name ?? country;
  const thin = Object.entries(live.byCategory)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([cat]) => `${cat} facts about ${name}`);
  return (
    <div className="card composer">
      <strong>Start a run</strong>
      <div className="row" style={{ flexWrap: 'wrap', marginTop: 10 }}>
        <select
          aria-label="Country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setBrief('');
          }}
          disabled={disabled}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {flagFor(c.code)} {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="What should it look for? Leave empty and it chooses."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) onRun();
          }}
          disabled={disabled}
          style={{ flex: '1 1 320px' }}
        />
        <label className="small muted row" style={{ gap: 6 }}>
          Facts
          <select value={target} onChange={(e) => setTarget(Number(e.target.value))} disabled={disabled}>
            {[3, 4, 5, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button className="primary big" disabled={disabled} title={busyNote || undefined} onClick={onRun}>
          Run the agent
        </button>
      </div>
      <div className="chips">
        {[...thin, ...IDEAS(name)].map((idea) => (
          <button
            key={idea}
            type="button"
            className="chip"
            data-on={brief === idea}
            disabled={disabled}
            onClick={() => setBrief(brief === idea ? '' : idea)}>
            {idea}
          </button>
        ))}
      </div>
      <p className="tiny faint" style={{ margin: '10px 0 0' }}>
        {busyNote ||
          'A run takes 5 to 15 minutes. You can close this tab; the shortlist waits here for you.'}
      </p>
    </div>
  );
}

/**
 * Paste mode. No count to choose: the agent reads the paste and decides
 * how many separate facts are in it.
 */
function PasteBox({ text, setText, max, country, setCountry, countries, disabled, busyNote, onRun }) {
  const over = text.length > max;
  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const reading = images.some((i) => i.status === 'reading');

  // Each image is read in turn and its text added to the box, so what
  // gets checked is always what you can see and correct.
  const addImages = useCallback(
    (files) => {
      const fresh = files
        .filter((f) => f && f.type.startsWith('image/'))
        .map((file, i) => ({
          id: `${Date.now()}-${i}`,
          file,
          url: URL.createObjectURL(file),
          status: 'reading',
          note: '',
        }));
      if (fresh.length === 0) return;
      setImages((prev) => [...prev, ...fresh]);
      const update = (id, patch) => setImages((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      void (async () => {
        const { readImage } = await import('./ocr.js');
        for (const img of fresh) {
          try {
            const got = await readImage(img.file);
            if (got.length < 15) {
              update(img.id, { status: 'failed', note: 'No readable text' });
              continue;
            }
            setText((prev) => `${prev.trim()}\n\n${got}`.trim());
            update(img.id, { status: 'done', note: `${got.split('\n').length} lines added` });
          } catch (error) {
            update(img.id, { status: 'failed', note: error instanceof Error ? error.message : 'Could not read' });
          }
        }
      })();
    },
    [setText],
  );

  const removeImage = (id) =>
    setImages((prev) => {
      const gone = prev.find((x) => x.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((x) => x.id !== id);
    });

  const onPaste = (e) => {
    const files = [...(e.clipboardData?.items ?? [])]
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile());
    if (files.length === 0) return;
    // An image-only paste would otherwise insert nothing, or a file name.
    if (!e.clipboardData.types.includes('text/plain')) e.preventDefault();
    addImages(files);
  };

  return (
    <div
      className="card composer"
      data-dragging={dragging}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        setDragging(false);
        if (disabled) return;
        e.preventDefault();
        addImages([...(e.dataTransfer?.files ?? [])]);
      }}>
      <strong>Paste facts you found</strong>
      <p className="small muted" style={{ margin: '4px 0 10px' }}>
        As many as you like, in any shape: a numbered list, posts copied from social media, a
        paragraph, or screenshots (paste them, drop them here, or add them below). The agent works
        out how many separate facts there are, finds a source for each, and shows you the ones it
        could verify.
      </p>
      <textarea
        className="pasteArea"
        placeholder={'1. Fela Kuti once ran for president of Nigeria...\n2. ...\n\nOr paste a screenshot.'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={onPaste}
        disabled={disabled}
        rows={12}
      />
      <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()}>
          Add images
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addImages([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
        {images.map((img) => (
          <span key={img.id} className="imgChip" data-status={img.status} title={img.note}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a local blob preview, not a page image */}
            <img src={img.url} alt="" />
            <span className="tiny">
              {img.status === 'reading' ? 'Reading…' : img.status === 'done' ? img.note : img.note || 'Failed'}
            </span>
            {img.status !== 'reading' && (
              <button type="button" className="asText tiny" aria-label="Remove" onClick={() => removeImage(img.id)}>
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="spread" style={{ marginTop: 10 }}>
        <label className="small muted row" style={{ gap: 6 }}>
          If a fact&apos;s country is unclear, use
          <select aria-label="Default country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={disabled}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {flagFor(c.code)} {c.name}
              </option>
            ))}
          </select>
        </label>
        <span className="row" style={{ gap: 10 }}>
          <span className={`tiny ${over ? 'warnText' : 'faint'}`}>
            {text.length.toLocaleString()} / {max.toLocaleString()} characters
          </span>
          <button
            className="primary big"
            disabled={disabled || over || reading || text.trim().length < 20}
            title={reading ? 'Still reading an image.' : undefined}
            onClick={onRun}>
            {reading ? 'Reading images…' : 'Check these facts'}
          </button>
        </span>
      </div>
      <p className="tiny faint" style={{ margin: '10px 0 0' }}>
        {busyNote ||
          'Wikipedia is checked first, for free; the web is tried for what it cannot confirm, up to 8 paid searches per paste. About a minute per fact.'}
      </p>
    </div>
  );
}

const CLAIM = /^\[(\d+)\/(\d+)\] (verified|corrected|not confirmed|in the app): (.*)$/;

/** A paste run's log, read: one result per claim. */
function readPasteLog(lines) {
  let total = 0;
  const results = [];
  for (const line of lines) {
    const found = /^Found (\d+) facts?/.exec(line);
    if (found) total = Number(found[1]);
    const m = CLAIM.exec(line);
    if (m) {
      total = Number(m[2]);
      results.push({ n: Number(m[1]), status: m[3], text: m[4] });
    }
  }
  const count = (st) => results.filter((r) => r.status === st).length;
  return { total, results, verified: count('verified'), corrected: count('corrected'), missed: count('not confirmed') + count('in the app') };
}

const STEP = /^\[(\d+)\] (.*)$/;
const KEPT = /^kept (\d+), set aside (\d+) for variety, (\d+) weak \(total (\d+)\/(\d+)\)/;

/**
 * The log, read. Research lines become counters, the latest thought and
 * a list of steps; development lines become a checklist. The raw log is
 * one click away for when something looks wrong.
 */
function readLog(lines) {
  const steps = [];
  let thought = '';
  let strong = 0;
  let goal = 0;
  let docs = 0;
  let searches = 0;
  for (const line of lines) {
    const m = STEP.exec(line);
    if (!m) continue;
    const text = m[2];
    const kept = KEPT.exec(text);
    if (kept) {
      docs += 1;
      strong = Number(kept[4]);
      goal = Number(kept[5]);
      const last = steps[steps.length - 1];
      if (last?.kind === 'read') last.result = `${kept[1]} kept, ${kept[2]} set aside, ${kept[3]} weak`;
      if (last?.kind === 'read') last.good = Number(kept[1]) > 0;
    } else if (text.startsWith('search ')) {
      searches += 1;
      steps.push({ kind: 'search', text: text.slice(7) });
    } else if (text.startsWith('read ')) {
      steps.push({ kind: 'read', text: text.slice(5).replace(/^r\d+ /, '') });
    } else {
      thought = text;
    }
  }
  return { steps, thought, strong, goal, docs, searches };
}

const DEVELOP_PHASES = [
  { match: 'Developing', label: 'Deep dive, quiz and citation' },
  { match: 'Finding headline images', label: 'Headline images' },
  { match: 'Finding further reading', label: 'Further reading' },
  { match: 'Publishing to the app', label: 'Publishing to the app' },
];

function Progress({ lines, stage, target, budget, stopping, onStop }) {
  const logRef = useRef(null);
  const read = useMemo(() => readLog(lines), [lines]);
  const pasted = useMemo(() => readPasteLog(lines), [lines]);
  const researching = stage === 'agent';
  const checking = stage === 'agent-paste';
  const finished = lines.some((l) => / developed( and live)?:/.test(l));
  const reached = DEVELOP_PHASES.reduce(
    (at, p, i) => (lines.some((l) => l.startsWith(p.match)) ? i : at),
    -1,
  );

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="card progress">
      <div className="spread">
        <strong>{researching ? 'Researching' : checking ? 'Checking your facts' : 'Developing and publishing'}…</strong>
        <button className="bad" onClick={onStop} disabled={stopping}>
          {stopping ? 'Stopping…' : 'Stop'}
        </button>
      </div>

      {checking ? (
        <>
          <div className="meters">
            <Meter label="Checked" value={pasted.results.length} of={pasted.total || undefined} />
            <Meter label="Verified" value={pasted.verified} />
            <Meter label="Corrected by the source" value={pasted.corrected} />
            <Meter label="Not usable" value={pasted.missed} />
          </div>
          {pasted.total === 0 && <p className="thought">Reading what you pasted and counting the facts…</p>}
          {pasted.results.length > 0 && (
            <ol className="steps">
              {[...pasted.results].sort((a, b) => a.n - b.n).map((r) => (
                <li key={r.n} data-good={r.status === 'verified' || r.status === 'corrected'}>
                  <span className="tiny faint">
                    {r.n}. {r.status}
                  </span>{' '}
                  <span className="small">{r.text}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : researching ? (
        <>
          <div className="meters">
            <Meter label="Strong facts" value={read.strong} of={read.goal || target} />
            <Meter label="Documents read" value={read.docs} of={budget.docs} />
            <Meter label="Searches" value={read.searches} />
          </div>
          {read.thought && (
            <p className="thought">
              <span className="tiny faint">Thinking</span>
              <br />
              {read.thought}
            </p>
          )}
          {read.steps.length > 0 && (
            <ol className="steps">
              {read.steps.map((s, i) => (
                <li key={i} data-kind={s.kind} data-good={s.good}>
                  <span className="tiny faint">{s.kind === 'search' ? 'Searched' : 'Read'}</span>{' '}
                  <span className="small">{s.text}</span>
                  {s.result && <span className="tiny muted"> · {s.result}</span>}
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <ol className="checklist">
          {DEVELOP_PHASES.map((p, i) => (
            <li key={p.match} data-state={finished || i < reached ? 'done' : i === reached ? 'now' : 'todo'}>
              {p.label}
            </li>
          ))}
        </ol>
      )}

      <details className="fold" style={{ marginTop: 12 }}>
        <summary className="tiny muted">Full log ({lines.length} lines)</summary>
        <div className="log" ref={logRef} style={{ marginTop: 8, marginBottom: 0 }}>
          {lines.length === 0 ? 'Starting…' : null}
          {lines.map((line, i) => (
            <div key={i} className={line.startsWith('x ') || line.includes('FAILED') ? 'fail' : ''}>
              {line}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function Meter({ label, value, of }) {
  return (
    <div className="meter">
      <span className="tiny faint">{label}</span>
      <span className="serif meterValue">
        {value}
        {of ? <span className="faint"> / {of}</span> : null}
      </span>
      {of ? (
        <span className="track">
          <span className="fill" style={{ width: `${Math.min(100, (value / of) * 100)}%` }} />
        </span>
      ) : null}
    </div>
  );
}

/**
 * The one question.
 *
 * Shortlisted facts start ticked and alternates start unticked, so doing
 * nothing but pressing Develop means "yes to what you found". What you
 * untick from the shortlist becomes a 'weak' label for the judge.
 */
function Shortlist({ run, name, busy, onDevelop }) {
  const paste = run.kind === 'paste';
  const [keep, setKeep] = useState(() => new Set(run.shortlist.map((p) => p.key)));
  const toggle = (key) =>
    setKeep((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const rejectAll = () => {
    if (window.confirm('Publish none of these? They are recorded as weak so the judge learns.')) {
      void onDevelop([]);
    }
  };

  return (
    <div className="shortlist">
      <div className="spread" style={{ marginBottom: 12 }}>
        <div>
          <strong className="serif" style={{ fontSize: 20 }}>
            {paste
              ? `${run.shortlist.length} of ${run.target} pasted facts verified. Which should go live?`
              : `${run.shortlist.length} fact${run.shortlist.length === 1 ? '' : 's'} found. Which should go live?`}
          </strong>
          <div className="tiny faint">
            {paste ? '' : `${flagFor(run.country ?? 'NG')} ${name}. `}
            {paste ? '' : run.brief ? `Brief: "${run.brief}". ` : 'Open brief. '}
            {run.docsRead} documents read, {run.webQueriesSpent} web searches.
          </div>
        </div>
      </div>

      {run.shortlist.map((p) => (
        <PickRow key={p.key} pick={p} on={keep.has(p.key)} onToggle={() => toggle(p.key)} />
      ))}

      {run.alternates.length > 0 && (
        <details className="fold" style={{ margin: '6px 0 14px' }} open={paste}>
          <summary className="small muted">
            {paste
              ? `${run.alternates.length} corrected by the source: the source says something different from what you pasted. Tick one to publish the source's version.`
              : `${run.alternates.length} alternate${run.alternates.length === 1 ? '' : 's'}: also strong, set aside for variety. Tick one to swap it in.`}
          </summary>
          <div style={{ marginTop: 10 }}>
            {run.alternates.map((p) => (
              <PickRow key={p.key} pick={p} on={keep.has(p.key)} onToggle={() => toggle(p.key)} />
            ))}
          </div>
        </details>
      )}

      {paste && run.unverified?.length > 0 && (
        <details className="card fold" style={{ margin: '6px 0 14px' }}>
          <summary className="small muted">
            {run.unverified.length} not usable: no source confirmed them, or the app already has them
          </summary>
          <div className="foldBody">
            {run.unverified.map((u) => (
              <div key={u.n} className="miniFact">
                <span className={`pill ${u.status === 'in the app' ? '' : 'warn'}`}>{u.status}</span>
                <span className="serif">{u.claim}</span>
                <span className="tiny faint">{u.why}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="decideBar">
        <span className="small muted">
          {keep.size} selected. Developing writes the deep dive and quiz, finds an image and further
          reading, then publishes.
        </span>
        <span className="row" style={{ gap: 8 }}>
          <button disabled={busy} onClick={rejectAll}>
            None of these
          </button>
          <button className="primary big" disabled={busy || keep.size === 0} onClick={() => void onDevelop([...keep])}>
            Develop and publish {keep.size}
          </button>
        </span>
      </div>
    </div>
  );
}

function PickRow({ pick, on, onToggle }) {
  return (
    <label className="card pickCard" data-picked={on}>
      <input type="checkbox" checked={on} onChange={onToggle} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="factText" style={{ display: 'block', marginBottom: 8 }}>
          {pick.fact}
        </span>
        <span className="row tiny" style={{ flexWrap: 'wrap', gap: 8 }}>
          <span className={`pill cat-${pick.category}`}>{pick.category}</span>
          {pick.votes && <span className="pill ok">{pick.votes.replace('/', ' of ')} readers</span>}
          {pick.url ? (
            <a href={pick.url} target="_blank" rel="noreferrer" className="muted" onClick={(e) => e.stopPropagation()}>
              {pick.title}
            </a>
          ) : (
            <span className="muted">{pick.title}</span>
          )}
          <span className="faint">{pick.fact.length}/200</span>
        </span>
        {pick.why && <span className="tiny muted readerWhy">&ldquo;{pick.why}&rdquo;</span>}
        {pick.claim && !pick.aside && <span className="tiny faint readerWhy">You pasted: &ldquo;{pick.claim}&rdquo;</span>}
        {pick.echoes && <span className="tiny warnText readerWhy">{pick.echoes}</span>}
        {pick.aside && (
          <span className="tiny faint readerWhy">{pick.claim ? pick.aside : `Set aside: ${pick.aside}`}</span>
        )}
      </span>
    </label>
  );
}

const STATUS = {
  done: { text: 'published', tone: 'ok' },
  empty: { text: 'nothing strong', tone: '' },
  failed: { text: 'stopped', tone: 'error' },
};

function PastRun({ run, name }) {
  const when = new Date(run.createdAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const status = STATUS[run.status] ?? { text: run.status, tone: '' };
  const facts = run.published ?? [];
  return (
    <details className="card fold pastRun">
      <summary>
        <span className="small">
          <span title={name}>{flagFor(run.country ?? 'NG')}</span>{' '}
          {run.brief ? `"${run.brief}"` : `Open brief on ${name}`} <span className="faint">· {when}</span>
        </span>
        <span className="row" style={{ gap: 8 }}>
          {facts.length > 0 && <span className="tiny muted">{facts.length} live</span>}
          <span className={`pill ${status.tone}`}>{status.text}</span>
        </span>
      </summary>
      <div className="foldBody">
        <p className="tiny faint" style={{ margin: '0 0 8px' }}>
          {run.docsRead} documents, {run.webQueriesSpent} web searches, {run.shortlist.length}{' '}
          shortlisted. {run.error ?? run.stopReason}
        </p>
        {facts.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>
            Nothing from this run is in the app.
          </p>
        ) : (
          <>
            {facts.map((f) => (
              <div key={f.id} className="miniFact">
                <span className={`pill cat-${f.category}`}>{f.category}</span>
                <span className="serif">{f.fact}</span>
                <span className="tiny faint mono">{f.id}</span>
              </div>
            ))}
            <Link href="/review" className="small muted">
              Open in Review
            </Link>
          </>
        )}
      </div>
    </details>
  );
}
