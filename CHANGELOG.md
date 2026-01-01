# Changelog

All notable changes to the Clipboard History extension are documented here.

## [Unreleased]

*No unreleased changes*

---

## [1.1.0] - 2025-12-31

### Added
- **Transcript to AI command** (`fetch-transcript-ai`) - Fetch YouTube transcript and open with selected AI model
  - Supports ChatGPT, Claude, Perplexity, Gemini, Copilot
  - Auto-copies transcript to clipboard for pasting
  - Files: `src/fetch-transcript-ai.tsx`
- **transcript-utils.ts** - Shared module for transcript fetching logic
  - Extracted common code from `fetch-transcript.ts`
  - Reusable `fetchTranscript()`, `saveTranscript()`, `parseVttToText()` functions
  - Files: `src/transcript-utils.ts`

### Changed
- **Fetch YouTube Transcript** now auto-copies transcript to clipboard after saving
  - Files: `src/fetch-transcript.ts`

---

## [1.0.0] - 2025-12-31

### Added
- **URL detection in Quick Search** - If clipboard contains a URL, opens it directly instead of searching
  - Supports `https://`, `http://`, and `www.` prefixes
  - Files: `src/search-direct.ts`

- **Fetch YouTube Transcript command** (`fetch-transcript`) - Download transcript from YouTube URL in clipboard
  - Uses yt-dlp for subtitle extraction
  - Parses VTT to plain text
  - Configurable save folder and language preferences
  - Files: `src/fetch-transcript.ts`, `package.json`

- **Quick Search feature** - Search clipboard text with configurable engines
  - Quick Search 1-5: Direct search commands bound to specific engines
  - Search Picker 1-3: Grouped search selection UI
  - Manage Search Engines: Full configuration UI for engines, groups, and slots
  - Default engines: Google, YouTube, Amazon UK, Google Maps, Perplexity
  - Files: `src/search-engines.ts`, `src/search-direct.ts`, `src/search-direct-1.ts` through `src/search-direct-5.ts`, `src/search-picker.tsx`, `src/search-picker-1.tsx` through `src/search-picker-3.tsx`, `src/manage-searches.tsx`

- **Cycle Clipboard command** (`cycle`) - Cycle through recent entries with single hotkey
  - Configurable cycle limit (default: 10 entries)
  - Configurable timeout between presses (default: 2000ms)
  - 75-character preview in HUD
  - Files: `src/cycle.ts`, `src/clipboard.ts`

### Changed
- **Cycle preview length** - Increased from 25 to 75 characters for better visibility
- **Cycle limit default** - Increased from 5 to 10 entries

### Removed
- **Static restore hotkeys** - Removed restore-1 through restore-4 commands
  - Replaced by the more flexible Cycle Clipboard command
  - Deleted: `src/restore-1.ts`, `src/restore-2.ts`, `src/restore-3.ts`, `src/restore-4.ts`

---

## [0.1.0] - 2025-12-31

### Added
- **Browse History** (`index`) - View clipboard entries in searchable list
  - Shows text preview and timestamp
  - Click to restore to clipboard
  - Files: `src/index.tsx`
- **Clipboard polling** - Background monitoring for clipboard changes
  - Configurable poll interval (default: 500ms)
  - Configurable max history items (default: 50)
  - Files: `src/clipboard.ts`, `src/watcher.ts`
- **Restore 1-4 commands** - Quick restore hotkeys (later replaced by Cycle)
- Initial project setup with TypeScript, React, and Raycast API
