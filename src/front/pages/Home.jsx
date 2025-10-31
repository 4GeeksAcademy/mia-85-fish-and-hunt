import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import toast from "react-hot-toast"

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

				<div className="d-flex flex-wrap justify-content-center gap-3">
					<button
						onClick={() => handleButtonClick("Search")}
						className="btn btn-hunter btn-lg"
					>
						<span>Search</span>
					</button>

					<button
						onClick={() => handleButtonClick("Learn More")}
						className="btn btn-outline-hunter btn-lg"
					>
						<span>Learn More</span>
					</button>
				</div>
			</div>
			<button className="btn btn-hunter" onClick={() => toast.success("Yahoo!!")}>Click for toast.success</button>
			<button className="btn btn-river" onClick={() => toast.error("BooHoo!!")}>Click for toast.error</button>
		</div>
	);
};