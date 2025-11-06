import { Link } from "react-router-dom";
import { IsLoggedIn } from "./IsLoggedIn";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect } from "react";


export const Navbar = () => {
	const { store } = useGlobalReducer();
	// useEffect(() => {
	// 	// Any side effects related to the navbar can be handled here
	// }, [store.token]);
	return (
		<header className="py-2 px-1 border-bottom border-black-15 bg-transparent">
			<nav className="navbar navbar-expand-lg navbar-dark">
				<div className="container d-flex align-items-center justify-content-between">
					<Link to="/" className="navbar-brand fw-bold text-hunter">
						Fish &amp; Hunt
					</Link>

					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#mainNav"
						aria-controls="mainNav"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<IsLoggedIn token={store.token} />
				</div>
			</nav>
		</header>
	);
};

