import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import toast from "react-hot-toast"
import { useEffect, useState } from "react";


export const IsLoggedIn = ({ token }) => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false);
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

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        // If the user is not logged in
        if (token == undefined) {
            setIsLoggedIn(false);
        } else {
            setIsLoggedIn(true)
        }
    }, [token]);

    if (isLoggedIn) {
        return (
            <div className="collapse navbar-collapse" id="mainNav">
                <button
                    type="button"
                    className="btn btn-ridge"
                    onClick={(e) => sendLogoutRequest(e)}
                    disabled={isProcessing}
                    aria-busy={isProcessing}
                >
                    {isProcessing ? "Logging out..." : "Logout"}
                </button>
            </div>
        );
    };

    if (!isLoggedIn) {
        return (
            <div className="collapse navbar-collapse" id="mainNav">
                <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                    {/* Routes use <Link to> */}
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