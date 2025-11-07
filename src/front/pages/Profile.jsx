import React, { useEffect, useState } from "react";

const STORAGE_KEY = "profile_user";
const ACTIVITY_KEY = "profile_activities";

const defaultActivities = [
    { id: 1, text: "Logged a 5 lb bass", date: "2025-10-01" },
    { id: 2, text: "Posted a fishing tip", date: "2025-09-18" },
];

export default function Profile() {
    const [user, setUser] = useState();
    const [editMode, setEditMode] = useState(false);
    const [activities, setActivities] = useState(defaultActivities);
    const [message, setMessage] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setUser((u) => ({ ...u, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        // basic validation
        if (!user.name || !user.email) {
            setMessage("Please provide name and email.");
            window.setTimeout(() => setMessage(""), 3000);
            return;
        }
        setEditMode(false);
        setMessage("Profile saved");
        window.setTimeout(() => setMessage(""), 2000);
    }

    function handleCancel() {
        // reload from storage to discard unsaved edits
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch (e) { }
        setEditMode(false);
    }

    function addActivitySample() {
        const next = {
            id: Date.now(),
            text: "Shared a new hot spot",
            date: new Date().toISOString().slice(0, 10),
        };
        setActivities((a) => [next, ...a].slice(0, 10));
    }

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="card">
                        <div className="card-body text-center">
                            <div>
                                {user.name}
                            </div>

                            <h5 className="card-title">{user.name}</h5>
                            <p className="text-muted mb-1">{user.location}</p>
                            <p className="text-muted small">{user.email}</p>
                            <div className="mt-3">
                                <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => setEditMode((s) => !s)}
                                >
                                    {editMode ? "Editing..." : "Edit Profile"}
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={addActivitySample}
                                >
                                    Add Activity
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <div className="card-header">Recent activity</div>
                        <ul className="list-group list-group-flush">
                            {activities.length === 0 && (
                                <li className="list-group-item">No recent activity</li>
                            )}
                            {activities.map((it) => (
                                <li key={it.id} className="list-group-item d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="fw-bold">{it.text}</div>
                                        <div className="small text-muted">{it.date}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="card-body">
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setActivities([])}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Profile Details</span>
                        </div>
                        <div className="card-body">
                            {message && (
                                <div className="alert alert-info py-2" role="alert">
                                    {message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">User Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={user.name}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="location"
                                        value={user.location}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                    />
                                </div>

                                {/* <div className="mb-3">
                                    <label className="form-label">Bio</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        name="bio"
                                        value={user.bio}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                    />
                                </div> */}

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={!editMode}>
                                        Save
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={!editMode}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
