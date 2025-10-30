

export const Home = () => {
	function handleButtonClick(action) {
		console.log("Button clicked:", action);

	}
	return (
		<>
			<main className="main-hero">
				<div className="hero-inner">
					<p className="center-title">The Essential Outdoorsmen Map</p>
					<h2 className="hero-title">
						Track, Navigate, and Connect with
						<span className="emph">Just a Click</span>.
					</h2>
					<p className="lead">
						Fish & Hunt provides high-definition maps, real-time weather, and
						built for Fishing & Hunting enthusiasts.
					</p>

					<div className="cta-container">
						<button
							onClick={handleButtonClick('Download iOS')}
							className="btn btn-primary"
						>
							<span>Search</span>
						</button>
					</div>
				</div>
			</main>



		</>);
}; 