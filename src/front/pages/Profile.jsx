import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RxAvatar } from "react-icons/rx";
import { HiOutlineMail } from "react-icons/hi";
import { FaLocationDot } from "react-icons/fa6";

export const Profile = () => {
    const [activeTab, setActiveTab] = useState("liked");
    // Redirect to login if not logged in
    const navigate = useNavigate();
    const { store } = useGlobalReducer();
    useEffect(() => {
        if (store.token == undefined) {
            toast.error("Please log in to access your profile.");
            navigate("/login");
        }
    }, [store.token]);

    const [user, setUser] = useState({ username: "", email: "", liked_locations: [], added_locations: [], zipcode: null });
    const [editMode, setEditMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const STORAGE_KEY = "profile_user";
    const base = store.API_BASE_URL || "";
    const url = `${base}/api/user`;

    // Load current user from protected endpoint when token is available
    useEffect(() => {
        async function loadUser() {
            if (!store.token) return;
            try {
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${store.token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (res.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    navigate("/login");
                    return;
                }
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    toast.error(body.message || "Could not load profile");
                    return;
                }
                const data = await res.json();
                // backend returns { user_name, email }
                const mapped = {
                    username: data.user_name || "",
                    email: data.email || "",
                    liked_locations: data.liked_locations || [],
                    added_locations: data.added_locations || [],
                    zipcode: data.zipcode || null,
                };
                setUser(mapped);
                // persist a local copy for cancel behavior
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
                } catch (e) { }
            } catch (e) {
                console.error(e);
                toast.error("Network error while loading profile");
            }
        }
        loadUser();
    }, [store.token]);

    function handleChange(e) {
        const { name, value } = e.target;
        setUser((user) => ({ ...user, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        // basic validation
        if (!user.username || !user.email) {
            toast.error("Please provide username and email.");
            return;
        }
        setIsProcessing(true);
        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${store.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_name: user.username,
                    email: user.email,
                    zipcode: user.zipcode ? Number(user.zipcode) : null,
                }),
            });
        } catch (error) {
            toast.error("Network error while saving profile");
            return;
        }
        setEditMode(false);
        setIsProcessing(false);
        toast.success("Profile saved");
    }

    function handleCancel() {
        // reload from storage to discard unsaved edits
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch (e) { }
        setEditMode(false);
    }

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="card">
                        <div className="card-body text-center">
                            <h5 className="card-title"><span><RxAvatar /></span> {user.username}</h5>
                            {user.zipcode ? <p className="text-muted mb-1"><span><FaLocationDot /></span> {user.zipcode}</p> : null}
                            <p className="text-muted small"><span><HiOutlineMail /></span> {user.email}</p>
                            <div className="mt-3">
                                <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => setEditMode((s) => !s)}
                                >
                                    {editMode ? "Editing..." : "Edit Profile"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card for displaying User's Liked & Added locations (if any) */}
                    <div className="card mt-3 overflow-auto" style={{ maxHeight: "250px" }}>
                        <div className="card-header pb-0">
                            <ul className="nav nav-tabs card-header-tabs" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === "liked" ? "active" : ""}`}
                                        onClick={() => setActiveTab("liked")}
                                        role="tab"
                                    >
                                        Liked Locations
                                    </button>
                                </li>

                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === "added" ? "active" : ""}`}
                                        onClick={() => setActiveTab("added")}
                                        role="tab"
                                    >
                                        Added Locations
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">

                                {/* Liked Locations Tab */}
                                {activeTab === "liked" && (
                                    <>
                                        {(!Array.isArray(user.liked_locations) ||
                                            user.liked_locations.length === 0) && (
                                                <li className="list-group-item">No liked locations</li>
                                            )}

                                        {Array.isArray(user.liked_locations) &&
                                            user.liked_locations.map((loc) => (
                                                <li
                                                    key={loc.id}
                                                    className="list-group-item d-flex justify-content-between align-items-start"
                                                >
                                                    <div>
                                                        <div className="fw-bold">{loc.name}</div>
                                                        <div className="small text-muted">{loc.type}</div>
                                                    </div>

                                                    {loc.directions && (
                                                        <a
                                                            href={loc.directions}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            Directions
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
                                    </>
                                )}

                                {/* Added Locations Tab */}
                                {activeTab === "added" && (
                                    <>
                                        {(!Array.isArray(user.added_locations) ||
                                            user.added_locations.length === 0) && (
                                                <li className="list-group-item">No added locations</li>
                                            )}

                                        {Array.isArray(user.added_locations) &&
                                            user.added_locations.map((loc) => (
                                                <li
                                                    key={loc.id}
                                                    className="list-group-item d-flex justify-content-between align-items-start"
                                                >
                                                    <div>
                                                        <div className="fw-bold">{loc.name}</div>
                                                        <div className="small text-muted">{loc.type}</div>
                                                    </div>

                                                    {loc.directions && (
                                                        <a
                                                            href={loc.directions}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            Directions
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>

                </div>

                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header fw-bold">Profile Details</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">User Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={user.username}
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
                                    <label className="form-label">Zipcode</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="zipcode"
                                        value={user.zipcode || ""}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                        max="99999"
                                        placeholder="Example: 90210"
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={!editMode || isProcessing}>

                                        Save
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={!editMode}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                            <ul className="nav justify-content-center align-items-center">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Go back to Home</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
