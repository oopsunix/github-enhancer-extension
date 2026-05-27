<div align="center">
  <img src="src/icons/icon128.png" alt="GitHub Enhance Logo" width="128" height="128">
  <h1 align="center">GitHub Enhance</h1>
  <p align="center">A browser extension that enhances your daily GitHub experience</p>
  <p align="center">
    <strong>English · </strong>
    <a href="README_CN.md">简体中文</a>
  </p>
  <br>
</div>

## 📖 Introduction

**GitHub Enhance** is a Chrome browser extension designed for GitHub, aiming to optimize your GitHub browsing experience through a series of practical features. Whether it's code review, repository browsing, or daily development, it makes operations more efficient, intuitive, and enjoyable.

The extension is lightweight, zero-dependency, and all features can be toggled independently, allowing you to combine them according to your personal preferences.

---

## ✨ Features

### 🎨 Material Icons

Replace default file icons in GitHub file lists with **Material Design** style icons, greatly improving the recognizability of files and folders.

- Supports thousands of file extension and filename mappings
- Supports different icons for folder expanded/collapsed states
- Automatically adapts to GitHub dark/light themes
- Icon data is periodically updated from remote

### 🚩 Back to Top

Provides a always-available **back to top button** on long pages, scrolling smoothly to the top with one click.

- Customizable button position (bottom-right / bottom-left)
- Customizable scroll distance threshold for display
- Smooth scroll animation

### 🕒 Time Format

Replace GitHub's default "relative time" (e.g., _3 days ago_) with **absolute time** in a custom format, giving you a clear view of when events occurred.

- Supports custom time format templates (e.g., `YY-MM-DD HH:mm`, `YYYY-MM-DD HH:mm:ss`)
- Shows full time on mouse hover
- Supports GitHub's Turbolinks navigation and dynamically loaded content

### 🗃️ Image File Layout

Provides **tiled preview mode** and **full-width preview mode** for image files in repository file lists, moving beyond the monotonous list display.

- **List Mode**: Restores the default list view
- **Tiled Mode**: Displays all image previews in a grid layout
- **Full Width Mode**: Images fill the width for quick browsing and filtering
- Automatically identifies image files in directories (supports png/jpg/gif/webp/bmp and other common formats)

### 🖼️ Image Preview

Click on images in README, Issues, PR comments, or code files to open a **large preview** directly on the page, without navigating away or opening a new tab.

- Click to open the preview overlay
- **Scroll to Zoom**: Scroll the mouse wheel to zoom in/out
- **Drag to Pan**: Drag the image to view details when zoomed in
- **Navigate**: Supports previous/next shortcuts (← / →)
- **Download**: One-click download of the currently previewed image
- **Double-click to Reset**: Double-click to restore the original zoom level
- **Keyboard Support**: Esc to close, arrow keys to navigate

### 📁 Repo Size

Display the **total repository size** on the repository page and **individual file sizes** next to each file in the file list, giving you an intuitive understanding of repository size.

- Automatically shows total size at the repository root
- Shows precise size next to each file (B/KB/MB/GB)
- Uses GitHub API to fetch data (supports Personal Access Token configuration to bypass API rate limits)

---

## ⚙️ Configuration & Management

The extension provides an intuitive **popup panel** for centralized management of all features:

- **Feature Toggles**: Each feature can be independently enabled/disabled
- **Parameter Configuration**: Time format template, preview mode, Token, etc. are all customizable
- **Instant Save**: All modifications are automatically saved, no manual confirmation needed

---

## 🧩 Project Structure

```
github-enhance-extension/
├── LICENSE                         # MIT License
├── README.md                       # English documentation
└── src/
    ├── manifest.json               # Extension manifest
    ├── background/
    │   └── service-worker.js       # Background Service Worker (icon data update)
    ├── content-scripts/
    │   ├── back-to-top/            # Back to top functionality
    │   ├── image-file-layout/      # Image file layout switcher
    │   ├── image-preview/          # Image preview modal
    │   ├── material-icons/         # Material icon replacement
    │   ├── repo-size/              # Repository & file size display
    │   └── time-format/            # Relative time formatting
    ├── lib/
    │   ├── api.js                  # GitHub API wrapper
    │   ├── storage.js              # Storage utility functions
    │   └── utils.js                # General utility functions
    ├── icons/
    │   ├── icon16.png              # 16×16 extension icon
    │   ├── icon48.png              # 48×48 extension icon
    │   └── icon128.png             # 128×128 extension icon
    └── popup/
        ├── popup.html              # Popup panel HTML
        ├── popup.css               # Popup panel styles
        └── popup.js                # Popup panel logic
```

---

## 🚀 Installation

### Chrome / Microsoft Edge Web Store

> Coming soon

### Developer Mode Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oopsunix/github-enhance-extension.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** in the top right corner
4. Click **Load unpacked**
5. Select the `src/` folder in the project directory

---

## 🛠 Tech Stack

- **Manifest V3** — Latest Chrome extension specification
- **Vanilla JavaScript** — Zero dependencies, pure native implementation
- **GitHub REST API** — Fetch repository metadata and file information
- **MutationObserver** — Efficiently listen for DOM changes, adapt to dynamically loaded content

---

## 🤝 Contributing

Issues and Pull Requests are welcome to help improve this project!

---

## 📄 License

[Apache License 2.0](LICENSE)

---

<div align="center">
  <p>If you like this project, give it a ⭐ to help others find it!</p>
  <p>Built with ❤️ by <a href="https://github.com/oopsunix">oopsunix</a></p>
</div>