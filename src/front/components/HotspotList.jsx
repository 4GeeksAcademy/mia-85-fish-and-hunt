// components/HotspotList.jsx
import { useMemo, useState } from "react";

export default function HotspotList({
    items = [],
    selectedId,
    onSelect,                // (hotspot) => void
    onFilterChange,          // ({query, types}) => void
    types = ["fishing", "hunting"],
    className = "",
}) {
    const [query, setQuery] = useState("");
    const [enabled, setEnabled] = useState(new Set(types)); // all on by default

    function toggleType(t) {
        const next = new Set(enabled);
        next.has(t) ? next.delete(t) : next.add(t);
        setEnabled(next);
        onFilterChange?.({ query, types: [...next] });
    }

    function onQueryChange(e) {
        const q = e.target.value;
        setQuery(q);
        onFilterChange?.({ query: q, types: [...enabled] });
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter(h =>
            enabled.has(h.type) &&
            (q === "" || h.name.toLowerCase().includes(q))
        );
    }, [items, enabled, query]);

    return (
        <div className={`p-3 rounded-3 shadow-sm bg-white ${className}`} style={{ width: 300 }}>
            <div className="d-flex gap-2 mb-2">
                <input
                    className="form-control"
                    placeholder="Search spots…"
                    value={query}
                    onChange={onQueryChange}
                />
            </div>

            <div className="d-flex gap-2 mb-3 flex-wrap">
                {types.map(t => (
                    <button
                        key={t}
                        type="button"
                        className={`badge border ${enabled.has(t) ? "text-bg-primary" : "text-bg-light"}`}
                        onClick={() => toggleType(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="list-group small">
                {filtered.map(h => (
                    <button
                        key={h.id}
                        className={`list-group-item list-group-item-action ${h.id === selectedId ? "active" : ""}`}
                        onClick={() => onSelect?.(h)}
                    >
                        <div className="d-flex justify-content-between">
                            <strong>{h.name}</strong>
                            <span className="text-capitalize">{h.type}</span>
                        </div>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="text-muted text-center py-3">No results</div>
                )}
            </div>
        </div>
    );
}