'use client';

import { useCallback, useState } from 'react';

/**
 * Add a source by describing it, not by knowing its URL.
 *
 * The form beside this takes a link or an exact title, which is fine
 * when you already know the page you want and useless when the question
 * is "what is there about Nigerian railways". This asks that question,
 * now of the whole web rather than only of Wikipedia.
 *
 * It finds documents, never facts. A model asked about a subject answers
 * from memory, which produces text with no passage behind it and nothing
 * the verifier can check — so what comes back is documents, and every
 * fact made from one still arrives with a verbatim quote checked against
 * the text on disk. The judgement of which pages are worth mining stays
 * yours; what is automated is a trip to a browser tab.
 *
 * WHAT THE ORDER MEANS. Wikipedia is first because it is the only source
 * re-readable at a fixed revision, not because it is the strongest
 * evidence — it is explicitly the weakest tier. Below it, results are
 * ordered by what kind of evidence the domain is, decided in code in
 * `source-trust.js`. The model never sees that ranking: it is asked only
 * whether a document is relevant and substantial, so it cannot talk a
 * blog above a journal.
 */
export function FindArticles({ onAdd, busy }) {
  const [term, setTerm] = useState('');
  const [data, setData] = useState(null);
  const [searching, setSearching] = useState(false);
  const [problem, setProblem] = useState('');

  const run = useCallback(
    async (options = {}) => {
      setProblem('');
      setSearching(true);
      const params = new URLSearchParams({ q: term });
      if (options.web === false) params.set('web', 'off');
      if (options.force) params.set('force', '1');

      const res = await fetch(`/api/sources/search?${params}`, { cache: 'no-store' });
      const body = await res.json();
      setSearching(false);
      if (!res.ok) {
        setProblem(body.error ?? 'The search failed.');
        return;
      }
      setData(body);
      if ((body.results ?? []).length === 0) {
        setProblem('Nothing found. Try plainer words, or a name rather than a description.');
      }
    },
    [term],
  );

  const results = data?.results ?? [];
  const quota = data?.quota ?? null;

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <label className="tiny faint" htmlFor="find-articles">
        Or describe what you are looking for
      </label>
      <div className="row" style={{ marginTop: 4 }}>
        <input
          id="find-articles"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void run();
            }
          }}
          placeholder="Nigerian railways, Fela Kuti, the Benin bronzes…"
          style={{ flex: 1, minWidth: 220 }}
        />
        <button
          type="button"
          disabled={searching || term.trim().length < 3}
          onClick={() => void run()}>
          {searching ? 'Searching…' : 'Find articles'}
        </button>
        <button
          type="button"
          className="tiny"
          title="Wikipedia only. Free, and spends nothing from the month's plan."
          disabled={searching || term.trim().length < 3}
          onClick={() => void run({ web: false })}>
          Free search
        </button>
      </div>

      <p className="tiny faint" style={{ marginTop: 6 }}>
        Searches Wikipedia free, and the open web through SerpApi — one search from the month&rsquo;s
        250 per query. Results are ranked by what kind of source the site is, in code, not by the
        model. The pipeline verifies every fact against the exact text it fetched, so a page it
        cannot read is a page it will refuse at fetch.
        {quota && ` ${quota.left} search${quota.left === 1 ? '' : 'es'} left this month.`}
      </p>

      {data && (
        <SearchNote data={data} onRedo={() => void run({ force: true })} searching={searching} />
      )}
      {problem && <p className="tiny faint">{problem}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {results.map((article) => (
            <Result
              key={article.url}
              article={article}
              busy={busy}
              /*
                The description travels with the result.

                It steered the search and was then thrown away, so a
                document chosen while looking for one specific thing was
                mined as though it had turned up at random. `data.query`
                rather than `term`, so editing the box after a search
                cannot attach the wrong description to a result that came
                back before you typed it.
              */
              onAdd={(input) => onAdd(input, data?.query ?? '')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * What the search actually did, and what it cost.
 *
 * The queries are shown because the model wrote them and they are the
 * whole explanation for a set of results that looks unrelated to what was
 * typed. Nothing else in the studio would reveal that a description
 * became four different searches.
 */
function SearchNote({ data, onRedo, searching }) {
  const queries = data.queries ?? [];

  return (
    <div className="tiny faint" style={{ marginTop: 8 }}>
      {data.cached ? (
        <>
          Answered from the cache — this description has been searched before, so it cost nothing.{' '}
          <button className="asText" disabled={searching} onClick={onRedo}>
            search again anyway
          </button>
        </>
      ) : data.spent > 0 ? (
        `${data.spent} web search${data.spent === 1 ? '' : 'es'} spent.`
      ) : (
        'Wikipedia only. Nothing spent.'
      )}
      {queries.length > 0 && <> Searched for: {queries.map((q) => `“${q}”`).join(', ')}.</>}
      {data.warning && <div style={{ color: 'var(--warn)', marginTop: 4 }}>{data.warning}</div>}
    </div>
  );
}

/** One hit, with everything known about it before you commit to reading it. */
function Result({ article, busy, onAdd }) {
  const wiki = article.kind === 'wikipedia';
  const trust = article.trust ?? {};

  return (
    <div
      className="spread"
      style={{
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 0',
        borderTop: '1px solid var(--rule)',
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <a href={article.url} target="_blank" rel="noreferrer" className="small">
            <strong>{article.title}</strong>
          </a>
          <span
            className={`pill${wiki ? ' ok' : ''}`}
            title={
              trust.why ??
              `Tier '${trust.tier}'. Decided from the domain, in code — the model does not vote on it.`
            }>
            {trust.label ?? article.host}
          </span>
          {!wiki && trust.tier && trust.tier !== 'reference' && (
            <span className="pill" title="Strong enough to clear the corroboration warning on its own.">
              {trust.tier}
            </span>
          )}
          {article.disambiguation && (
            <span
              className="pill warn"
              title="A menu of other articles, not an article. Pick one of the pages it lists instead.">
              disambiguation
            </span>
          )}
          {article.words > 0 && article.words < 800 && (
            <span className="pill" title="Short. There may be little worth extracting.">
              stub
            </span>
          )}
          {article.alreadyOnList && (
            <span className="pill ok">
              on the list as {article.slug}
              {article.alreadyCached ? ' · cached' : ''}
            </span>
          )}
        </div>
        {article.why && (
          <p className="tiny" style={{ margin: '4px 0 0' }}>
            {article.why}
          </p>
        )}
        <p className="tiny faint" style={{ margin: '4px 0 0' }}>
          {!wiki && <span className="mono">{article.host}</span>}
          {!wiki && article.summary && ' · '}
          {article.summary}
        </p>
      </div>
      <button
        type="button"
        disabled={busy || article.alreadyOnList || article.disambiguation}
        title={
          article.disambiguation
            ? 'A disambiguation page is a menu, not a source'
            : article.alreadyOnList
              ? 'Already on the seed list'
              : 'Adds it to the seed list. Fetch pulls its text.'
        }
        onClick={() => void onAdd(wiki ? article.title : article.url)}>
        Add
      </button>
    </div>
  );
}
