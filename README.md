# A Minimalist Chrome Homepage Extension

A minimalist custom New Tab experience for Google Chrome.

## Download

**[⬇️ Download the ZIP file](https://github.com/rajvisual/A_minimalist_Chrome_hompage_extension/archive/refs/heads/main.zip)**

This downloads the project source as a ZIP from GitHub. You do not need Git to install it.

> **Note:** This is an unpacked extension installation, not a Chrome Web Store release. You will need to load the extracted folder in Chrome using Developer mode.

## Install it in Google Chrome

1. Click **[Download ZIP](https://github.com/rajvisual/A_minimalist_Chrome_hompage_extension/archive/refs/heads/main.zip)** above.
2. When the download finishes, open your **Downloads** folder.
3. Right-click the downloaded ZIP file and choose **Extract All…**. Extract it to a folder you can find again.
4. Open Chrome and enter `chrome://extensions` in the address bar, then press **Enter**.
5. Turn on **Developer mode** using the switch near the top-right corner.
6. Click **Load unpacked**.
7. Select the extracted project folder—the folder containing `manifest.json`, `newtab.html`, `app.js`, and `style.css`. Do not select the ZIP file itself or the parent Downloads folder.
8. Open a new tab with **Ctrl + T**. The extension should appear as your new-tab page.

### Make it your Chrome homepage

This extension replaces Chrome's **New Tab** page. To open a Home button as well:

1. Open Chrome **Settings**.
2. Go to **Appearance**.
3. Turn on **Show Home button**.

Chrome's Home button normally opens a website URL; this extension is designed to replace the New Tab page, so the Home button may not open this extension directly.

## Update the extension

1. Download the latest ZIP from this repository and extract it into a new folder.
2. Open `chrome://extensions`.
3. Find this extension and click **Remove** if you no longer need the old copy, or use **Reload** after replacing the files in its existing folder.
4. Click **Load unpacked** and select the latest extracted folder if you removed the old copy.

## Project files

- `manifest.json` — Chrome extension configuration
- `newtab.html` — New Tab page structure
- `style.css` — Styling
- `app.js` — Page behavior
- `icons/` — Extension icons

## Development

To contribute or inspect the source code, browse the files in this repository:

**[View the source code on GitHub](https://github.com/rajvisual/A_minimalist_Chrome_hompage_extension)**

## Important

This repository download is a source ZIP. Review the code and requested permissions before installing extensions, especially when using Developer mode. A successful installation here does not mean the extension has been reviewed or published by the Chrome Web Store.
