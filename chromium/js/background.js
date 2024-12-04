// URLs and Constants
const dataListURL = "https://raw.githubusercontent.com/Purdue-Innovation-Capstone/browser/refs/heads/main/data/domain_list_clean.csv";
const DEFAULT_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// State Variables
let dataSites = [];
let dataSitesMap = new Map(); // Map to store URL and label pairs
let dataSitesRegex = null;
const approvedUrls = new Map(); // Map to store approved URLs per tab

// Helper Functions
function parseCSVLine(line) {
	const result = [];
	let inQuotes = false;
	let value = '';
	for (let i = 0; i < line.length; i++) {
		const char = line.charAt(i);
		if (char === '"') {
			if (inQuotes && line.charAt(i + 1) === '"') {
				// Escaped quote
				value += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(value);
			value = '';
		} else {
			value += char;
		}
	}
	result.push(value);
	return result;
}

function normalizeUrl(url) {
	try {
		// Add protocol if missing
		if (!/^https?:\/\//i.test(url)) {
			url = `https://${url}`;
		}
		const parsedUrl = new URL(url);
		return parsedUrl.hostname.replace(/^www\./, '') + parsedUrl.pathname;
	} catch (error) {
		console.error("Invalid URL during normalization:", url, error);
		return url; // Fallback to the original URL
	}
}

function extractUrlsAndLabelsFromCSV(text) {
	const lines = text.trim().split('\n');
	const headers = lines[0].split(',');
	const urlIndex = headers.indexOf('url');
	const labelIndex = headers.indexOf('label');

	if (urlIndex === -1 || labelIndex === -1) {
		console.error('Required columns not found in CSV');
		return new Map();
	}

	const map = new Map();
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		const row = parseCSVLine(line);
		if (row.length > urlIndex && row.length > labelIndex) {
			let url = row[urlIndex]?.trim();
			const label = row[labelIndex]?.trim();
			url = normalizeUrl(url); // Normalize URL here
			if (url) {
				map.set(url, label || "Unknown");
			}
		}
	}
	return map;
}

function generateRegexFromList(list) {
	const escapedList = list.map((domain) =>
		domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	);
	return new RegExp(`(${escapedList.join("|")})`, "i");
}

// Fetch and Update Functions
async function fetchDataList() {
	console.log("Fetching data list...");
	try {
		const response = await fetch(dataListURL);
		if (response.ok) {
			const csvText = await response.text();
			dataSitesMap = extractUrlsAndLabelsFromCSV(csvText);
			dataSites = Array.from(dataSitesMap.keys());
			dataSitesRegex = generateRegexFromList(dataSites);
			console.log(`Fetched ${dataSites.length} URLs from data list.`);
			chrome.storage.local.set({
				dataSiteCount: dataSites.length,
				lastUpdated: new Date().toISOString(),
			});
			console.log("Stored data site count:", dataSites.length);
		}
	} catch (error) {
		console.error("Error fetching data list:", error);
	}
}

// UI Update Functions
function updatePageAction(status, tabId) {
	const icons = {
		unsafe: {
			19: "../icons/exclamation_icon_128x128.png",
			38: "../icons/exclamation_icon_128x128.png",
		},
		safe: {
			19: "../icons/grey_circle_128x128.png",
			38: "../icons/grey_circle_128x128.png",
		},
	};

	const icon = icons[status] || icons["safe"];

	chrome.action.setIcon({
		tabId: tabId,
		path: icon,
	});
}

// Site Status Checking
function checkSiteAndUpdatePageAction(tabId, url) {
	if (!url) {
		updatePageAction("safe", tabId);
		return;
	}

	const excludedProtocols = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'moz-extension://', 'file://', 'data:', 'javascript:', 'blob:'];

	// Check if the URL starts with any excluded protocol
	if (excludedProtocols.some(protocol => url.startsWith(protocol))) {
		console.log("Skipping check for special URL:", url);
		updatePageAction("safe", tabId);
		return;
	}

	const normalizedUrl = normalizeUrl(url);
	const isUnsafe = dataSitesMap.has(normalizedUrl);
	const label = dataSitesMap.get(normalizedUrl) || "Unknown";

	const tabApprovedUrls = approvedUrls.get(tabId) || [];
	const isApproved = tabApprovedUrls.includes(url);

	if (isUnsafe && !isApproved) {
		updatePageAction("unsafe", tabId);
		openWarningPage(tabId, url, label);
	} else {
		updatePageAction("safe", tabId);
	}
}

// Event Listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Received message:", message);
	if (message.action === "checkSiteStatus" || message.action === "getLabel") {
		const normalizedUrl = normalizeUrl(message.url.trim());
		console.log("Normalized URL for checking:", normalizedUrl);

		const label = dataSitesMap.get(normalizedUrl) || "Unknown";

		sendResponse({
			status: message.action === "checkSiteStatus" ? (label !== "Unknown" ? "unsafe" : "safe") : null,
			label: label,
		});

		return true; // Indicates asynchronous response handling
	}
});

function openWarningPage(tabId, unsafeUrl, label) {
	const tabApprovedUrls = approvedUrls.get(tabId) || [];
	if (tabApprovedUrls.includes(unsafeUrl)) {
		console.log(`URL ${unsafeUrl} was already approved for tab ${tabId}`);
		return;
	}

	const warningPageUrl = chrome.runtime.getURL(
		`../pub/warning.html?url=${encodeURIComponent(unsafeUrl)}&label=${encodeURIComponent(label)}`
	);
	chrome.tabs.update(tabId, {
		url: warningPageUrl
	});
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url) {
		checkSiteAndUpdatePageAction(tab.id, tab.url);
	}
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		if (tab.url) {
			checkSiteAndUpdatePageAction(tab.id, tab.url);
		}
	});
});

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === "checkUpdate") {
		fetchDataList();
	}
});

chrome.tabs.onRemoved.addListener((tabId) => {
	approvedUrls.delete(tabId);
	chrome.storage.local.remove(`proceedTab_${tabId}`);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "proceedAnyway") {
		const tabId = sender.tab.id;
		const tabApprovedUrls = approvedUrls.get(tabId) || [];
		tabApprovedUrls.push(message.url.trim());
		approvedUrls.set(tabId, tabApprovedUrls);
		sendResponse({
			success: true
		});
	}
});

// Initialize extension
function initializeExtension() {
	try {
		fetchDataList().then(() => {
			chrome.alarms.clearAll(() => {
				chrome.alarms.create("checkUpdate", {
					periodInMinutes: 60,
				});
			});
			console.log("Extension initialized successfully.");
		});
	} catch (error) {
		console.error("Error during extension initialization:", error);
	}
}

initializeExtension();
