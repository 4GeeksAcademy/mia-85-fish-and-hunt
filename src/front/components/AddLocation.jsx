import { useState } from "react";
import GoogleMap from "../utils/GoogleMap";

function AddLocation() {
    // Using Geocoder or Places Autocomplete result:
    const { geometry } = result;                 // e.g. results[0]
    const lat = geometry.location.lat();
    const lng = geometry.location.lng();

    // put a marker there, store in state, enable “Confirm”
    setSelected({ name, type, position: { lat, lng } });

    const object = {
        "name": "Canal Bend",
        "type": "fishing",
        "position": { "lat": 33.455, "lng": -112.02 },
        "directions": "https://maps.app.goo.gl/..."
    }

    return (
        <GoogleMap
            onClick={(e) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setSelected((prev) => ({ ...prev, position: { lat, lng } }));
            }}
        >
            {selected?.position && <Marker position={selected.position} draggable
                onDragEnd={(e) => {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    setSelected((p) => ({ ...p, position: { lat, lng } }));
                }}
            />}
        </GoogleMap>
    );
}