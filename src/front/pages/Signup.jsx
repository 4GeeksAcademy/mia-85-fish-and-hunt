import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Username:", username);
        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-3">
                    <label htmlFor="exampleInputUsername1" className="form-label">Username</label>
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
                    <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div id="emailHelp" className="form-text">
                        We'll never share your email with anyone else.
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Submit</button>
            </form>
        </div>
    );
};
