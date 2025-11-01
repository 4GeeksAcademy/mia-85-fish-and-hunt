import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places", "geometry", "drawing", "visualization", "marker"];

export function MapProvider({ children, fallback = <div>Loading map…</div> }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries, // stable reference, no reloading
  });

  if (!isLoaded) return fallback;
  return children;
}
