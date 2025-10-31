// hooks/useHotspots.js
import { useEffect, useMemo, useState } from "react";

export function useHotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);

  // MOCK: useMemo data today
  const mock = useMemo(
    () => [
      {
        id: 1,
        name: "Reef A",
        type: "fishing",
        position: { lat: 33.45, lng: -112.08 },
      },
      {
        id: 2,
        name: "WMA Gate",
        type: "hunting",
        position: { lat: 33.44, lng: -112.06 },
      },
      {
        id: 3,
        name: "Canal Bend",
        type: "fishing",
        position: { lat: 33.455, lng: -112.02 },
      },
    ],
    []
  );

  useEffect(() => {
    // Today: pretend we “loaded”
    setHotspots(mock);

    // LATER: replace with real fetch
    /*
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}api/hotspots`)
      .then(r => r.json())
      .then(data => setHotspots(data))
      .finally(() => setLoading(false));
    */
  }, [mock]);

  return { hotspots, loading };
}
