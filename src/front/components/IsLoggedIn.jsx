import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import toast from "react-hot-toast"
import { useEffect, useState } from "react";

export const IsLoggedIn = () => {
    const { store, dispatch } = useGlobalReducer();
    const token = store.token;
    const navigate = useNavigate()

    /* -------------------------------------------------------------------------- */
    /*                         Function to Logout the user                        */
    /* -------------------------------------------------------------------------- */
    async function sendLogoutRequest(e) {
        e.preventDefault();
        // Prevent double clicks while a request is in flight
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`${store.API_BASE_URL}/api/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Logout request received.",
                }),
            });
            const body = await response.json();
            if (response.ok) {
                dispatch({
                    type: "logout",
                });
                toast.success("See you next time!");
                navigate("/");
            } else {
                toast.error(
                    `Logout was not successful: ${body.message || JSON.stringify(body)}`
                );
            }
        } catch (error) {
            toast.error(`Network error: ${error.message}`);
        } finally {
            // If the component is still mounted, re-enable interactions.
            // In most successful logout flows we navigate away, so this is harmless.
            setIsProcessing(false);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*           Logic to conditionally render based on LoggedIn Status           */
    /* -------------------------------------------------------------------------- */
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        // If the user is not logged in
        if (token == undefined) {
            setIsLoggedIn(false);
        } else {
            setIsLoggedIn(true)
        }
    }, [token]);

    /* -------------------------------------------------------------------------- */
    /*                        Rendering for Logged In User                        */
    /* -------------------------------------------------------------------------- */
    if (isLoggedIn) {
        return (
            <div className="collapse navbar-collapse" id="mainNav">
                <button type="submit" className="btn btn-ridge" onClick={(e) => sendLogoutRequest(e)}>Logout</button>
                <Link to="/profile" className="btn btn-outline-light ms-2">Profile</Link>
            </div>
        );
    };

    /* -------------------------------------------------------------------------- */
    /*                        Rendering for Logged Out User                       */
    /* -------------------------------------------------------------------------- */
    if (!isLoggedIn) {
        return (
            <div className="collapse navbar-collapse" id="mainNav">
                <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                    <li className="nav-item">
                        <Link
                            to="/login"
                            className="nav-link"
                        >
                            Login
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/signup"
                            className="btn btn-hunter ms-lg-2"
                        >
                            Signup
                        </Link>
                    </li>
                </ul>
            </div>
        );
    };
};