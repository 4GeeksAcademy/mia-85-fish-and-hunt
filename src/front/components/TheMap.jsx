import { useState } from "react";
import GoogleMap from "../utils/GoogleMap"
export default function TheMap() {
    const [visibility, setVisibility] = useState(false);
    const [mapButtonText, setMapButtonText] = useState("Show Map");
    const [mapButtonColor, setMapButtonColor] = useState("river");

    function showMap() {
        visibility ? setVisibility(false) : setVisibility(true);
        mapButtonText === "Show Map"
            ? setMapButtonText("Hide Map")
            : setMapButtonText("Show Map");
        mapButtonColor === "hunter"
            ? setMapButtonColor("river")
            : setMapButtonColor("hunter");
    }

    return (
        <div className="container d-flex flex-column justify-content-center align-items-start gap-3">
            <button className={`btn btn-${mapButtonColor}`} onClick={() => showMap()}>
                {mapButtonText}
            </button>
            {visibility && (
                <div style={{ width: "100%", maxWidth: 720 }}>
                    <GoogleMap
                        theme="auto" // "light" | "dark" | "auto"
                        aspectRatio="16 / 10" // responsive height
                        rounded="1rem"
                        shadow
                        zoom={12}
                    // mapId="YOUR_CLOUD_STYLED_MAP_ID" // optional; overrides styles
                    // options={{ gestureHandling: "greedy" }} // any extra map options
                    />
                </div>
            )}
        </div>
    );
}
