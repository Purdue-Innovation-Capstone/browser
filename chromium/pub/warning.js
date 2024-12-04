document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const unsafeUrl = urlParams.get("url") || "unknown site";

	// Normalize the URL to ensure it matches the background script format
	function normalizeUrl(url) {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.hostname.replace(/^www\./, '') + parsedUrl.pathname;
		} catch (error) {
			console.error("Failed to normalize URL:", url, error);
			return url;
		}
	}

	const normalizedUrl = normalizeUrl(unsafeUrl);
	document.getElementById("unsafeUrl").textContent = unsafeUrl;
	console.log(`Warning page loaded for URL: ${unsafeUrl}, normalized as: ${normalizedUrl}`);

	// Fetch the label for the flagged URL
	chrome.runtime.sendMessage({ action: "getLabel", url: normalizedUrl }, (response) => {
		if (response && response.label) {
			document.getElementById("siteLabel").textContent = response.label;
			console.log(`Received label: ${response.label}`);
		} else {
			document.getElementById("siteLabel").textContent = "unknown classification";
			console.warn("No label received for the flagged URL.");
		}
	});

	document.getElementById("goBack").addEventListener("click", () => {
		console.log("User clicked Go Back.");
		window.history.go(-2);
	});

	document.getElementById("proceed").addEventListener("click", () => {
		if (confirm("Are you sure you want to proceed? This site may be unsafe.")) {
			chrome.runtime.sendMessage(
				{
					action: "proceedAnyway",
					url: unsafeUrl,
				},
				() => {
					console.log("Proceed flag set, navigating to unsafe URL...");
					window.location.href = unsafeUrl;
				}
			);
		}
	});
});
