# Tab Swiper

A Chrome extension that helps you manage your open tabs efficiently. Triage each tab one at a time: **Keep**, **Close**, or **Bookmark** to a board. Screenshots are automatically captured and saved with your bookmarked tabs.

## Features

- **Tab Triage UI**: View your open tabs one at a time with live screenshots.
- **Quick Actions**: Keep, Close, or Bookmark each tab.
- **Boards**: Organize bookmarked tabs into named boards (Pinterest-style grid).
- **Thumbnails**: Auto-downscaled screenshots to prevent storage bloat.
- **Local Storage**: All data saved to `chrome.storage.local` — no cloud sync needed.

## Installation

1. Clone this repo or download the extension files.
2. Open `chrome://extensions/` and enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this folder.
4. Click the extension icon to open the popup and start triaging.

## Usage

1. **Popup**: Lists your current tabs. Use Keep, Close, or Bookmark buttons to triage.
2. **Boards**: Click "View Boards" to see all your bookmarked cards organized by board.

## Tech

- **Manifest V3** Chrome extension.
- **Storage**: `chrome.storage.local` (self-contained).
- **Screenshots**: `chrome.tabs.captureVisibleTab()`.
- License: MIT.

---

Made by [@ohshtnvm](https://github.com/ohshtnvm)
