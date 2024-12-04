# Misinformation Awareness Browser Extension

This project aims to help stop the growing spread of misinformation and disinformation in the online community. It provides a browser extension that alerts users when they visit websites flagged for harmful or misleading content, encouraging caution before engaging.

## Purpose

This browser extension is designed to increase awareness about misinformation by warning users when they encounter flagged websites.

## Functionality / Description

The extension works by cross-referencing the URL of websites that users visit with a pre-defined list of flagged domains stored in a `.csv` file. If the site is found in this file, the extension alerts the user:

- **Icon 1**: A **red circle with a white exclamation mark** indicates that the website has been flagged for misinformation or disinformation.
- **Icon 2**: A **gray circle** signals caution for sites with no definitive information in the CSV, reminding users to be vigilant.

### How It Works

1. A script reads entries from a `.csv` file listing websites identified for misinformation.
2. Whenever a user visits a new site, the extension cross-checks the current URL with entries in the `.csv` file.
3. If a match is found, the extension displays a warning icon.
4. When the popup appears, the label for the website will also be provided
5. NOTE: Not all websites are as unsafe. Some popular and usually trust worthy websites will still be flagged due to being on the list. Look at the label on the popup to know what the website is flagged for

## Icons

- **Red Circle with Exclamation**: Appears when the visited website has been flagged for misinformation or disinformation.
- **Gray Circle**: Indicates caution for sites without specific data on misinformation but encourages users to be careful.

## Installation

Follow these steps to install the **Misinformation Awareness Browser Extension** on your browser:

### Step 1: Download the Extension Files

You can get the extension files either by downloading them directly or by cloning the repository. Choose one of the following options:

#### Option A: Download as ZIP (Recommended for Beginners)

1. **Visit the GitHub Repository**: Navigate to the extension's GitHub page.
2. **Download the ZIP File**:
   - Click on the green **Code** button.
   - Select **Download ZIP** from the dropdown menu.
3. **Extract the Files**:
   - Locate the downloaded ZIP file on your computer (usually in the `Downloads` folder).
   - Right-click the ZIP file and select **Extract All** or **Extract Here**, depending on your operating system.
   - Choose a destination folder where the extracted files will be saved.

#### Option B: Clone the Repository Using Git

If you're comfortable using Git:

1. **Ensure Git is Installed**:
   - If you don't have Git installed, download it from the [official website](https://git-scm.com/downloads) and follow the installation instructions.
2. **Open Command Prompt or Terminal**:
   - **Windows**: Press `Win + R`, type `cmd`, and press **Enter**.
   - **macOS/Linux**: Open **Terminal** from your applications.
3. **Navigate to Your Desired Directory**:
   - Use the `cd` command to change directories. For example:

     ```bash
     cd /path/to/your/directory
     ```

4. **Clone the Repository**:
   - Run the following command:

     ```bash
     git clone https://github.com/Purdue-Innovation-Capstone/browser.git
     ```

### Step 2: Open the Extensions Page in Your Browser

1. **Open the Browser**: Launch Google Chrome or Microsoft Edge.
2. **Navigate to Extensions**:
   - In the address bar, type `chrome://extensions/` and press **Enter**.

### Step 3: Enable Developer Mode

1. **Enable Developer Mode**:
   - Find the **Developer mode** toggle switch, usually located in the top-right corner of the Extensions page.
   - Click the toggle to enable it.

### Step 4: Load the Unpacked Extension

1. **Click on Load Unpacked**:
   - A new button labeled **Load unpacked** should appear after enabling Developer mode.
   - Click on it.
2. **Select the Extension Folder**:
   - In the file dialog, navigate to the folder where you extracted or cloned the extension files.
   - Go inside `browser` and click on `chromium`.
   - Click **Select Folder**.

### Step 5: Confirm Installation

1. **Verify the Extension is Added**:
   - The extension should now appear in your list of installed extensions/add-ons.
2. **Check the Extension Icon**:
   - Look for the extension's icon in your browser's toolbar.

### Step 6: Start Using the Extension

1. **No Additional Setup Required**:
   - The extension is now active and will automatically monitor websites you visit.
2. **Stay Alert for Notifications**:
   - If you visit a flagged site, the extension will display the appropriate icon to alert you.

### Troubleshooting

- **Extension Not Appearing?**
  - Ensure you've selected the correct folder that contains the `manifest.json` file.
- **Icons Not Displaying?**
  - Refresh the browser or restart it to ensure the extension loads properly.
- **Issues with Cloning?**
  - Double-check the repository URL and your internet connection.

## Authors

- [Vernika Jain](https://github.com/vernikaj)
- [Sruthi Malisetty](https://github.com/sruthi120304)
- [Jhanvi Mittal](https://github.com/jmittal392)
- [K. Saanvi Sampada](https://github.com/ksampada23)
- [Aniruddh Srivastava](https://github.com/Noir01)
- Adarsh Veerapaneni

## Acknowledgements

- [GitHub with Cleaned Sources and Ratings](https://github.com/JanaLasser/misinformation_domains/tree/main)
