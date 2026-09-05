'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The pipeline, as a board.
 *
 * Every stage shows what is actually on disk, so this is honest across a
 * restart: a run that finished before the server reloaded still shows its
 * output. That ordering used to be knowledge in one person's head.
 *
 * There is one button. The four automatic stages have exactly one order,
 * nothing ever chooses between them, and pressing them one at a time with
 * a wait between each made you the scheduler for a decision with a single
 * answer. Run it through does the lot and ends with export, so the app is
 * holding what the run produced rather than being one more card to notice.
 *
 * The per-stage Runs are still there, small, for the times you want only
 * one. What is deliberately NOT here is redoing finished work: it is the
 * one action that spends money to produce nothing new, and a button for it
 * sat next to every Run being read as the safe one. The scripts still take
 * `--force`; a terminal is a fair price for an operation whose whole
 * purpose is repetition.
 *
 * A Run says how much work it will do and refuses when the answer is none.
 * Extract used to take every cached document whether or not it had already
 * been through the model — 46 documents at full price to rediscover 137
 * candidates that were already sitting in triage — and the only way to
 * find that out was the bill.
 */
export default function PipelinePage() {
  const [status, setStatus] = useState(null);
  const [lines, setLines] = useState([]);
  const [running, setRunning] = useState(null);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const data = await res.json();
    setStatus(data);
    setRunning(data.current?.stage ?? null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // One SSE connection for the life of the page. It replays the backlog
  // on connect, so reloading mid-run does not lose the log.
  useEffect(() => {
    const source = new EventSource('/api/run/stream');

    source.addEventListener('start', (e) => {
      const data = JSON.parse(e.data);
      setRunning(data.stage);
      setStopping(false);
      setLines([]);
    });
    source.addEventListener('line', (e) => {
      setLines((prev) => [...prev, JSON.parse(e.data).line]);
    });
    source.addEventListener('end', (e) => {
      const data = JSON.parse(e.data);
      setRunning(null);
      setStopping(false);
      setLines((prev) => [
        ...prev,
        data.state === 'failed' ? `— ${data.stage} failed` : `— ${data.stage} finished`,
      ]);
      void refresh();
    });

    return () => source.close();
  }, [refresh]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const run = useCallback(async (stage, extra = {}) => {
    setError('');
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, ...extra }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Could not start that stage.');
      return;
    }
    setRunning(stage);
    setStopping(false);
    setLines([]);
  }, []);

  const stop = useCallback(async () => {
    setStopping(true);
    const res = await fetch('/api/run/cancel', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Could not stop the run.');
      setStopping(false);
    }
  }, []);

  if (!status) return <p className="empty">Reading the pipeline…</p>;

  const busy = running !== null;

  /*
    Which stage the chain is on.

    The run is one job, so `running` says 'all' and nothing else — which
    would leave five cards sitting still for twenty minutes with no sign
    of where the work is. The chain announces each stage into the log as
    it starts it, and the last such line is the answer. Reading it back
    out beats threading a second event type through the job runner for
    something the log already says.
  */
  const chainStage =
    running === 'all'
      ? (lines.filter((l) => /^— \w+ —$/.test(l)).pop() ?? '').replace(/—/g, '').trim() || null
      : null;

  /*
    What one press would actually do, right now.

    Only the stages that have something to do and are not waiting on the
    one before them. The numbers under-report on purpose: fetching three
    articles gives extract three documents it cannot see yet, so this is
    the work in hand rather than a forecast, and the caption says so.
  */
  const waiting = status.stages.filter((s) => s.kind === 'auto' && !s.blocked && s.count > 0);
  const nothingWaiting = waiting.length === 0;

  return (
    <>
      <p className="lede">
        You pick the sources at the front and judge the facts at the end. Everything between is one
        button: fetch, extract, enrich, match pictures, publish — each doing only what is left
        undone, and what comes out the far end is live in the app.
      </p>

      {!status.hasApiKey && (
        <div className="problem error" style={{ marginBottom: 18 }}>
          No DEEPSEEK_API_KEY in <span className="mono">afrifacts-studio/.env</span>. Extract,
          enrich and images cannot run without it.
        </div>
      )}

      {error && (
        <div className="problem error" style={{ marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div className="runbar">
        <div className="row">
          <button
            className="primary big"
            disabled={busy || nothingWaiting || !status.hasApiKey}
            title={
              !status.hasApiKey
                ? 'Needs an API key'
                : nothingWaiting
                  ? 'Every stage is up to date. Add a source to start new work.'
                  : undefined
            }
            onClick={() => void run('all')}>
            {running === 'all' ? `Running ${chainStage ?? ''}…` : 'Run it through'}
          </button>
          {busy && (
            <button className="bad" onClick={() => void stop()} disabled={stopping}>
              {stopping ? 'Stopping…' : running === 'all' ? 'Stop the run' : `Stop ${running}`}
            </button>
          )}
        </div>
        <p className="tiny faint" style={{ margin: 0 }}>
          {busy ? (
            'Stop finishes the document in flight, keeps it, and skips the rest.'
          ) : nothingWaiting ? (
            <>
              Nothing waiting. Add an article on <Link href="/sources">sources</Link> to start new
              work.
            </>
          ) : (
            <>
              Now: {waiting.map((s) => `${s.count} to ${s.name.toLowerCase()}`).join(', ')}. The
              later counts grow as the earlier stages feed them. Extract, enrich and images cost.
            </>
          )}
        </p>
      </div>

      <div className="board">
        {status.stages.map((stage) => (
          <Stage
            key={stage.key}
            stage={stage}
            running={chainStage ?? running}
            busy={busy}
            hasKey={status.hasApiKey}
            onRun={run}
          />
        ))}
      </div>

      {(lines.length > 0 || busy) && (
        <div className="log" ref={logRef}>
          {lines.length === 0 ? `${running} starting…` : null}
          {lines.map((line, i) => (
            <div key={i} className={line.startsWith('x ') || line.includes('FAILED') ? 'fail' : ''}>
              {line}
            </div>
          ))}
        </div>
      )}

      <AppLine app={status.app} busy={busy} onRun={run} />
    </>
  );
}

/**
 * What the app is holding.
 *
 * Two stage cards used to say this. Review's only action was a link to a
 * page already in the nav, and Export's count could never be a count —
 * it rewrites the whole file every time, so the only honest question is
 * whether the app is behind your decisions, and that is a sentence.
 */
function AppLine({ app, busy, onRun }) {
  if (!app) return null;

  return (
    <div className="spread appline">
      <span className="small muted">
        <strong>{app.live}</strong> {app.live === 1 ? 'fact' : 'facts'} in the app
        {app.at ? ` · pushed ${new Date(app.at).toLocaleString()}` : ' · never pushed'}
        {app.queued > 0 ? ` · ${app.queued} held back` : ''}
        {app.blocked > 0 ? (
          <>
            {' · '}
            <Link href="/review">
              {app.blocked} blocked, {app.blocked === 1 ? 'it cannot' : 'they cannot'} ship
            </Link>
          </>
        ) : (
          ''
        )}
      </span>
      <div className="row">
        {/*
          Always offered, not only when stale.

          Every review decision pushes behind itself, so `stale` is
          normally false and the button was normally absent — which left
          no way to push after the one case that matters, a push that
          failed because the network was down. A free, idempotent action
          does not need to be hidden to stop people pressing it.
        */}
        <button
          className={app.stale ? 'primary' : ''}
          disabled={busy}
          title={
            app.stale
              ? 'A decision has changed since the last push.'
              : 'Send the corpus to Supabase again. Free, and safe to repeat.'
          }
          onClick={() => void onRun('push')}>
          {app.stale ? 'Push now' : 'Push to Supabase'}
        </button>
        <button disabled={busy} onClick={() => void onRun('check')}>
          Run check
        </button>
      </div>
    </div>
  );
}

function Stage({ stage, running, busy, hasKey, onRun }) {
  const isRunning = running === stage.key;
  const needsKey = stage.costs && !hasKey;

  /*
    One idea, not three. `count` is work left, so a zero means settled —
    which used to be spelled three separate ways: `settled` for the look,
    `nothingToDo` for the button, and a `pending` that held the same
    number as `count` in every stage that had one.

    A settled stage goes quiet: no big number, and the total it already
    holds drops to small type underneath. The finished figures are not
    removed, they are demoted. "Nothing to do" is only reassuring when it
    says what it already has; on its own it reads like an empty database.
  */
  const settled = !stage.blocked && stage.count === 0;

  return (
    <div className="stage" data-kind={stage.kind} data-blocked={stage.blocked} data-settled={settled}>
      <h3>{stage.name}</h3>
      {settled ? (
        <div className="settled">Nothing to do</div>
      ) : (
        <div>
          <span className="count">{stage.count ?? '—'}</span>{' '}
          <span className="unit">{stage.unit}</span>
        </div>
      )}
      {stage.done && <p className="tiny faint doneLine">{stage.done}</p>}
      <p className="detail">{stage.blocked ? stage.blockedWhy : stage.detail}</p>

      <div className="actions">
        {stage.kind === 'human' ? (
          <Link href={stage.href}>
            <button disabled={stage.blocked}>Open</button>
          </Link>
        ) : (
          <button
            className="tiny"
            disabled={busy || stage.blocked || needsKey || settled}
            onClick={() => void onRun(stage.key)}
            title={
              needsKey
                ? 'Needs an API key'
                : settled
                  ? `Nothing new. ${stage.detail}`
                  : `Runs ${stage.name.toLowerCase()} on its own, without the stages after it.`
            }>
            {isRunning ? 'Running…' : settled ? 'Up to date' : `Just this · ${stage.count}`}
          </button>
        )}
        {stage.costs && <span className="pill warn">costs</span>}
      </div>
    </div>
  );
}
