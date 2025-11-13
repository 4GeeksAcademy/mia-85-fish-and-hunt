import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";
import HotspotList from "./HotspotList";
import GoogleMap from "../utils/GoogleMap";
import { useHotspots } from "../utils/useHotspots";
import { AddLocation } from "../utils/AddLocation";

export default function TheMap() {
    /* -------------------------------------------------------------------------- */
    /*           Logic to conditionally render based on LoggedIn Status           */
    /* -------------------------------------------------------------------------- */
    const { store, dispatch } = useGlobalReducer();
    const token = store.token;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        // If the user is not logged in
        if (token == undefined) {
            setIsLoggedIn(false);
        } else {
            setIsLoggedIn(true)
        }
    }, [token]);


    const { hotspots, loading } = useHotspots();

    const [addLocation, setAddLocation] = useState(false);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState({
        query: "",
        types: ["fishing", "hunting"],
    });

    const btnColor = addLocation ? "hunter" : "river";
    const btnText = addLocation ? "View Map" : "Add a Location?";

    /* -------------------------------------------------------------------------- */
    /*                    Rendering for Logged Out User & Vistors                  */
    /* -------------------------------------------------------------------------- */
    if (!isLoggedIn) {
        return (
            <div className="container d-flex flex-column justify-content-center align-items-start gap-3">
                <div className="d-flex gap-3 w-100">
                    {/* LEFT: filterable list */}
                    <HotspotList
                        items={hotspots}
                        selectedId={selected?.id}
                        onSelect={setSelected}
                        onFilterChange={setFilter}
                    />
                    {/* RIGHT: map */}
                    <div style={{ flex: 1, minWidth: 420, maxWidth: 900 }}>
                        {loading ? (
                            <div className="p-4 text-muted">Loading hotspots…</div>
                        ) : (
                            <GoogleMap
                                hotspots={hotspots}
                                selected={selected}
                                onSelect={setSelected}
                                filter={filter}
                                theme="auto"
                                aspectRatio="16 / 10"
                                rounded="1rem"
                                shadow
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /* -------------------------------------------------------------------------- */
    /*                    Rendering for Logged In Users                  */
    /* -------------------------------------------------------------------------- */
    if (isLoggedIn) {
        return (
            <div className="container d-flex flex-column justify-content-center align-items-start gap-3">
                <button className={`btn btn-${btnColor}`} onClick={() => setAddLocation((v) => !v)}>{btnText}</button>
                {addLocation ? (
                    <AddLocation onDone={() => setAddLocation(false)} />
                ) : (
                    <div className="d-flex gap-3 w-100">
                        {/* LEFT: filterable list */}
                        <HotspotList
                            items={hotspots}
                            selectedId={selected?.id}
                            onSelect={setSelected}
                            onFilterChange={setFilter}
                        />
                        {/* RIGHT: map */}
                        <div style={{ flex: 1, minWidth: 420, maxWidth: 900 }}>
                            {loading ? (
                                <div className="p-4 text-muted">Loading hotspots…</div>
                            ) : (
                                <GoogleMap
                                    hotspots={hotspots}
                                    selected={selected}
                                    onSelect={setSelected}
                                    filter={filter}
                                    theme="auto"
                                    aspectRatio="16 / 10"
                                    rounded="1rem"
                                    shadow
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };
}
