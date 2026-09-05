'use client';

/* eslint-disable @next/next/no-img-element -- thumbnails are remote and
   hotlinked for now; next/image would need a remote-pattern allowlist for
   a local tool nobody deploys. */

import { useCallback, useState } from 'react';

/*
  How many results to put on screen at once.

  The paid call returns everything it can — around forty usable pictures
  — and all of it is cached, so paging through costs nothing. Showing
  forty at once is what makes a grid unusable: you scroll past the good
  one. Ten is a screenful you can actually compare.
*/
const PAGE = 10;

/**
 * A remote picture that might refuse to load, shown anyway.
 *
 * A searched image is hotlinked from wherever the web had it, and a third
 * of them will not render in a browser that is not the site they belong
 * to. Measured on the accepted set: 26 of 82. Three ways it fails, none
 * of them a bug in this studio — `nation.africa`, `thecable.ng` and
 * `premiumtimesng` answer a cross-site request with 403; Rolling Stone,
 * Billboard and Vibe drop the connection; and a Facebook or Instagram
 * `lookaside` URL returns 200 with a login page in it, which an `<img>`
 * treats as a broken file.
 *
 * The picker never showed this because it renders `thumbnail || url`,
 * and the thumbnail is the search provider's own copy on a host that
 * exists to be hotlinked. So the same picture looked fine while choosing
 * and broken once chosen, which reads as the studio losing the image.
 *
 * Falling back is honest for judging — it is the right picture, at a
 * worse size — but it is NOT a fix for the app, which ships `url` and
 * will get the same 403 on a phone. `title` says which copy you are
 * looking at so a dead hotlink stays visible rather than being papered
 * over.
 *
 * Mount one per source: the call sites pass `key={url}` so choosing a new
 * picture starts from the original again rather than inheriting a
 * previous failure.
 *
 * @param {{ src: string, thumbnail?: string, className?: string, title?: string }} props
 */
export function Pic({ src, thumbnail, className, title }) {
  // 0 the original, 1 the provider's thumbnail, 2 nothing left to try.
  const [stage, setStage] = useState(0);

  const fallback = thumbnail && thumbnail !== src ? thumbnail : '';
  if (stage === 2 || (stage === 1 && fallback.length === 0)) {
    return (
      <span
        className={className}
        title={`${title ?? ''}\n\nThis image will not load here, and will not load in the app either. Its host refuses requests from anywhere but its own pages.`}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="tiny faint" style={{ padding: 4, textAlign: 'center', lineHeight: 1.2 }}>
          won&rsquo;t load
        </span>
      </span>
    );
  }

  const showing = stage === 1 ? fallback : src;
  return (
    <img
      src={showing}
      alt=""
      className={className}
      title={stage === 1 ? `${title ?? ''}\n\n(Search thumbnail. The full picture will not load from its host.)` : title}
      onError={() => setStage(stage + 1)}
    />
  );
}

/**
 * The picture, chosen where the fact is.
 *
 * This used to be a page of its own, judging images in a list with the
 * fact reduced to one line above each. That is the wrong place to answer
 * the only question that matters — does this picture fit this claim —
 * which needs the deep dive, the passage and the source in front of you.
 * So it lives here now, and the images page is gone.
 *
 * Three ways to get a picture, in ascending order of effort: the
 * harvested pool from the fact's own article, a web search, or nothing.
 * Nothing is a legitimate answer — `image: null` is a designed value in
 * the contract and the typographic card is a real variant, not a
 * fallback. A fact about a moment rather than a subject often has no
 * photograph and never will, and forcing a generic one onto a specific
 * claim is how a facts app quietly stops being evidential.
 */
