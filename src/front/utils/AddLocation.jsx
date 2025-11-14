import useGlobalReducer from "../hooks/useGlobalReducer";
import { useRef, useState, useEffect } from "react";
import { GoogleMap as RawMap, Marker, Autocomplete } from "@react-google-maps/api";
import toast from "react-hot-toast";

export const AddLocation = () => {
    const { store } = useGlobalReducer();
    // Load current user to access user's added locations
    // 1st create a state variable to hold user's existing added locations info
    const [user, setUser] = useState({ id: null, added_location_ids: [], });
    // 2nd construct the api route needed to fetch GET the info
    const base = store.API_BASE_URL || "";
    const url = `${base}/api/user`;
    useEffect(() => {
        async function loadUser() {
            if (!store.token) return;

            try {
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${store.token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    toast.error(data.message || "Could not load user");
                    return;
                }

                const locations = data.added_locations.map((item) => {
                    item.id
                })

                setUser({
                    id: data.id,
                    added_location_ids: locations || [],
                });
            } catch (e) {
                console.error(e);
                toast.error("Network error while loading user");
            }
        }
        loadUser();
    }, [store.token, url]);
    // create state to disable button preventing multiple user clicks
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

    // User searches to move the map but the pin is still user-placed and not removed
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
            toast.error("Drop the pin and fill in the name and type.");
            return;
        }

        if (!store.token) {
            toast.error("Please log in to add a spot.");
            navigate("/login");
            return;
        }

        setIsProcessing(true);

        const latStr = selected.lat.toFixed(6);
        const lngStr = selected.lng.toFixed(6);
        const directionsUrl = `https://www.google.com/maps?q=${latStr},${lngStr}`;

        const payload = {
            name: name.trim(),
            type,
            position: { lat: selected.lat, lng: selected.lng },
            directions: directionsUrl,
            creator_id: user.id,
        };

        try {
            // 1) create the Location
            const res = await fetch(`${base}/api/location`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${store.token}`,
                },
                body: JSON.stringify(payload),
            });

            const created = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    (Array.isArray(created?.errors) && created.errors.join(", ")) ||
                    created?.message ||
                    "Failed to create location"
                );
            }

            if (!created.id) {
                throw new Error("Backend did not return a new location id");
            }

            // 2) update the user's added_locations with the new id
            const newIds = [
                ...(user.added_location_ids || []),
                created.id,
            ];

            const res2 = await fetch(`${base}/api/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${store.token}`,
                },
                body: JSON.stringify({ added_locations: newIds }),
            });

            const putBody = await res2.json().catch(() => ({}));

            if (!res2.ok) {
                throw new Error(
                    putBody.message || "Failed to attach location to your profile"
                );
            }

            // keep local state in sync
            setUser((prev) => ({
                ...prev,
                added_location_ids: newIds,
            }));

            toast.success("Location added");
            // reset only the form, keep the pin if you like
            setName("");
            setType("fishing");
        } catch (err) {
            console.error(err);
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
                    onLoad={(m) => (mapRef.current = m)}
                    onClick={(e) => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setSelected({ lat, lng });
                    }}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={selected || { lat: 33.4484, lng: -112.074 }}
                    zoom={selected ? 15 : 11}
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