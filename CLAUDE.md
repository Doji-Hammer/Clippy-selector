# Claude Code Instructions

## Change Logging

Always maintain a detailed changelog of all modifications made to this project. Track every change, including small ones, in the CHANGELOG.md file.

For each change, log:
- Date
- What was changed
- Why it was changed
- Files affected

## Lessons Learned

Track challenges encountered and solutions found. If something required multiple attempts or debugging, document the lesson learned so it doesn't need to be rediscovered.

Update the "Lessons Learned" section in this file when encountering:
- Non-obvious behavior
- Gotchas or edge cases
- Things that didn't work as expected
- Useful patterns discovered

---

## Project Overview

This is a Raycast extension for clipboard management and quick search utilities.

**Current Version:** 1.1.0
**Status:** Active development

### Key Commands

| Command | Mode | Description |
|---------|------|-------------|
| Browse History | view | View clipboard entries in searchable list |
| Cycle Clipboard | no-view | Cycle through last 10 entries with repeated presses |
| Quick Search 1-5 | no-view | Search clipboard text or open URLs directly |
| Search Picker 1-3 | view | Pick from search engine groups |
| Manage Search Engines | view | Configure engines, groups, and slots |
| Fetch YouTube Transcript | no-view | Download transcript via yt-dlp |
| Transcript to AI | view | Fetch transcript and open with AI model |

### Architecture

```
src/
├── clipboard.ts          # Clipboard history storage (LocalStorage)
├── search-engines.ts     # Search engine configuration & groups
├── transcript-utils.ts   # YouTube transcript fetching via yt-dlp
├── index.tsx             # Browse History UI
├── cycle.ts              # Cycle through clipboard entries
├── fetch-transcript.ts   # Download transcript command
├── fetch-transcript-ai.tsx # Transcript + AI model selector
├── manage-searches.tsx   # Search engine management UI
├── search-direct.ts      # Direct search logic (with URL detection)
├── search-direct-1..5.ts # Quick Search slot commands
├── search-picker.tsx     # Search group picker UI
├── search-picker-1..3.tsx # Search Picker slot commands
├── utils.ts              # Utility functions
└── watcher.ts            # Clipboard polling
```

### Key Patterns

1. **Slot Pattern**: Commands use numbered slots that read their configuration from LocalStorage at runtime
2. **LocalStorage**: All user configuration stored in LocalStorage (engines, groups, slot assignments)
3. **VTT Parsing**: YouTube transcripts parsed from VTT format to plain text

### Dependencies
- Requires `yt-dlp` for YouTube transcripts: `brew install yt-dlp`

---

## Implementation Status

### Completed Features

- [x] Clipboard history storage and retrieval
- [x] Browse History UI with search
- [x] Cycle Clipboard with configurable limit/timeout
- [x] Quick Search 1-5 with configurable engines
- [x] Search Picker 1-3 with configurable groups
- [x] Manage Search Engines UI (full CRUD)
- [x] URL detection in Quick Search (opens URLs directly)
- [x] Fetch YouTube Transcript via yt-dlp
- [x] Transcript to AI (copy transcript + open AI model)
- [x] Auto-copy transcript to clipboard

### Potential Enhancements

- [ ] Image/file clipboard support
- [ ] Sync across devices
- [ ] Search history for transcripts
- [ ] Custom AI prompts for transcript analysis

---

## Lessons Learned Log

### 2025-12-31

**Raycast preferences are static at build time**
- Dropdown preferences in `package.json` require static data - can't dynamically populate from LocalStorage
- Solution: Store all user configuration in LocalStorage, use numbered "slots" in package.json that read their assignment from storage

**Raycast extensions repo structure**
- When publishing to Raycast Store, the extension lives inside `extensions/extension-name/` in the main repo
- Local development can use any folder structure, but pushing to PR requires copying into the correct path

**GitHub authentication for PRs**
- The Raycast publish CLI authenticates via GitHub OAuth
- If using a separate GitHub account for publishing, that account needs push access to the fork
- PR ownership is tied to the GitHub account, but extension authorship (`author` field) is the Raycast username

**yt-dlp path resolution**
- yt-dlp may be installed in various locations depending on install method (Homebrew, pip, etc.)
- Need to check multiple common paths: `/opt/homebrew/bin/`, `/usr/local/bin/`, `~/.local/bin/`
- Fall back to `which yt-dlp` for PATH lookup

**Raycast command modes**
- `no-view`: Fire-and-forget, shows HUD only
- `view`: Opens a window with React UI
- For cycling/stateful behavior across invocations, use LocalStorage with timestamps to track state

**VTT subtitle parsing**
- Auto-generated YouTube captions have duplicate lines that need deduplication
- Strip HTML tags, timestamps, and WebVTT headers when converting to plain text
- Use temp directories for subtitle downloads, clean up after parsing

**Shared utility modules**
- Extract common functionality into shared modules (e.g., `transcript-utils.ts`)
- Allows code reuse between commands without duplication
