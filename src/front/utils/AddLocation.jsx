// src/front/components/AddLocation.jsx
import { useRef, useState, useEffect } from "react";
import { GoogleMap as RawMap, Marker, Autocomplete } from "@react-google-maps/api";
import toast from "react-hot-toast";

export const AddLocation = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    // form state
    const [name, setName] = useState("");
    const [type, setType] = useState("fishing");

    // marker state (pin position chosen by user)
    const [selected, setSelected] = useState(null); // { lat, lng } | null
    const hasPoint = !!selected;

    // refs
    const mapRef = useRef(null);
    const acRef = useRef(null);

    // Keep map centered on the selected pin
    useEffect(() => {
        if (selected && mapRef.current) {
            mapRef.current.panTo(selected);
            mapRef.current.setZoom(15);
        }
    }, [selected]);

    // Optional: user searches to move the map; the pin is still user-placed
    function onPlaceChanged() {
        const place = acRef.current?.getPlace();
        const loc = place?.geometry?.location;
        if (!loc) {
            toast.error("That place has no geometry.");
            return;
        }
        const center = { lat: loc.lat(), lng: loc.lng() };
        mapRef.current?.panTo(center);
        mapRef.current?.setZoom(15);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (isProcessing) return;
        if (!hasPoint || !name.trim() || !type) {
            toast.error("Drop the pin and fill in the name/type.");
            return;
        }

        setIsProcessing(true);
        // Prepare the Google Maps directions link
        const latStr = selected.lat.toFixed(6);
        const lngStr = selected.lng.toFixed(6);
        const directionsUrl = `https://www.google.com/maps?q=${latStr},${lngStr}`;
        const payload = {
            name: name.trim(),
            type,
            position: { lat: selected.lat, lng: selected.lng },
            directions: directionsUrl,
        };

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}api/location`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    (Array.isArray(data?.errors) && data.errors.join(", ")) ||
                    data?.message ||
                    "Failed to create location"
                );
            }

            await res.json();
            toast.success("Location added");
            // Keep the marker, just reset the form:
            setName("");
            setType("fishing");
        } catch (err) {
            toast.error(String(err.message || err));
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="d-flex gap-3 w-100">
            <div style={{ width: "100%", height: 420, position: "relative" }}>
                {/* Search box overlay */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        zIndex: 2,
                        background: "rgba(0, 0, 0, 0.7)",
                        padding: "6px 8px",
                        borderRadius: 8,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <Autocomplete
                        onLoad={(autocomplete) => (acRef.current = autocomplete)}
                        onPlaceChanged={onPlaceChanged}
                        options={{ fields: ["geometry"] }}
                    >
                        <input
                            className="form-control"
                            placeholder="Search address/place"
                            style={{
                                minWidth: 260,
                                background: "#fff",
                                color: "#333",
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                padding: "6px 10px",
                                fontSize: 14,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                            }}
                            type="text"
                        />
                    </Autocomplete>
                </div>

                <RawMap
                    onLoad={(m) => (mapRef.centerv = m)}
                    onClick={(e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setSelected({ lat, lng });
                    }}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={selected || { lat: 39.828175, lng: -98.5795 }}
                    zoom={4}
                    options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        clickableIcons: false,
                    }}
                >
                    {hasPoint && (
                        <Marker
                            position={selected}
                            draggable
                            onDragEnd={(e) => {
                                const lat = e.latLng.lat();
                                const lng = e.latLng.lng();
                                setSelected({ lat, lng });
                            }}
                        />
                    )}
                </RawMap>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-2 w-50" noValidate>
                <label htmlFor="location-name" className="text-river fw-bold text-start" >Name your spot:</label>
                <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Dawson's Creek Fishing Hole"
                    id="location-name"
                    required
                />
                <label htmlFor="location-type" className="text-river fw-bold text-start">Is it a Fishing or Hunting spot?</label>
                <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    aria-label="Location type"
                    id="location-type"
                    required
                >
                    <option value="fishing">Fishing</option>
                    <option value="hunting">Hunting</option>
                </select>

                <button
                    className={`btn btn-hunter text-white ${(!hasPoint || !name.trim() || isProcessing) ? "opacity-75" : ""}`}
                    type="button" // not "submit" so we can handle both cases
                    onClick={() => {
                        if (isProcessing) return;

                        if (!hasPoint || !name.trim()) {
                            toast.error("Please drop a pin and enter a name before saving.");
                            return;
                        }

                        handleSubmit(new Event("submit"));
                    }}
                    aria-busy={isProcessing}
                >
                    {isProcessing ? "Saving..." : "Save"}
                </button>
                {(!hasPoint || !name.trim()) && (
                    <small className="text-mutedtone fst-italic">
                        Drop a pin and name your spot to enable saving.
                    </small>
                )}
            </form>
        </div>
    );
}