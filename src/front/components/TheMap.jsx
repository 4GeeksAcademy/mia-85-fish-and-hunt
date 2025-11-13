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
    const [listOpen, setListOpen] = useState(false);

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
    /*                    Rendering for Logged Out User & Visitors                  */
    /* -------------------------------------------------------------------------- */
    if (!isLoggedIn) {
        return (
            <div className="w-100">
                {/* Toggle button for mobile */}
                <button
                    className="btn btn-sm btn-outline-secondary d-lg-none mb-2 w-100"
                    onClick={() => setListOpen(!listOpen)}
                >
                    {listOpen ? "Hide Locations" : "Show Locations"}
                </button>

                <div className="d-flex flex-column flex-lg-row justify-content-center align-items-start gap-3 w-100">
                    {/* LEFT: filterable list (collapsible on mobile) */}
                    <div
                        style={{
                            flex: "0 0 100%",
                            flexBasis: "250px",
                            display: listOpen || window.innerWidth >= 992 ? "block" : "none"
                        }}
                        className="d-lg-flex"
                    >
                        <HotspotList
                            items={hotspots}
                            selectedId={selected?.id}
                            onSelect={setSelected}
                            onFilterChange={setFilter}
                        />
                    </div>
                    {/* RIGHT: map */}
                    <div style={{ width: "100%", height: "auto", minHeight: "300px", flex: "1 1 auto" }}>
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
            <div className="w-100">
                <button className={`btn btn-${btnColor}`} onClick={() => setAddLocation((v) => !v)}>{btnText}</button>
                {addLocation ? (
                    <AddLocation onDone={() => setAddLocation(false)} />
                ) : (
                    <>
                        {/* Toggle button for mobile */}
                        <button
                            className="btn btn-sm btn-outline-secondary d-lg-none mb-2 w-100 mt-3"
                            onClick={() => setListOpen(!listOpen)}
                        >
                            {listOpen ? "Hide Locations" : "Show Locations"}
                        </button>

                        <div className="d-flex flex-column flex-lg-row justify-content-center align-items-start gap-3 w-100 mt-3">
                            {/* LEFT: filterable list (collapsible on mobile) */}
                            <div
                                style={{
                                    flex: "0 0 100%",
                                    flexBasis: "250px",
                                    display: listOpen || window.innerWidth >= 992 ? "block" : "none"
                                }}
                                className="d-lg-flex"
                            >
                                <HotspotList
                                    items={hotspots}
                                    selectedId={selected?.id}
                                    onSelect={setSelected}
                                    onFilterChange={setFilter}
                                />
                            </div>
                            {/* RIGHT: map */}
                            <div style={{ width: "100%", height: "auto", minHeight: "300px", flex: "1 1 auto" }}>
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
                    </>
                )}
            </div>
        );
    };
}