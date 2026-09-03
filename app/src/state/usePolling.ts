import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Polls `fetcher` on an interval while mounted. Used for the screens that
 * mirror the prototype's live state (tracking ETA, chat replies, job queue)
 * against a real HTTP backend instead of an in-memory timer.
 */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => {
    return fetcherRef.current()
      .then((res) => { setData(res); setError(null); })
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const tick = () => {
      if (cancelled) return;
      refetch();
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch };
}
