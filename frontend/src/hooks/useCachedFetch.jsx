import { useState, useEffect, useRef } from 'react';

const cache = new Map();

// 👇 Export this function to invalidate cache from anywhere
export const invalidateCache = (key) => {
  if (cache.has(key)) {
    cache.delete(key);
    console.log(`Cache invalidated: ${key}`);
  }
};

export const useCachedFetch = (key, fetchFn, staleTime = 5 * 60 * 1000) => {
  const [data, setData] = useState(() => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return cached.data;
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const refetch = async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      if (isMounted.current) {
        setData(result);
        setError(null);
        cache.set(key, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      if (isMounted.current) setError(err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    if (!data) {
      refetch();
    } else {
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp > staleTime) {
        refetch();
      }
    }
    return () => { isMounted.current = false; };
  }, [key]);

  return { data, loading, error, refetch };
};