export function ImagePanel({ image, who, onDecide }) {
  const [openPool, setOpenPool] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [term, setTerm] = useState('');
  const [found, setFound] = useState([]);
  const [searching, setSearching] = useState(false);
  const [note, setNote] = useState('');
  const [quota, setQuota] = useState(null);
  const [cached, setCached] = useState(false);
  const [shown, setShown] = useState(PAGE);

  /*
    Results land in the pool before anything is clicked. A decision
    records only a file name, and the credit for a searched picture lives
    nowhere else — remembering it at accept time would mean a reload
    between searching and choosing could ship an image with no
    attribution behind it.

    `force` is the only way to pay for a query twice. The plan is 250
    searches a month, and a repeat buys nothing but a fresher timestamp.
  */
  const runSearch = useCallback(async (query, force = false) => {
    setNote('');
    setSearching(true);
    const url = '/api/image-search?q=' + encodeURIComponent(query) + (force ? '&force=1' : '');
    const res = await fetch(url, { cache: 'no-store' });
    const body = await res.json();
    setSearching(false);
    if (!res.ok) {
      setNote(body.error ?? 'The search failed.');
      return;
    }
    setFound(body.candidates ?? []);
    setShown(PAGE);
    setCached(Boolean(body.cached));
    if (body.quota) setQuota(body.quota);
    if ((body.candidates ?? []).length === 0) {
      setNote('Nothing found for that. Try fewer, plainer words.');
    }
  }, []);

  if (!image) return null;

  const named = who.trim().length > 0;

  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(128,128,128,0.25)' }}>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <span className="tiny faint">Image</span>
        <span className="pill">{image.status}</span>
        {image.decidedBy && (
          <span className="tiny faint">
            by {image.decidedBy} on {image.decidedAt}
          </span>
        )}
      </div>

      {image.chosen ? (
        <div className="chosen" style={{ marginTop: 8 }}>
          <Pic
            key={image.chosen.url}
            src={image.chosen.url}
            thumbnail={image.chosen.thumbnail}
            title={image.chosen.credit}
          />
          <p className="tiny muted" style={{ margin: '6px 0 0' }}>
            {image.chosen.credit} · {image.chosen.license}
          </p>
        </div>
      ) : (
        <p className="tiny faint">No image. This fact ships as a typographic card.</p>
      )}

      <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        {image.pool.length > 0 && (
          <button className="tiny" onClick={() => setOpenPool(!openPool)}>
            {openPool ? 'Hide the pool' : 'From its article (' + image.pool.length + ')'}
          </button>
        )}
        <button
          className="tiny"
          onClick={() => {
            if (openSearch) {
              setOpenSearch(false);
              return;
            }
            // The article title is the query worth offering: it is what
            // the fact is about, and what you will edit down from.
            setTerm(image.article);
            setFound([]);
            setOpenSearch(true);
          }}>
          {openSearch ? 'Close search' : 'Search the web'}
        </button>
        {image.chosen && (
          <button className="tiny bad" onClick={() => void onDecide('rejected', '', '')}>
            Remove the image
          </button>
        )}
      </div>

      {openSearch && (
        <div style={{ marginTop: 10 }}>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <input
              type="search"
              value={term}
              placeholder="What should the picture show?"
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runSearch(term);
              }}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button
              className="primary"
              disabled={searching || term.trim().length < 3}
              onClick={() => void runSearch(term)}>
              {searching ? 'Searching…' : 'Search'}
            </button>
            {cached && (
              <button
                disabled={searching || term.trim().length < 3}
                title="Ask the provider again. Costs one search."
                onClick={() => void runSearch(term, true)}>
                Again · costs 1
              </button>
            )}
          </div>

          <p className="tiny faint" style={{ marginTop: 6 }}>
            Google image search via SerpApi
            {cached ? ' · from the cache, no search spent' : ''}
            {quota ? ' · ' + quota.left + ' left this month' : ''}. These carry{' '}
            <strong>no licence</strong> — accepting one is you clearing the rights yourself, and
            the credit falls back to the site it was found on.
          </p>
          {note && <p className="tiny faint">{note}</p>}

          {found.length > 0 && (
            <>
              <p className="tiny faint">
                Showing {Math.min(shown, found.length)} of {found.length} found.
              </p>
              <div className="thumbs">
              {found.slice(0, shown).map((candidate) => (
                <button
                  type="button"
                  className="thumb"
                  key={candidate.file}
                  disabled={!named}
                  title={named ? candidate.description || candidate.file : 'Type your name first'}
                  onClick={() => void onDecide('accepted', candidate.file, 'Found by web search.')}>
                  <img src={candidate.thumbnail || candidate.url} alt="" />
                  <figcaption>
                    {(candidate.description || candidate.file).slice(0, 60)}
                    <br />
                    <span className="faint">{candidate.via}</span>
                  </figcaption>
                </button>
              ))}
              </div>
              {shown < found.length && (
                <button
                  className="tiny"
                  style={{ marginTop: 10 }}
                  onClick={() => setShown(shown + PAGE)}>
                  Show {Math.min(PAGE, found.length - shown)} more · free, already fetched
                </button>
              )}
            </>
          )}
        </div>
      )}

      {openPool && (
        <div className="thumbs">
          {image.pool.map((candidate) => (
            <button
              type="button"
              className="thumb"
              key={candidate.file}
              disabled={!named}
              title={named ? candidate.file : 'Type your name first'}
              onClick={() => void onDecide('accepted', candidate.file, 'Chosen by the reviewer.')}>
              <img src={candidate.thumbnail || candidate.url} alt="" />
              <figcaption>
                {candidate.file.replace(/^File:/, '').slice(0, 60)}
                <br />
                <span className="faint">{candidate.license}</span>
              </figcaption>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
