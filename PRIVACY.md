# Privacy Policy

**Last updated: May 27, 2026**

GitHub Enhancer is a browser extension that improves the GitHub browsing experience with Material icons, image preview, time formatting, and other UI enhancements.

## Data Collection

GitHub Enhancer **does not collect, store, or transmit** any personal information, browsing history, credentials, or sensitive data. No analytics, cookies, or tracking technologies are used.

The extension only stores the following data locally via Chrome Storage API:

| Data | Storage | Purpose |
|---|---|---|
| Feature toggles | `chrome.storage.sync` | Enable/disable settings per feature |
| User preferences | `chrome.storage.sync` | Time format, button position, threshold, view mode |
| GitHub Token (optional) | `chrome.storage.sync` | Increases API rate limit when provided by user |
| Material icon assets | `chrome.storage.local` | Cached icon styles and mappings from remote CDN |
| Repo size cache | `chrome.storage.local` | Cached file tree sizes via GitHub API (30-minute TTL) |

## Data Usage & Storage

All data is stored locally in the user's browser and is never sent to any external server except as explicitly described in the Permissions & Network section below.

- **Sync storage**: Settings are synchronized across the user's Chrome devices via their Google account. This data persists after uninstall and can be cleared manually from `chrome://extensions`.
- **Local storage**: Cached icon assets and API responses are stored locally only and are automatically cleared upon extension uninstall.
- **Security**: Any GitHub Token provided by the user is stored in `chrome.storage.sync` and protected by Chrome's built-in security mechanisms. It is only included in requests to `api.github.com` for authentication purposes.

## Data Sharing

GitHub Enhancer **does not** share any user data with third parties. The extension has no servers, databases, or backend infrastructure. All data processing occurs entirely within the user's browser.

No personal information is sold, rented, or disclosed to any external party.

## Permissions & Network

The permissions declared in the extension manifest are the minimum required to provide its functionality:

| Permission | Reason |
|---|---|
| `storage` | Save settings and cache data locally |
| `https://github.com/*` | Inject content scripts for UI enhancements |
| `https://api.github.com/*` | Fetch repository and file size information via GitHub REST API |
| `https://rettend.github.io/*` | Download Material icon theme resource files |

Network requests carry no user data except an optional `Authorization` header when the user voluntarily provides a GitHub Token to increase API rate limits. All data obtained via GitHub API is subject to the [GitHub Privacy Policy](https://docs.github.com/privacy).

## Open Source & Contact

This extension is fully open source. You can verify this privacy policy by reviewing the source code or report issues at:

https://github.com/oopsunix/github-enhance-extension
