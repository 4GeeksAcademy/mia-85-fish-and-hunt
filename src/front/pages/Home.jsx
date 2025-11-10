import TheMap from "../components/TheMap"

export const Home = () => {
	function handleButtonClick(action) {
		console.log("Button clicked:", action);
	}

	return (
		<main className="py-5">
			<div className="container text-center">
				<p className="text-uppercase fw-bold text-hunter mb-2 tracking-widest">
					The Essential Outdoorsmen Map
				</p>

				<h2 className="display-4 fw-black text-white mb-3">
					Track, Navigate, and Connect with<br /><span className="text-ridge">Just a Click</span>.
				</h2>

				<p className="mt-2 mx-auto mb-4 fs-5 text-mutedtone maxw-54">
					Fish &amp; Hunt provides high-definition maps, real-time weather, and
					tools built for fishing and hunting enthusiasts.
				</p>

				<div className="d-flex flex-column align-items-center justify-content-center m-5">
					<TheMap />
				</div>
			</div>
		</main>

	);
};