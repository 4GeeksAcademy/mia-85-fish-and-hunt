import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<header className="site-header">
			<div className="header-inner">
				<h1 className="site-title">Fish & Hunt</h1>
				<nav className="main-nav">
					<Link href="#fishing" className="nav-link">Fishing</Link>
					<Link href="#hunting" className="nav-link">Hunting</Link>
					<Link href="#login" className="nav-link">Login</Link>
					<Link href="/signup" className="nav-link">Signup</Link>
				</nav>
			</div>
		</header>
	);
};