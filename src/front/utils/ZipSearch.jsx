import { useGoogleMap } from "@react-google-maps/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ZipSearch({ defaultZoom = 12, country = "US" }) {
    const map = useGoogleMap();
    const [zip, setZip] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        // --- Validation ---
        const trimmed = zip.trim();
        if (!trimmed) {
            toast.error("Please enter a ZIP code.");
            return;
        }
        if (!/^\d{5}$/.test(trimmed)) {
            toast.error("ZIP must be 5 digits long and numbers only.");
            return;
        }
        if (!map) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            {
                address: trimmed,
                componentRestrictions: { country }, // hard restrict to US
            },
            (results, status) => {
                if (status === "OK" && results?.length) {
                    const { geometry } = results[0];
                    if (geometry.viewport) {
                        map.fitBounds(geometry.viewport);
                    } else if (geometry.location) {
                        map.panTo(geometry.location);
                        map.setZoom(defaultZoom);
                    }
                } else {
                    toast.error("ZIP not found. Please try again.");
                }
            }
        );
    }

    // simple overlay UI in the map corner
    return (
        <form
            onSubmit={handleSubmit}
            style={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 2,
                display: "flex",
                gap: 8,
                background: "white",
                padding: "6px 8px",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            }}
        >
            <input
                type="text"
                inputMode="numeric"
                placeholder="ZIP (e.g. 85004)"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: "6px 8px",
                    minWidth: 140,
                }}
            />
            <button type="submit" className="btn btn-river">
                Go
            </button>
        </form>
    );
}