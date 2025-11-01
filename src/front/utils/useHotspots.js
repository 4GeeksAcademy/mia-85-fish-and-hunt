import { useEffect, useMemo, useState } from "react";

export function useHotspots(baseUrl = import.meta.env.VITE_BACKEND_URL) {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // optional

  const mock = useMemo(
    () => [
      {
        id: 1,
        name: "Reef A",
        type: "fishing",
        position: { lat: 33.45, lng: -112.08 },
        directions: "https://maps.app.goo.gl/PtrGVhafgeynBWJ27",
      },
      {
        id: 2,
        name: "WMA Gate",
        type: "hunting",
        position: { lat: 33.44, lng: -112.06 },
        directions: "https://maps.app.goo.gl/kyy4kvNwRcy4NtDq9",
      },
      {
        id: 3,
        name: "Canal Bend",
        type: "fishing",
        position: { lat: 33.455, lng: -112.02 },
        directions: "https://maps.app.goo.gl/YMqEBMrw2iAsN1ar9",
      },
    ],
    []
  );

  // Render immediately with mock; replace later with real data.
  useEffect(() => {
    setHotspots(mock);
  }, [mock]);

  // When you’re ready to hit the API, uncomment this effect.
  // useEffect(() => {
  //   const ctrl = new AbortController();
  //   const url = `${String(baseUrl).replace(/\/?$/, "/")}api/hotspots`;
  //   setLoading(true);
  //   setError(null);
  //   fetch(url, { signal: ctrl.signal })
  //     .then(r => {
  //       if (!r.ok) throw new Error(`HTTP ${r.status}`);
  //       return r.json();
  //     })
  //     .then(data => setHotspots(data ?? []))
  //     .catch(err => {
  //       if (err.name !== "AbortError") setError(err);
  //     })
  //     .finally(() => setLoading(false));
  //   return () => ctrl.abort();
  // }, [baseUrl]);

  return { hotspots, loading, error };
}
