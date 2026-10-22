# Chrome New Tab Extension & Homepage Setup Guide

## 1. Overview
This package contains a custom, minimalist Chrome New Tab Extension and standalone homepage featuring a clean aesthetic with an obsidian fluid background, frosted glass search bar, dynamic bookmarks bar connected directly to Chrome's native Bookmarks API, 43-app Google launcher, and Rahul Raj Google Account drawer.

---

## 2. Real Chrome Bookmarks Bar Integration

### How it Works in the Chrome Extension
- When installed as a Chrome Extension, the extension uses the **`chrome.bookmarks` API** (declared in `manifest.json`) to directly fetch your **real Chrome Bookmarks Bar**.
- **Folders & Dropdowns**: Any folder you have on your Chrome bookmarks bar appears as an interactive dropdown folder with all nested links and sub-folders.
- **Direct Bookmarks**: Individual bookmarks display their site favicon and page title.
- **Live Two-Way Sync**: Listens to Chrome bookmark events (`onCreated`, `onRemoved`, `onChanged`, `onMoved`, `onChildrenReordered`). Whenever you add, delete, rename, or reorder bookmarks in Chrome, your new tab bookmarks bar updates instantly.

### In Web / Canvas Preview Mode
- Due to browser security and sandbox privacy rules, standard websites cannot access your local browser database directly.
- The top bar displays default productivity folders and provides a **🔄 Sync Bookmarks** button.
- You can upload an exported `bookmarks.html` file (from Chrome: `Ctrl+Shift+O` -> `⋮` -> **Export bookmarks**) to preview your real bookmarks right inside the web view!

---

## 3. How to Install the Extension in Google Chrome

1. Extract `chrome_homepage_extension.zip` into a folder on your computer.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** and select the extracted folder.
5. Open a new tab (`Ctrl + T` or `Cmd + T`). Your real Chrome bookmarks bar will appear right at the top!
