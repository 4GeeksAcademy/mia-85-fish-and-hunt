import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import toast from "react-hot-toast"

export const Login = () => {
    const { store, dispatch } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    async function sendLoginRequest(e) {
        e.preventDefault();
        // Prevent double clicks while a request is in flight
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`${store.API_BASE_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const body = await response.json();
            if (response.ok) {
                const token = body.token;
                dispatch({
                    type: "authenticate",
                    payload: token,

                });
                toast.success("Welcome back!")
                navigate("/");
            } else {
                toast.error(`Login was not successful: ${body.message || JSON.stringify(body)}`);
            }
        } catch (error) {
            toast.error(`Network error: ${error.message}`);
        }
        finally {
            // If the component is still mounted, re-enable interactions.
            // In most successful logout flows we navigate away, so this is harmless.
            setIsProcessing(false);
        }
    }


    return (
        <div className="container d-flex flex-column align-items-center justify-content-center">
            <form onSubmit={sendLoginRequest} className="p-4" style={{ minWidth: "350px" }}>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label text-white">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label text-white">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit"
                    className="btn btn-primary w-100"
                    disabled={isProcessing}
                    aria-busy={isProcessing}
                >{isProcessing ? "Logging In" : "Login"}</button>

            </form>
            <ul className="nav d-flex flex-column align-items-center">
                <li className="nav-item">
                    <Link className="nav-link" to="/signup">Don't have an account? Signup here</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/">Go back to Home</Link>
                </li>
            </ul>
        </div>
    );
};
