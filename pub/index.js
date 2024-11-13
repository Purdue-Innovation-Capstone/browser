document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded, preparing to check site status...");
  
    const statusIcon = document.getElementById("status-icon");
    const statusMessage = document.getElementById("status-message");
    const errorMessage = document.getElementById("error-message");
  
    // Helper function to normalize URLs (removes trailing slashes, query parameters, and fragments)
    const normalizeUrl = (url) => {
      const urlObj = new URL(url);
      urlObj.search = ""; // Remove query parameters
      urlObj.hash = ""; // Remove fragments
      return urlObj.href.replace(/\/+$/, ""); // Remove trailing slash only
    };
  
    // Helper function to extract the root domain from a URL
    function extractRootDomain(url) {
      let urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    }
  
    // Function to apply theme based on system preference
    function applyTheme() {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light"
      );
    }
  
    // Apply theme on load
    applyTheme();
  
    // Get the active tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Attempting to retrieve current tab");
      if (chrome.runtime.lastError || !tabs[0] || !tabs[0].url) {
        handleError("No active tab found or URL is unavailable.");
        return;
      }
  
      const currentUrl = normalizeUrl(tabs[0].url);
      const rootDomain = extractRootDomain(currentUrl);
      console.log(`Active tab URL: ${currentUrl}, Root domain: ${rootDomain}`);
  
      // Send a message to the background script to check the site's status
      chrome.runtime.sendMessage(
        { action: "checkSiteStatus", url: currentUrl },
        (response) => {
          console.log("Received response from background script:", response);
          if (chrome.runtime.lastError || !response || !response.status) {
            handleError(
              "Failed to retrieve site status from the background script."
            );
            return;
          }
  
          handleStatusUpdate(response.status, rootDomain);
        }
      );
    });
  
    function handleError(message) {
      console.error(message);
      errorMessage.textContent = `Error: ${message}`;
      updateUI("error", "An error occurred while retrieving the site status.");
    }
  
    /**
     * Updates the UI based on the site status
     * @param {string} status - The status of the site (e.g., "safe", "unsafe")
     * @param {string} displayUrl - The URL or root domain to display in the message
     */
    function handleStatusUpdate(status, displayUrl) {
      if (status === 'unsafe') {
        updateUI(
          "unsafe",
          `${displayUrl} is flagged as <strong>unsafe</strong>. Be cautious when interacting with this site.`
        );
      } else {
        updateUI(
          "safe",
          `${displayUrl} is <strong>safe</strong> to browse.`
        );
      }
    }
  
    /**
     * Updates the UI with the appropriate icon, message, and effects.
     * @param {string} status - The status of the site (e.g., "safe", "unsafe").
     * @param {string} message - The message to display to the user.
     */
    function updateUI(status, message) {
      const icons = {
        unsafe: "../icons/exclamation_icon_128x128.png",
        safe: "../icons/grey_circle_128x128.png",
        error: "../icons/exclamation_icon_128x128.png",
      };
  
      // Update the icon and message
      statusIcon.src = icons[status] || icons["safe"];
      statusMessage.innerHTML = message || "An unknown error occurred.";
  
      // Add a small animation when the status changes
      statusIcon.classList.add("active");
      setTimeout(() => statusIcon.classList.remove("active"), 300);
  
      console.log(`UI updated: ${message}`);
    }
  });  