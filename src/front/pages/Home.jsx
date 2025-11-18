import TheMap from "../components/TheMap"

export const Home = () => {
	function handleButtonClick(action) {
		console.log("Button clicked:", action);
	}

	return (
		<main className="py-3 py-md-5">
			<div className="container text-center">
				<p className="text-uppercase fw-bold text-hunter mb-2 tracking-widest fs-6 fs-md-5">
					The Essential Outdoorsmen Map
				</p>

				<h2 className="display-6 display-md-4 fw-black text-white mb-2 mb-md-3">
					Track, Navigate, and Connect with<br /><span className="text-ridge">Just a Click</span>.
				</h2>

				<p className="mt-2 mx-auto mb-3 mb-md-4 fs-6 fs-md-5 text-mutedtone" style={{ maxWidth: "90vw", maxWidth: "min(540px, 90vw)" }}>
					Fish &amp; Hunt provides high-definition maps, real-time weather, and
					tools built for fishing and hunting enthusiasts.
				</p>

				<div className="d-flex flex-column align-items-center justify-content-center m-3 m-md-5">
					{/* <div style={{ width: "100%", maxWidth: "800px", height: "auto", minHeight: "300px" }}> */}
					<TheMap />
					{/* </div> */}
				</div>
			</div>
		</main>
	);
};