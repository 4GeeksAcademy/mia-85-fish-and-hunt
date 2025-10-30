import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IoFish } from "react-icons/io5";
import { RiCrosshair2Line } from "react-icons/ri";

const DEFAULT_CENTER = { lat: 33.4484, lng: -112.074 };

// Convert a React icon to a data URL for Google Maps `icon.url`
const svgDataUrl = (node) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        renderToStaticMarkup(node)
    )}`;

// A tasteful dark style (you can replace with your own or a mapId)
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

// Helper to decide styles based on theme prop
function useThemedStyles(theme, baseHidePoi = true) {
    const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (theme === "auto" && prefersDark)) return DARK_STYLES;
    // Light theme: still hide POIs/icons if desired:
    if (baseHidePoi) {
        return [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        ];
    }
    return undefined;
}

/**
 * MapBasic (enhanced)
 * Props:
 * - center, zoom
 * - hotspots: [{ id, name, type: "fishing"|"hunting", position, directions? }]
 * - theme: "light" | "dark" | "auto" (default "auto")
 * - aspectRatio: string like "16 / 9" | "4 / 3" (default "4 / 3")
 * - rounded: CSS radius (default "1rem")
 * - shadow: boolean (default true)
 * - className, style: extra classes/styles for the OUTER wrapper
 * - options: extra Google Map options (merged)
 * - mapId: optional Google Cloud styled map id (overrides styles if provided)
 */
export default function MapBasic({
    center = DEFAULT_CENTER,
    zoom = 11,
    // width, // legacy – ignore when using aspect-ratio
    // height, // legacy – ignore when using aspect-ratio
    hotspots, // optional; uses sample if not passed
    theme = "auto",
    aspectRatio = "4 / 3",
    rounded = "1rem",
    shadow = true,
    className = "",
    style = {},
    options = {},
    mapId,
}) {
    const [selected, setSelected] = useState(null);

    // Default hotspots (you can pass real data from parent)
    const data = useMemo(
        () =>
            hotspots ?? [
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
            ],
        [hotspots]
    );

    // Icon objects (valid for <Marker icon={...}>)
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

    // Themed styles (if no mapId)
    const themedStyles = useThemedStyles(theme);

    // Merge options
    const mapOptions = useMemo(
        () => ({
            mapTypeControl: false,
            streetViewControl: false,
            clickableIcons: false,
            fullscreenControl: false,
            ...(mapId ? {} : { styles: themedStyles }),
            ...options,
        }),
        [themedStyles, options, mapId]
    );

    // Wrapper styling: rounded, shadow, responsive size
    const wrapperStyle = {
        width: "100%",
        aspectRatio, // responsive height calculated from width
        borderRadius: rounded,
        overflow: "hidden", // clips map corners
        boxShadow: shadow ? "0 10px 30px rgba(0,0,0,.12)" : undefined,
        ...style,
    };

    return (
        <div className={`map-card ${className}`} style={wrapperStyle}>
            {/* Fill 100% of wrapper */}
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={zoom}
                options={mapOptions}
                mapContainerClassName="map-container"
                mapId={mapId}
            >
                {data.map((h) => (
                    <Marker
                        key={h.id}
                        position={h.position}
                        onClick={() => setSelected(h)}
                        icon={icons[h.type]}
                    />
                ))}

                {selected && (
                    <InfoWindow
                        position={selected.position}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div>
                            <strong>{selected.name}</strong>
                            <br />
                            <small>{selected.type}</small>
                            {selected.directions && (
                                <>
                                    <br />
                                    <small>
                                        <a
                                            href={selected.directions}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Google Maps
                                        </a>
                                    </small>
                                </>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
