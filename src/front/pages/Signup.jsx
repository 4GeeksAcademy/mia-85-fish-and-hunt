import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import toast from "react-hot-toast"

export const Signup = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    async function sendSignupRequest(e) {
        e.preventDefault();

        try {
            const response = await fetch(`${store.API_BASE_URL}/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    username: username,
                }),
            });

            const body = await response.json();

            if (response.ok) {
                const token = body.token;
                dispatch({
                    type: "authenticate",
                    payload: token,
                });
                toast.success("Welcome!")
                navigate("/")
            } else {
                toast.error(`Signup was not successful: ${body.message || JSON.stringify(body)}`);
            }
        } catch (error) {
            toast.error(`Network error: ${error.message}`);
        }
    }

    return (
        <div className="container d-flex align-items-center justify-content-center">
            <form onSubmit={sendSignupRequest} className="p-4">
                <div className="mb-3">
                    <label htmlFor="exampleInputUsername1" className="form-label text-white">Username</label>
                    <input
                        type="username"
                        className="form-control"
                        id="exampleInputUsername1"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
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
                    <div id="emailHelp" className="form-text text-mutedtone">
                        We'll never share your email with anyone else.
                    </div>
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
                    onClick={(e) => sendSignupRequest(e)}
                    disabled={isProcessing}
                    aria-busy={isProcessing}
                >
                    {isProcessing ? "Submitting" : "Submit"}</button>
            </form>
        </div>
    );
};
