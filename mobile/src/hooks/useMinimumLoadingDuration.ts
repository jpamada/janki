import { useEffect, useRef, useState } from 'react';

export function useMinimumLoadingDuration(isLoading: boolean, minDurationMs = 400) {
  const [shouldShow, setShouldShow] = useState(isLoading);
  const loadStartedAtRef = useRef<number | null>(isLoading ? Date.now() : null);

  useEffect(() => {
    if (isLoading) {
      loadStartedAtRef.current = Date.now();
      setShouldShow(true);
      return;
    }

    const startedAt = loadStartedAtRef.current;
    if (startedAt === null) {
      setShouldShow(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remaining = minDurationMs - elapsed;

    if (remaining <= 0) {
      setShouldShow(false);
      loadStartedAtRef.current = null;
      return;
    }

    const timer = setTimeout(() => {
      setShouldShow(false);
      loadStartedAtRef.current = null;
    }, remaining);

    return () => clearTimeout(timer);
  }, [isLoading, minDurationMs]);

  return shouldShow;
}