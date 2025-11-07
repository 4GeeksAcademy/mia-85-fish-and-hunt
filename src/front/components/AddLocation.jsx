// src/front/components/AddLocation.jsx
import { useRef, useState } from "react";
import { GoogleMap as RawMap, Marker, Autocomplete } from "@react-google-maps/api";
import toast from "react-hot-toast";

export const AddLocation = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    // form state
    const [name, setName] = useState("");
    const [type, setType] = useState("fishing");
    const [directions, setDirections] = useState("");

    // marker state (pin position chosen by user)
    const [selected, setSelected] = useState(null); // { lat, lng } | null
    const hasPoint = !!selected;

    // refs
    const mapRef = useRef(null);
    const acRef = useRef(null);

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

        // If you want to *suggest* a pin at the searched spot the first time:
        if (!selected) setSelected(center);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (isProcessing) return;
        if (!hasPoint || !name.trim() || !type) {
            toast.error("Drop the pin and fill in the name/type.");
            return;
        }

        setIsProcessing(true);
        const payload = {
            name: name.trim(),
            type,
            position: { lat: selected.lat, lng: selected.lng },
            directions: directions.trim() || null,
        };

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}api/locations`, // <-- plural route
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

            await res.json(); // created location (if you need it)
            toast.success("Location added");
            // Keep the marker, just reset the form:
            setName("");
            setType("fishing");
            setDirections("");
        } catch (err) {
            toast.error(String(err.message || err));
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="d-flex flex-column gap-3">
            <div style={{ width: "100%", height: 420, position: "relative" }}>
                {/* Search box overlay */}
                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
                    <Autocomplete onLoad={(ac) => (acRef.current = ac)} onPlaceChanged={onPlaceChanged}>
                        <input
                            className="form-control"
                            placeholder="Search address/place"
                            style={{ minWidth: 260 }}
                            type="text"
                        />
                    </Autocomplete>
                </div>

                <RawMap
                    onLoad={(m) => (mapRef.current = m)}
                    onClick={(e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setSelected({ lat, lng });
                    }}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={{ lat: 33.4484, lng: -112.074 }}
                    zoom={11}
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
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-2" noValidate>
                <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Location name"
                    required
                />

                <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    aria-label="Location type"
                >
                    <option value="fishing">Fishing</option>
                    <option value="hunting">Hunting</option>
                </select>

                <input
                    className="form-control"
                    value={directions}
                    onChange={(e) => setDirections(e.target.value)}
                    placeholder="Directions URL (optional)"
                />

                <button
                    className="btn btn-hunter"
                    type="submit"
                    disabled={!hasPoint || !name.trim() || isProcessing}
                    aria-busy={isProcessing}
                >
                    {isProcessing ? "Saving..." : "Save"}
                </button>
            </form>
        </div>
    );
}