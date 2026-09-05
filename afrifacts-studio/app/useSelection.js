'use client';

import { useCallback, useMemo, useState } from 'react';

/**
 * Picking several rows, on any queue.
 *
 * One hook rather than four copies, because the awkward part is the same
 * everywhere and it is not the checkbox: it is what a selection means
 * once the filter or the search box moves under it.
 *
 * The rule here is that a bulk action only ever touches rows you can
 * currently see. Select forty, type a search that narrows to six, press
 * Approve, and six are approved — never the forty, of which thirty-four
 * are off screen and unread. The selection itself is kept whole, and the
 * count of what is hidden is returned so the bar can say so out loud
 * instead of quietly discarding it.
 *
 * @param {string[]} visibleIds ids of the rows currently rendered, in order.
 */
export function useSelection(visibleIds) {
  const [picked, setPicked] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setPicked(new Set()), []);

  /** The selection, narrowed to what is on screen. What actions act on. */
  const ids = useMemo(() => visibleIds.filter((id) => picked.has(id)), [visibleIds, picked]);

  const allShown = visibleIds.length > 0 && ids.length === visibleIds.length;

  const toggleAll = useCallback(() => {
    setPicked((prev) => {
      const next = new Set(prev);
      const everyone = visibleIds.every((id) => next.has(id)) && visibleIds.length > 0;
      for (const id of visibleIds) {
        if (everyone) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [visibleIds]);

  return {
    ids,
    count: ids.length,
    hidden: picked.size - ids.length,
    has: useCallback((id) => picked.has(id), [picked]),
    toggle,
    toggleAll,
    allShown,
    clear,
  };
}
