'use client';

/**
 * The bar that appears once something is selected.
 *
 * It sticks to the top of the list rather than the bottom of the window
 * because the selection is a property of the list, and because a bar
 * pinned over the last row hides the row you are about to judge.
 *
 * The actions are passed in as children: what a selection can do is the
 * one thing that genuinely differs between the queues, and pretending
 * otherwise would mean a prop for every verb.
 */
export function SelectionBar({ count, hidden, allShown, onToggleAll, onClear, children }) {
  return (
    <div className="selectionBar" data-live={count > 0}>
      <label className="pick">
        <input type="checkbox" checked={allShown} onChange={onToggleAll} />
        <span className="tiny">{allShown ? 'None' : 'All shown'}</span>
      </label>

      <span className="small">
        {count === 0 ? 'Nothing selected' : `${count} selected`}
        {hidden > 0 && (
          <span className="tiny faint">
            {' '}
            · {hidden} more selected but filtered out, and not touched
          </span>
        )}
      </span>

      <div className="row" style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
        {children}
        {count > 0 && (
          <button className="tiny" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
