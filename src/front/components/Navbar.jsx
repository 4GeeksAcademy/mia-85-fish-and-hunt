import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import toast from "react-hot-toast"

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	async function sendLogoutRequest(e) {
		e.preventDefault();
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
		}
	}
	return (
		<header className="py-2 px-1 border-bottom border-black-15 bg-transparent">
			<nav className="navbar navbar-expand-lg navbar-dark">
				<div className="container">
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

					<div className="collapse navbar-collapse" id="mainNav">
						<ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
							{/* Routes use <Link to> */}
							<li className="nav-item">
								<Link to="/login" className="nav-link">Login</Link>
							</li>
							<li className="nav-item">
								<Link to="/signup" className="btn btn-hunter ms-lg-2">Signup</Link>
							</li>
							<button type="submit" className="btn btn-ridge" onClick={(e) => sendLogoutRequest(e)}>Logout</button>
						</ul>
					</div>
				</div>
			</nav>
		</header>
	);
};