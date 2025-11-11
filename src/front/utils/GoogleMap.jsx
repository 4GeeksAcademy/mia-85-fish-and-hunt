// GoogleMap.jsx
import { GoogleMap, OverlayView, Marker } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IoFish } from "react-icons/io5";
import { RiCrosshair2Line } from "react-icons/ri";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import ZipSearch from "./ZipSearch";
import toast from "react-hot-toast"

const DEFAULT_CENTER = { lat: 33.4484, lng: -112.074 };

const svgDataUrl = (node) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        renderToStaticMarkup(node)
    )}`;

const DARK_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    {
        featureType: "administrative.country",
        elementType: "geometry.stroke",
        stylers: [{ color: "#4b6878" }],
    },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#304a7d" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0e1626" }],
    },
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
    center = DEFAULT_CENTER,
    zoom = 11,
    hotspots, // optional
    selected, // optional
    onSelect, // optional
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
    // Uncontrolled fallback:
    const [internalSelected, setInternalSelected] = useState(null);
    const sel = selected ?? internalSelected;
    const setSel = onSelect ?? setInternalSelected;

    const mapRef = useRef(null);

    // favorites stored as array of hotspot ids in localStorage
    const [favorites, setFavorites] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("fh_favs") || "[]");
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("fh_favs", JSON.stringify(favorites));
        } catch (e) {
            // ignore
        }
    }, [favorites]);

    function toggleFavorite(h) {
        if (!h || !h.id) return;
        setFavorites((prev) => {
            if (prev.includes(h.id)) return prev.filter((i) => i !== h.id);
            return [...prev, h.id];
        });
        toast.success(
            favorites.includes(h.id)
                ? `${h.name} removed from favorites`
                : `${h.name} added to favorites`
        );
    }

    const data = useMemo(() => {
        const source = hotspots ?? [
            {
                id: 1,
                name: "Reef A",
                type: "fishing",
                position: { lat: 33.45, lng: -112.08 },
                directions: "https://maps.app.goo.gl/VuzYRoxzCWuBFvM8A",
            },
            {
                id: 2,
                name: "WMA Gate",
                type: "hunting",
                position: { lat: 33.44, lng: -112.06 },
                directions: "https://maps.app.goo.gl/7Pa1f2RtMsReWN4KA",
            },
        ];
        const q = (filter?.query ?? "").trim().toLowerCase();
        const types = new Set(filter?.types ?? ["fishing", "hunting"]);
        return source.filter(
            (h) => types.has(h.type) && (q === "" || h.name.toLowerCase().includes(q))
        );
    }, [hotspots, filter]);

    // Pan/zoom to selected
    useEffect(() => {
        if (!sel || !mapRef.current) return;
        mapRef.current.panTo(sel.position);
        mapRef.current.setZoom(13);
    }, [sel]);

    // Marker icons
    const icons = useMemo(() => {
        const size = 34;
        const fish = svgDataUrl(<IoFish size={size} color="#f1f1f1" />);
        const crosshair = svgDataUrl(
            <RiCrosshair2Line size={size} color="#ff7900" />
        );
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
        aspectRatio, // responsive
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
                    <Marker
                        key={h.id}
                        position={h.position}
                        onClick={() => setSel(h)}
                        icon={icons[h.type]}
                    />
                ))}

                {mapRef.current && sel && (
                    <OverlayView
                        position={sel.position}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        getPixelPositionOffset={() => ({ x: -90, y: -100 })}
                    >
                        <div className="fh-popup" onClick={(e) => e.stopPropagation()}>
                            <button className="fh-popup__close" onClick={() => setSel(null)} aria-label="Close">×</button>
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
                            >
                                {favorites.includes(sel.id) ? (
                                    <MdFavorite color="#ff4d6d" />
                                ) : (
                                    <MdFavoriteBorder />
                                )}
                            </button>
                        </div>
                    </OverlayView>
                )}
            </GoogleMap>
        </div>
    );
}
