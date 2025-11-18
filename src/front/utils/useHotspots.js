import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useHotspots(baseUrl = import.meta.env.VITE_BACKEND_URL) {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Ensure we have a clean base like "https://.../"
  const apiBase = useMemo(
    () => String(baseUrl || "").replace(/\/?$/, "/"),
    [baseUrl]
  );

  const refetch = useCallback(async () => {
    // cancel any in-flight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}api/location`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Normalize: make sure lat/lng are numbers
      const normalized = (Array.isArray(data) ? data : []).map((h) => ({
        ...h,
        position: {
          lat: Number(h?.position?.lat),
          lng: Number(h?.position?.lng),
        },
      }));

      setHotspots(normalized);
    } catch (err) {
      if (err.name !== "AbortError") setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { hotspots, loading, error, refetch };
}

export default useHotspots;
