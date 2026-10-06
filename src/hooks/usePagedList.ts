import {useMemo, useRef} from 'react';

/**
 * Merges the pages of a paginated RTK Query list into one array.
 *
 * The list is derived during render instead of being copied into state from a
 * useEffect, so rows appear in the same render the request finishes — there is
 * no blank frame between the loader hiding and the list filling.
 *
 * Pass the query's `currentData` items: they are undefined while a new page or
 * filter is loading, so rows from other args are never mixed in. Page 1, or a
 * change of `resetKey` (e.g. the active filters), starts a fresh list.
 */
export const usePagedList = <T>(
  items: T[] | undefined,
  page: number,
  getKey: (item: T) => string,
  resetKey = '',
): T[] => {
  const pagesRef = useRef(new Map<number, T[]>());
  const resetKeyRef = useRef(resetKey);

  return useMemo(() => {
    if (page === 1 || resetKey !== resetKeyRef.current) {
      pagesRef.current = new Map();
      resetKeyRef.current = resetKey;
    }
    if (items) {
      pagesRef.current.set(page, items);
    }

    const byKey = new Map<string, T>();
    [...pagesRef.current.keys()]
      .sort((a, b) => a - b)
      .forEach(p =>
        pagesRef.current.get(p)?.forEach(item => byKey.set(getKey(item), item)),
      );
    return Array.from(byKey.values());
    // getKey is a plain field accessor; it must not invalidate the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, page, resetKey]);
};
