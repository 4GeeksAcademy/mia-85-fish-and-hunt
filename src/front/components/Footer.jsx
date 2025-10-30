export function Footer() {
	function handleButtonClick(action) {
		console.log("Button clicked:", action);

	}
	return (
		<footer id="contact" className="site-footer">
			<div className="footer-inner">
				<p>&copy; 2025 Fish & Hunt App</p>
				<div className="footer-socials">
					<button
						onClick={handleButtonClick('Social Media: Facebook')}
						className="social-btn"
					>
						<i data-lucide="facebook"></i>
					</button>
					<button
						onClick={handleButtonClick('Social Media: Instagram')}
						className="social-btn"
					>
						<i data-lucide="instagram"></i>
					</button>
					<button
						onClick={handleButtonClick('Social Media: Twitter')}
						className="social-btn"
					>
						<i data-lucide="twitter"></i>
					</button>
				</div>
			</div>
		</footer>
	)
};
