import { Link } from "react-router-dom";

export const Navbar = () => {
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
							{/* In-page anchors should stay as <a> */}
							<li className="nav-item">
								<a href="#fishing" className="nav-link">Fishing</a>
							</li>
							<li className="nav-item">
								<a href="#hunting" className="nav-link">Hunting</a>
							</li>
							{/* Routes use <Link to> */}
							<li className="nav-item">
								<Link to="/login" className="nav-link">Login</Link>
							</li>
							<li className="nav-item">
								<Link to="/signup" className="btn btn-hunter ms-lg-2">Signup</Link>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</header>
	);
};