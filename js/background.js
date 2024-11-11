// URLs and Constants
const dataListURL = "https://raw.githubusercontent.com/Purdue-Innovation-Capstone/browser/refs/heads/main/domain_list_clean.csv";
const DEFAULT_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// State Variables
let dataSites = [];
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

function extractUrlsFromCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const urlIndex = headers.indexOf('url');
  if (urlIndex === -1) {
    console.error('URL column not found in CSV');
    return [];
  }
  const urls = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = parseCSVLine(line);
    if (row.length > urlIndex) {
      const url = row[urlIndex];
      if (url) {
        urls.push(normalizeUrl(url.trim()));
      }
    }
  }
  return urls;
}

function normalizeUrl(url) {
  if (!url) {
    console.warn("Received null or undefined URL.");
    return null;
  }

  try {
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const urlObj = new URL(url);
    urlObj.search = "";
    urlObj.hash = "";
    return urlObj.href.replace(/\/+$/, "");
  } catch (error) {
    console.warn(`Invalid URL skipped: ${url}`);
    return null;
  }
}

function extractRootUrl(url) {
  if (!url) {
    console.warn("Received null or undefined URL for root extraction.");
    return null;
  }

  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    console.warn(`Failed to extract root URL from: ${url}`);
    return null;
  }
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
      const urls = extractUrlsFromCSV(csvText);
      dataSites = [...new Set(urls)];
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

  const normalizedUrl = normalizeUrl(url.trim());
  const rootUrl = extractRootUrl(normalizedUrl);

  const isUnsafe = dataSitesRegex?.test(rootUrl) || dataSitesRegex?.test(normalizedUrl);

  const tabApprovedUrls = approvedUrls.get(tabId) || [];
  const isApproved = tabApprovedUrls.includes(normalizedUrl);

  if (isUnsafe && !isApproved) {
    updatePageAction("unsafe", tabId);
    openWarningPage(tabId, url);
  } else {
    updatePageAction("safe", tabId);
  }
}

// Event Listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkSiteStatus") {
    const normalizedUrl = normalizeUrl(message.url.trim());
    const rootUrl = extractRootUrl(normalizedUrl);

    let isUnsafe =
      dataSitesRegex?.test(rootUrl) || dataSitesRegex?.test(normalizedUrl);

    let status = isUnsafe ? "unsafe" : "safe";

    sendResponse({ status: status });
    return true; // Indicates asynchronous response handling
  }
});

function openWarningPage(tabId, unsafeUrl) {
  const tabApprovedUrls = approvedUrls.get(tabId) || [];
  if (tabApprovedUrls.includes(normalizeUrl(unsafeUrl))) {
    console.log(`URL ${unsafeUrl} was already approved for tab ${tabId}`);
    return;
  }

  const warningPageUrl = chrome.runtime.getURL(
    `../pub/warning-page.html?url=${encodeURIComponent(unsafeUrl)}`
  );
  chrome.tabs.update(tabId, { url: warningPageUrl });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    checkSiteAndUpdatePageAction(tabId, tab.url);
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
      const normalizedUrl = normalizeUrl(message.url.trim());
      let tabApprovedUrls = approvedUrls.get(tabId) || [];
      tabApprovedUrls.push(normalizedUrl);
      approvedUrls.set(tabId, tabApprovedUrls);
      sendResponse({ success: true });
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
