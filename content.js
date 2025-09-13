(async function () {
	const getAllowed = async () => {
		const res = await chrome.storage.sync.get({ allowedCountries: [] });
		console.log(
			"[AutoSkip] Allowed countries loaded:",
			res.allowedCountries
		);
		return res.allowedCountries || [];
	};

	function realClick(el) {
		if (!el) return;
		el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	}

	let lastReallyTime = 0; // timestamp of last .really click
	const REALLY_COOLDOWN = 500; // milliseconds

	async function attemptSkip() {
		const allowed = await getAllowed();
		const allowAll = allowed.length === 0;

		const countryDiv = document.querySelector("#countryName");
		if (!countryDiv) {
			console.log("[AutoSkip] #countryName not found yet.");
			return;
		}

		const country = countryDiv.innerText.trim();
		if (!country) {
			console.log("[AutoSkip] Country name not loaded yet.");
			return;
		}

		console.log("[AutoSkip] Detected country:", country);

		if (!allowAll) {
			const matched = allowed.some(
				(a) => a.toLowerCase() === country.toLowerCase()
			);
			if (matched) {
				console.log("[AutoSkip] Country allowed, staying:", country);
			} else {
				console.log(
					"[AutoSkip] Country NOT allowed, attempting skip:",
					country
				);

				const nextBtn = document.querySelector(
					".bottomButton.skipButton.stop, .bottomButton.skipButton.really, .bottomButton.skipButton.new"
				);

				if (nextBtn) {
					const style = window.getComputedStyle(nextBtn);
					if (
						style.pointerEvents !== "none" &&
						style.display !== "none" &&
						!nextBtn.disabled
					) {
						// Handle cooldown for .really button
						if (nextBtn.classList.contains("really")) {
							const now = Date.now();
							if (now - lastReallyTime < REALLY_COOLDOWN) {
								console.log(
									"[AutoSkip] Skipping cooldown active, waiting..."
								);
								return;
							}
							lastReallyTime = now;
						}

						realClick(nextBtn);
						console.log(
							"[AutoSkip] Skip/New/Really button clicked for country:",
							country
						);
					} else {
						console.log(
							"[AutoSkip] Button found but not clickable yet."
						);
					}
				} else {
					console.log(
						"[AutoSkip] Skip/New/Really button not found on page."
					);
				}
			}
		} else {
			console.log("[AutoSkip] Allowed list empty, skipping disabled.");
		}
	}

	const countryDiv = document.querySelector("#countryName");
	if (countryDiv) {
		const observer = new MutationObserver(attemptSkip);
		observer.observe(countryDiv, {
			childList: true,
			characterData: true,
			subtree: true,
		});
	}

	setInterval(attemptSkip, 800);

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area === "sync" && changes.allowedCountries) {
			console.log("[AutoSkip] Allowed countries changed, rechecking.");
			attemptSkip();
		}
	});
})();
