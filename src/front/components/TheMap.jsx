import { useState } from "react";
import HotspotList from "./HotspotList";
import GoogleMap from "../utils/GoogleMap";
import { useHotspots } from "../utils/useHotspots";

export default function TheMap() {
    const { hotspots, loading } = useHotspots();

    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState({
        query: "",
        types: ["fishing", "hunting"],
    });

    const btnColor = visible ? "hunter" : "river";
    const btnText = visible ? "Hide Map" : "Show Map";

    return (
        <div className="container d-flex flex-column justify-content-center align-items-start gap-3">
            <button
                className={`btn btn-${btnColor}`}
                onClick={() => setVisible((v) => !v)}
            >
                {btnText}
            </button>

            {visible && (
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
                                zoom={12}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
