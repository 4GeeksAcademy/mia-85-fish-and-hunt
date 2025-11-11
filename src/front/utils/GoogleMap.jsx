// GoogleMap.jsx
import { GoogleMap, OverlayView, Marker } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IoFish } from "react-icons/io5";
import { RiCrosshair2Line } from "react-icons/ri";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import ZipSearch from "./ZipSearch";
import toast from "react-hot-toast";
import useGlobalReducer from "../hooks/useGlobalReducer";

const DEFAULT_CENTER_US = { lat: 39.828175, lng: -98.5795 }; // continental US centroid
const DEFAULT_ZOOM_US = 4;

const svgDataUrl = (node) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(renderToStaticMarkup(node))}`;

const DARK_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];

function useThemedStyles(theme, baseHidePoi = true) {
    const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (theme === "auto" && prefersDark)) return DARK_STYLES;
    if (baseHidePoi) {
        return [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        ];
    }
    return undefined;
}

export default function MapBasic({
    center = DEFAULT_CENTER_US,
    zoom = DEFAULT_ZOOM_US,
    hotspots,
    selected,
    onSelect,
    filter = { query: "", types: ["fishing", "hunting"] },
    theme = "auto",
    aspectRatio = "4 / 3",
    rounded = "1rem",
    shadow = true,
    className = "",
    style = {},
    options = {},
    mapId,
}) {
    const { store } = useGlobalReducer();
    const token = store.token;
    const API_BASE = String(store.API_BASE_URL || "").replace(/\/?$/, "");

    // ---------------------------------------------------------------------------
    // Current user (GET /api/user)
    // ---------------------------------------------------------------------------
    const [user, setUser] = useState({
        username: "",
        email: "",
        liked_location_ids: [],
        zipcode: null,
        added_location_ids: [],
    });

    useEffect(() => {
        let cancelled = false;
        async function loadUser() {
            if (!token) {
                if (!cancelled) {
                    setUser((u) => ({ ...u, liked_location_ids: [], added_location_ids: [] }));
                }
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) {
                    setUser({
                        username: data.user_name || "",
                        email: data.email || "",
                        zipcode: data.zipcode ?? null,
                        liked_location_ids: Array.isArray(data.liked_location_ids) ? data.liked_location_ids : [],
                        added_location_ids: Array.isArray(data.added_location_ids) ? data.added_location_ids : [],
                    });
                }
            } catch (e) {
                // silent; hearts will just look empty when not available
                console.error(e);
            }
        }
        loadUser();
        return () => { cancelled = true; };
    }, [API_BASE, token]);

    // ---------------------------------------------------------------------------
    // Favorites state is derived from user.liked_location_ids
    // ---------------------------------------------------------------------------
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        setFavorites(Array.isArray(user.liked_location_ids) ? user.liked_location_ids : []);
    }, [user.liked_location_ids]);

    // Persist favorites to backend and also sync the local user object
    const [savingFavs, setSavingFavs] = useState(false);
    async function persistFavorites(nextIds) {
        if (!token) {
            toast.error("Please login to favorite spots.");
            return false;
        }
        setSavingFavs(true);
        try {
            const res = await fetch(`${API_BASE}/api/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ liked_locations: nextIds }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || `Failed to update favorites (HTTP ${res.status})`);
            }
            // keep the user object in sync so refresh shows the right state immediately
            setUser((prev) => ({ ...prev, liked_location_ids: [...nextIds] }));
            return true;
        } catch (err) {
            toast.error(String(err.message || err));
            return false;
        } finally {
            setSavingFavs(false);
        }
    }

    async function toggleFavorite(h) {
        if (!h?.id) return;
        if (!token) {
            toast.error("Please log in to favorite spots.");
            return;
        }
        const isFav = favorites.includes(h.id);
        const next = isFav ? favorites.filter((i) => i !== h.id) : [...favorites, h.id];

        // optimistic
        setFavorites(next);
        toast.success(isFav ? `${h.name} removed from favorites` : `${h.name} added to favorites`);

        const ok = await persistFavorites(next);
        if (!ok) {
            // rollback
            setFavorites((prev) => (isFav ? [...prev, h.id] : prev.filter((i) => i !== h.id)));
        }
    }

    // Selection
    const [internalSelected, setInternalSelected] = useState(null);
    const sel = selected ?? internalSelected;
    const setSel = onSelect ?? setInternalSelected;

    // Map refs/options
    const mapRef = useRef(null);

    const data = useMemo(() => {
        const source = Array.isArray(hotspots) ? hotspots : [];
        const q = (filter?.query ?? "").trim().toLowerCase();
        const types = new Set(filter?.types ?? ["fishing", "hunting"]);
        return source.filter(
            (h) => types.has(h.type) && (q === "" || h.name.toLowerCase().includes(q))
        );
    }, [hotspots, filter]);

    useEffect(() => {
        if (!sel || !mapRef.current) return;
        mapRef.current.panTo(sel.position);
        mapRef.current.setZoom(13);
    }, [sel]);

    const icons = useMemo(() => {
        const size = 34;
        const fish = svgDataUrl(<IoFish size={size} color="#f1f1f1" />);
        const crosshair = svgDataUrl(<RiCrosshair2Line size={size} color="#ff7900" />);
        const g = window.google?.maps;
        return {
            fishing: {
                url: fish,
                scaledSize: g ? new g.Size(size, size) : undefined,
                anchor: g ? new g.Point(size / 2, size / 2) : undefined,
            },
            hunting: {
                url: crosshair,
                scaledSize: g ? new g.Size(size, size) : undefined,
                anchor: g ? new g.Point(size / 2, size / 2) : undefined,
            },
        };
    }, []);

    const themedStyles = useThemedStyles(theme);
    const mapOptions = useMemo(
        () => ({
            mapTypeControl: false,
            streetViewControl: false,
            clickableIcons: false,
            ...(mapId ? {} : { styles: themedStyles }),
            ...options,
        }),
        [themedStyles, options, mapId]
    );

    const wrapperStyle = {
        width: "100%",
        aspectRatio,
        borderRadius: rounded,
        overflow: "hidden",
        boxShadow: shadow ? "0 10px 30px rgba(0,0,0,.12)" : undefined,
        ...style,
    };

    return (
        <div className={`map-card ${className}`} style={wrapperStyle}>
            <GoogleMap
                onLoad={(m) => (mapRef.current = m)}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={zoom}
                options={mapOptions}
                mapContainerClassName="map-container"
                mapId={mapId}
            >
                {/* ZIP search overlay */}
                <ZipSearch defaultZoom={12} country="US" />

                {data.map((h) => (
                    <Marker key={h.id} position={h.position} onClick={() => setSel(h)} icon={icons[h.type]} />
                ))}

                {mapRef.current && sel && (
                    <OverlayView
                        position={sel.position}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        getPixelPositionOffset={() => ({ x: -90, y: -100 })}
                    >
                        <div className="fh-popup" onClick={(e) => e.stopPropagation()}>
                            <button className="fh-popup__close" onClick={() => setSel(null)} aria-label="Close">
                                ×
                            </button>
                            <div className="fh-popup__title">{sel.name}</div>
                            <div className="fh-popup__type">{sel.type[0].toUpperCase() + sel.type.slice(1)}</div>
                            <a className="fh-popup__link" href={sel.directions} target="_blank" rel="noopener noreferrer">
                                View on Google Maps
                            </a>
                            <div className="fh-popup__tip" />
                            <button
                                className="fh-popup__fav"
                                aria-label={favorites.includes(sel.id) ? "Unfavorite" : "Favorite"}
                                onClick={() => toggleFavorite(sel)}
                                disabled={savingFavs}
                            >
                                {favorites.includes(sel.id) ? <MdFavorite color="#ff4d6d" /> : <MdFavoriteBorder />}
                            </button>
                        </div>
                    </OverlayView>
                )}
            </GoogleMap>
        </div>
    );
}